const ldap = require('ldapjs');
const { Employee, PermissionGroup, EmployeeGroup } = require('../../models');
require('dotenv').config();

// Configuration for your LDAP server
const ldapOptions = {
    url: 'ldap://'+process.env.LDAP_HOST+':'+process.env.LDAP_PORT, // Replace with your LDAP server URL
    bindDN: process.env.LDAP_BIND_DN, // Replace with your bind DN
    bindCredentials: process.env.LDAP_PASSWORD, // Replace with your bind credentials
};

var client;

// Connect to LDAP server
function createLdapConnection(bindDn, bindCredentials) {
  return new Promise((resolve, reject) => {
    client = ldap.createClient(ldapOptions);
    client.bind(bindDn, bindCredentials, (err) => {
      if (err) {
        console.error('LDAP Bind Error:', err);
        reject(err);
      } else {
        resolve(bindDn);
      }
    });
    
    // Handle LDAP client events
    client.on('error', (err) => {
      console.error('LDAP Client Error:', err);
    });
  });
}

function closeLdapConnection() {
  return new Promise((resolve, reject) => {
    client.unbind((err) => {
      if (err) {
        console.error('LDAP Unbind Error:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Retrieve all employees from LDAP server
async function getAllEmployees(audit_id, successCallback, errorCallback) {
    var opts = {
        filter: '(objectClass=inetOrgPerson)',  //simple search
        scope: 'sub',
        // TODO: Include title in the future
        attributes: ['sn', 'cn', 'uid', 'manager','mail','title' ]
    };
  
    client.search(process.env.BASE_DN, opts, function (err, res) {
        if (err) {
            console.log("Error in search " + err)
        } else {
            res.on('searchRequest', (searchRequest) => {
                //console.log('searchRequest: ', searchRequest.messageId);
              });
              res.on('searchEntry', (entry) => {
                //console.log('entry: ' + JSON.stringify(entry.pojo));
                parseEmployee(entry, audit_id);
              });
              res.on('searchReference', (referral) => {
                //console.log('referral: ' + referral.uris.join());
              });
              res.on('error', (err) => {
                console.error('error: ' + err.message);
                errorCallback()
              });
              res.on('end', (result) => {
                //console.log('status: ' + result.status);
                successCallback()
                // Close the connection when you're done
              });
        }
    });
    }
  
// Function to parse information of user from entry
function parseEmployee(entry, audit_id) {
      attributes = entry.pojo.attributes;
      // For loop to go over attributes
      var employee = {}
      employee["dn"] = entry.pojo.objectName
      employee["auditId"] = audit_id
      attributes.forEach(attribute => {
        employee[attribute.type] = attribute.values[0]
      });
      Employee.create(employee)
  }

// Function to get all the groups from LDAP server
function getAllPermissionGroups(audit_id){
  return new Promise((resolve, reject) => {
    var opts = {
      // TODO: Update filter to include other group object classes
      filter: '(objectClass=groupOfNames)',
      scope: 'sub',
      attributes: ['cn', 'member', 'description']
    };
    
    client.search(process.env.BASE_DN , opts, async function (err, res) {
      if (err) {
          console.log("Error in search " + err)
          reject(err)
      } else {
          res.on('searchRequest', (searchRequest) => {
              //console.log('searchRequest: ', searchRequest.messageId);
            });
            res.on('searchEntry', (entry) => {
              parsePermissionGroup(entry, audit_id);
            });
            res.on('searchReference', (referral) => {
              //console.log('referral: ' + referral.uris.join());
            });
            res.on('error', (err) => {
              console.error('error: ' + err.message);
            });
            await res.on('end', (result) => {
              resolve(result.status)
            });
      }
    });
  });
}
  
function parsePermissionGroup(entry, audit_id){
    attributes = entry.pojo.attributes;
    // For loop to go over attributes
    var group = {}
    var members = []
    group["dn"] = entry.pojo.objectName
    group["auditId"] = audit_id
    attributes.forEach(attribute => {
        if (attribute.type == "member"){
        members = attribute.values
        }
        else{
        group[attribute.type] = attribute.values[0]
        }  
    });

    PermissionGroup.create(group).then(async function(group) {
        for (var i = 0; i < members.length; i++){
        const employee = await Employee.findOne({where: {auditId: audit_id, dn: members[i]}})
        if (employee){
            EmployeeGroup.create({employeeId: employee.id, permissiongroupId: group.id, auditId: audit_id})
        }
        }
    });
}

// From github https://stackoverflow.com/questions/5010288/how-to-make-a-function-wait-until-a-callback-has-been-called-using-node-js
// Is used to make sure that getAllEmployees() is executed before calling the next function.
function getAllEmployeesWrapper(audit_id) {
    return new Promise((resolve, reject) => {
        getAllEmployees(audit_id, (successResponse) => {
            resolve(successResponse);
        }, (errorResponse) => {
            reject(errorResponse);
        });
    });
}



module.exports = {
    createLdapConnection,
    getAllEmployeesWrapper,
    getAllPermissionGroups,
    closeLdapConnection
};