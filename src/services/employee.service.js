const { Employee, PermissionGroup, EmployeeGroup, Audit } = require('../../models');
const { Op } = require('sequelize')

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
    return response
}

// Function to display all users by name of manager
function displayEmployeeByManagers(audit_id){
    Employee.findAll({attributes: ['manager'], group: ['manager'], where: {
        auditId: audit_id
    }}).then(async function(managers){
    for (var i = 0; i < managers.length; i++){
    const employees = await Employee.findAll({where: {auditId: audit_id, manager: managers[i].manager}})
    for (var j = 0; j < employees.length; j++){
        // for each employee display all the PermissionGroups they are part of
        const groups = await employees[j].getPermissionGroups()
        for (var k = 0; k < groups.length; k++){
        }
    }
    }
})
}

async function pending_manager_reviews(audit_id, managerDn){
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

async function is_manager_review_completed(audit_id, managerDn){
    const hasEmployee = await Employee.findOne({
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
    if (hasEmployee) {
        return false;
    } else {
        return true;
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
                    const isCompleted = await is_manager_review_completed(on_going_audits[i].id, managerDn)
                    on_going_audits[i].dataValues.status = isCompleted ? "completed" : "pending" 
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

async function update_permission(auditId, userId, permissionGroupId, isApproved){
    // Update employee group
    EmployeeGroup.update({isApproved: isApproved}, {where: {auditId: auditId, employeeId: userId, permissionGroupId: permissionGroupId}})
}



module.exports = {
    employeesUnderManager,
    displayEmployeeByManagers,
    pending_manager_reviews,
    is_manager_review_completed,
    on_going_audits_for_manager,
    update_permission,
}