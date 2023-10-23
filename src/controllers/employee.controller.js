const ldap = require('ldapjs');
const { Employee, PermissionGroup, EmployeeGroup } = require('../../models');
require('dotenv').config();

// Configuration for your LDAP server
const ldapOptions = {
    url: 'ldap://'+process.env.LDAP_HOST+':'+process.env.LDAP_PORT, // Replace with your LDAP server URL
    bindDN: process.env.LDAP_BIND_DN, // Replace with your bind DN
    bindCredentials: process.env.LDAP_PASSWORD, // Replace with your bind credentials
};

const client = ldap.createClient(ldapOptions);

// Connect to LDAP server
function createLdapConnection() {
  client.bind(ldapOptions.bindDN, ldapOptions.bindCredentials, (err) => {
    if (err) {
      console.error('LDAP Bind Error:', err);
    } else {
      console.log('LDAP Bind Successful');
    }
  });
}

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

// Retrieve all employees from LDAP server
async function getAllEmployees(successCallback, errorCallback) {
    var opts = {
        filter: '(objectClass=inetOrgPerson)',  //simple search
        scope: 'sub',
        attributes: ['sn', 'cn', 'uid', 'manager']
    };
  
    client.search('ou=users,ou=system', opts, function (err, res) {
        if (err) {
            console.log("Error in search " + err)
        } else {
            res.on('searchRequest', (searchRequest) => {
                console.log('searchRequest: ', searchRequest.messageId);
              });
              res.on('searchEntry', (entry) => {
                //console.log('entry: ' + JSON.stringify(entry.pojo));
                parseEmployee(entry);
              });
              res.on('searchReference', (referral) => {
                console.log('referral: ' + referral.uris.join());
              });
              res.on('error', (err) => {
                console.error('error: ' + err.message);
                errorCallback()
              });
              res.on('end', (result) => {
                console.log('status: ' + result.status);
                successCallback()
                // Close the connection when you're done
  
                // Probably don't need to unbind if it is a constant connection
                /*client.unbind((unbindErr) => {
                    if (unbindErr) {
                    console.error('LDAP Unbind Error:', unbindErr);
                    } else {
                    console.log('LDAP Unbind Successful');
                    }
                });*/
              });
        }
    });
    }
  
// Function to parse information of user from entry
function parseEmployee(entry) {
      attributes = entry.pojo.attributes;
      // For loop to go over attributes
      var employee = {}
      employee["dn"] = entry.pojo.objectName
      attributes.forEach(attribute => {
        employee[attribute.type] = attribute.values[0]
      });
      console.log(JSON.stringify(employee))
      Employee.create(employee)
  }
  
// Function to get all the groups from LDAP server
function getAllPermissionGroups(){
    var opts = {
      // TODO: Update filter to include other group object classes
      filter: '(objectClass=groupOfUniqueNames)',
      scope: 'sub',
      attributes: ['cn', 'uniqueMember']
    };
    
    client.search('ou=groups,ou=system', opts, async function (err, res) {
      if (err) {
          console.log("Error in search " + err)
      } else {
          res.on('searchRequest', (searchRequest) => {
              console.log('searchRequest: ', searchRequest.messageId);
            });
            res.on('searchEntry', (entry) => {
              console.log('entry: ' + JSON.stringify(entry.pojo));
              parsePermissionGroup(entry);
            });
            res.on('searchReference', (referral) => {
              console.log('referral: ' + referral.uris.join());
            });
            res.on('error', (err) => {
              console.error('error: ' + err.message);
            });
            await res.on('end', (result) => {
              console.log('status: ' + result.status);
              return result.status
            });
      }
    });
  }
  
function parsePermissionGroup(entry){
    attributes = entry.pojo.attributes;
    // For loop to go over attributes
    var group = {}
    var members = []
    group["dn"] = entry.pojo.objectName
    attributes.forEach(attribute => {
        if (attribute.type == "uniqueMember"){
        members = attribute.values
        }
        else{
        group[attribute.type] = attribute.values[0]
        }  
    });
    console.log(JSON.stringify(group))
    PermissionGroup.create(group).then(async function(group) {
        for (var i = 0; i < members.length; i++){
        console.log(members[i])
        const employee = await Employee.findOne({where: {dn: members[i]}})
        if (employee){
            console.log("Employee found")
            EmployeeGroup.create({employeeId: employee.id, permissiongroupId: group.id})
        }
        }
    });
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

// Handle LDAP client events
client.on('error', (err) => {
    console.error('LDAP Client Error:', err);
});

// From github https://stackoverflow.com/questions/5010288/how-to-make-a-function-wait-until-a-callback-has-been-called-using-node-js
// Is used to make sure that getAllEmployees() is executed before calling the next function.
function getAllEmployeesWrapper() {
    return new Promise((resolve, reject) => {
        getAllEmployees((successResponse) => {
            resolve(successResponse);
        }, (errorResponse) => {
            reject(errorResponse);
        });
    });
}

createLdapConnection();
async function main(){
  try{
    await getAllEmployeesWrapper()
    getAllPermissionGroups();
  }catch(err){
    console.log(err)
  }
}
main()

module.exports = {
    get_employees_by_manager,
};