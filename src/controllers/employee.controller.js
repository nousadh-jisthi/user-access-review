const ldap = require('ldapjs');
const { Employee, PermissionGroup, EmployeeGroup, Audit } = require('../../models');
require('dotenv').config();
const sequelize = require('../../models/index').sequelize;
const { Op } = require("sequelize");

// TODO: Add middleware for checking if audit is active

// Function to display all employees by name of manager
async function employeesUnderManager(managerDn, audit_id){
    var response = {"manager": managerDn, "employees": [], groups: {}}

    await Employee.findAll({where: {auditId: audit_id, manager: managerDn}}).then(async function(employees){
        for (var j = 0; j < employees.length; j++){
            var employee = {
                "id": employees[j].id,
                "cn": employees[j].cn,
                "dn": employees[j].dn,
                "manager": employees[j].manager,
                "groups": []
            } 
            // for each user display all the PermissionGroups they are part of
            const groups = await employees[j].getPermissionGroups({where: {auditId: audit_id}})
            for (var k = 0; k < groups.length; k++){
                var status;
                if (groups[k].EmployeeGroup.isApproved == null){
                    status = "pending"
                }else if (groups[k].EmployeeGroup.isApproved == true){
                    status = "approved"
                }else{
                    status = "rejected"
                }
                employee.groups.push({id: groups[k].id, status: status})
                if (!(groups[k].id in response.groups)){
                    // TOOD: Not send unnecessary data
                    response.groups[groups[k].id] = {cn: groups[k].cn}
                }
            }
            response.employees.push(employee)
        }
    })
    console.log(JSON.stringify(response))
    return response
}

// Function to display all users by name of manager
function displayEmployeeByManagers(audit_id){
    Employee.findAll({attributes: ['manager'], group: ['manager'], where: {
        auditId: audit_id
    }}).then(async function(managers){
    console.log(JSON.stringify(managers))
    for (var i = 0; i < managers.length; i++){
    const employees = await Employee.findAll({where: {auditId: audit_id, manager: managers[i].manager}})
    console.log("Manager: " + managers[i].manager);
    for (var j = 0; j < employees.length; j++){
        console.log("* Employee under manager: ", employees[j].cn)
        // for each employee display all the PermissionGroups they are part of
        const groups = await employees[j].getPermissionGroups()
        for (var k = 0; k < groups.length; k++){
        console.log("* * Employee belongs to :", groups[k].cn)
        }
    }
    }
})
}

async function check_manager_review_status(audit_id, managerDn){
    const employees = await Employee.findAll({
        where: {
            manager: managerDn,
            auditId: audit_id,
        },
        include: [
          {
            model: PermissionGroup,
            attributes: [],
            through: {
              attributes: ['isApproved'],
              where: {  
                isApproved: null, 
              },
            },
            required: true,
          },
        ],
      })

    if (employees.length > 0) {
        // The employees with unapproved permissions under the manager are in the employees array
        // console.log('Employees with unapproved permissions:', employees);
        return employees;
    } else {
        // console.log('No employees found for the manager with ID', managerDn);
        return null;
    }
    
}

async function on_going_audits_for_manager(managerDn){
    try{
        const on_going_audits = await Audit.findAll({where: {
            completed_at: null,
            collected_at: {
                [Op.lte]: new Date()
            }
        }})
        const on_going_audits_for_manager = []

        if (on_going_audits){
            for (var i = 0; i < on_going_audits.length; i++){
                const manager_has_employee = await Employee.findOne({where: {auditId: on_going_audits[i].id, manager: managerDn}})
                if (manager_has_employee != null){
                    const ongoing_reviews = await check_manager_review_status(on_going_audits[i].id, managerDn)
                    //console.log(ongoing_reviews)
                    if(ongoing_reviews != null){
                        on_going_audits[i].dataValues.status = "pending"
                    }
                    else{
                        on_going_audits[i].dataValues.status = "completed"
                    }
                    //console.log(on_going_audits[i])
                    on_going_audits_for_manager.push(on_going_audits[i])
                }
            }
        }
        return on_going_audits_for_manager
    }catch(error){
        console.log(error)
        return null
    }
}


async function get_employees_by_manager (req, res, next){
    try{
        const response = await employeesUnderManager(req.query.managerDn, req.query.audit_id)
        res.json(response)
    }catch(error){
        next(error)
    }
}

async function get_my_employees (req, res, next){
    try{
        const response = await employeesUnderManager(req.session.userDn, req.query.audit_id)
        res.json(response)
    }catch(error){
        console.log(error)
        res.status(500).json({"message": "Server Error"})
    }
}


async function get_home(req, res, next){

    res.render('pages/employee_home', {userDn: req.session.userDn})
}

async function get_audit_employees(req, res, next){
    res.render('pages/audit_employees',{audit_id: req.query.audit_id} )
}

async function update_permission(auditId, userId, permissionGroupId, isApproved){
    // Update employee group
    EmployeeGroup.update({isApproved: isApproved}, {where: {auditId: auditId, employeeId: userId, permissionGroupId: permissionGroupId}})
}

async function post_bulk_update(req, res, next){
    const t = await sequelize.transaction();
    try{
        const auditId = req.body.auditId
        // console.log(req.body.changes)
        // TODO: Validate user id belongs to manager
        Object.keys(req.body.changes).forEach(async function(key){
            req.body.changes[key].forEach(async function(change){
                const userId = change.userId
                const permissionGroupId = change.permissionGroupId
                const isApproved = change.isApproved
                console.log(auditId, userId, permissionGroupId, isApproved)
                await update_permission(auditId, userId, permissionGroupId, isApproved)
            });
        });

        await t.commit();
        res.json({"message": "success"})
    }catch(error){
        await t.rollback();
        console.log(error)
        res.status(500).json({"message": "Server Error"})
    }

}


async function get_on_going_audits_for_manager(req, res, next){
    try{
        const response = await on_going_audits_for_manager(req.session.userDn)
        res.json(response)
    }catch(error){
        console.log(error)
        res.status(500).json({"message": "Server Error"})
    }
}

module.exports = {
    get_employees_by_manager,
    get_my_employees,
    get_home,
    get_audit_employees,
    post_bulk_update,
    get_on_going_audits_for_manager,
};