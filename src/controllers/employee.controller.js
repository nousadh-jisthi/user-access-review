const ldap = require('ldapjs');
const { Employee, PermissionGroup, EmployeeGroup } = require('../../models');
require('dotenv').config();

// TODO: Add middleware for checking if audit is active

// Function to display all employees by name of manager
async function employeesUnderManager(managerDn, audit_id){
    var response = {"manager": managerDn, "employees": []}
    await Employee.findAll({where: {auditId: audit_id, manager: managerDn}}).then(async function(employees){
      for (var j = 0; j < employees.length; j++){
        console.log("* Employee under manager: ", employees[j].cn)
        var employee = {
            "cn": employees[j].cn,
            "dn": employees[j].dn,
            "manager": employees[j].manager,
            "groups": []
        } 
        // for each user display all the PermissionGroups they are part of
        const groups = await employees[j].getPermissionGroups({where: {auditId: audit_id}})
        for (var k = 0; k < groups.length; k++){
          //console.log("* * Employee belongs to :", groups[k].cn)
          employee.groups.push(groups[k].cn)
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
        const response = await employeesUnderManager(req.userDn, req.query.audit_id)
        res.json(response)
    }catch(error){
        console.log(error)
        res.status(500).json({"message": "Server Error"})
    }
}

async function reject_group(req, res, next){
    try{
        const employee = await Employee.findOne({where: {dn: req.body.employyeId}})
        if(!employee || employee.manager !== req.userDn){
            return res.status(403).json({"message": "You are not authorized to perform this action"})
        }
        const group = await PermissionGroup.findOne({where: {cn: req.body.groupName}})

        // TODO: Change database model, include approved/rejected column in EmployeeGroup table and here set it as false when it is rejected
        await employee.removePermissionGroup(group)
        res.json({"message": "success"})
    }catch(error){
        res.status(500).json({"message": "Server Error"})
    }
}

async function get_home(req, res, next){

    res.render('pages/home', {userDn: req.session.userDn})
}

module.exports = {
    get_employees_by_manager,
    get_my_employees,
    reject_group,
    get_home
};