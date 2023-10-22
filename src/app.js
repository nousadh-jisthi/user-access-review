const ldap = require('ldapjs');
const { User, PermissionGroup, UserGroup } = require('../models');
const { get } = require('http');
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

// Retrieve all users from LDAP server
async function getAllUsers() {
  var opts = {
      filter: '(objectClass=inetOrgPerson)',  //simple search
      scope: 'sub',
      attributes: ['sn', 'cn', 'uid', 'manager']
  };

  client.search('ou=users,ou=system', opts, async function (err, res) {
      if (err) {
          console.log("Error in search " + err)
      } else {
          res.on('searchRequest', (searchRequest) => {
              console.log('searchRequest: ', searchRequest.messageId);
            });
            res.on('searchEntry', (entry) => {
              //console.log('entry: ' + JSON.stringify(entry.pojo));
              parseUser(entry);
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
function parseUser(entry) {
    attributes = entry.pojo.attributes;
    // For loop to go over attributes
    var user = {}
    user["dn"] = entry.pojo.objectName
    attributes.forEach(attribute => {
        user[attribute.type] = attribute.values[0]
    });
    console.log(JSON.stringify(user))
    User.create(user)
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
      const user = await User.findOne({where: {dn: members[i]}})
      if (user){
        console.log("User found")
        UserGroup.create({userId: user.id, permissiongroupId: group.id})
      }
    }
  });
  
  
  
}

// Handle LDAP client events
client.on('error', (err) => {
  console.error('LDAP Client Error:', err);
});

createLdapConnection();
getAllUsers();
getAllPermissionGroups();
