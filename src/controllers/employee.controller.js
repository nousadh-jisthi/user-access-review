const ldap = require('ldapjs');
const { Employee, PermissionGroup, EmployeeGroup } = require('../../models');
require('dotenv').config();


// Function to display all employees by name of manager
async function employeesUnderManager(managerDn){
    var response = {"manager": managerDn, "employees": []}
    await Employee.findAll({where: {manager: managerDn}}).then(async function(employees){
      for (var j = 0; j < employees.length; j++){
        console.log("* Employee under manager: ", employees[j].cn)
        var employee = {
            "cn": employees[j].cn,
            "dn": employees[j].dn,
            "manager": employees[j].manager,
            "groups": []
        } 
        // for each user display all the PermissionGroups they are part of
        const groups = await employees[j].getPermissionGroups()
        for (var k = 0; k < groups.length; k++){
          //console.log("* * Employee belongs to :", groups[k].cn)
          employee.groups.push(groups[k].cn)
        }
        response.employees.push(employee)
        console.log(JSON.stringify(response))
      }

    })
    console.log(JSON.stringify(response))
    return response
}
  
// Function to display all users by name of manager
function displayEmployeeByManagers(){
    Employee.findAll({attributes: ['manager'], group: ['manager']}).then(async function(managers){
    console.log(JSON.stringify(managers))
    for (var i = 0; i < managers.length; i++){
    const employees = await Employee.findAll({where: {manager: managers[i].manager}})
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
        const response = await employeesUnderManager(req.query.managerDn)
        res.json(response)
    }catch(error){
        next(error)
    }
}


module.exports = {
    get_employees_by_manager,
};