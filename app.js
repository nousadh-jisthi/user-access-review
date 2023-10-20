const ldap = require('ldapjs');

require('dotenv').config();

// Configuration for your LDAP server
const ldapOptions = {
  url: 'ldap://'+process.env.LDAP_HOST+':'+process.env.LDAP_PORT, // Replace with your LDAP server URL
  bindDN: process.env.LDAP_BIND_DN, // Replace with your bind DN
  bindCredentials: process.env.LDAP_PASSWORD, // Replace with your bind credentials
};

const client = ldap.createClient(ldapOptions);

client.bind(ldapOptions.bindDN, ldapOptions.bindCredentials, (err) => {
  if (err) {
    console.error('LDAP Bind Error:', err);
  } else {
    console.log('LDAP Bind Successful');
    // Perform LDAP operations here (e.g., search, add, modify, delete)
    // client.search, client.add, client.modify, etc.
    // Retrieve all the users in the LDAP server
    
    var opts = {
        filter: '(objectClass=inetOrgPerson)',  //simple search
        //  filter: '(&(uid=2)(sn=John))',// and search
        //filter: '(|(uid=2)(sn=John)(cn=Smith))', // or search
        scope: 'sub',
        attributes: []
    };

    client.search('ou=users,ou=system', opts, function (err, res) {
        if (err) {
            console.log("Error in search " + err)
        } else {
            res.on('searchRequest', (searchRequest) => {
                console.log('searchRequest: ', searchRequest.messageId);
              });
              res.on('searchEntry', (entry) => {
                console.log('entry: ' + JSON.stringify(entry.pojo));
              });
              res.on('searchReference', (referral) => {
                console.log('referral: ' + referral.uris.join());
              });
              res.on('error', (err) => {
                console.error('error: ' + err.message);
              });
              res.on('end', (result) => {
                console.log('status: ' + result.status);
              });
        }
    });

    // Close the connection when you're done
    /*client.unbind((unbindErr) => {
      if (unbindErr) {
        console.error('LDAP Unbind Error:', unbindErr);
      } else {
        console.log('LDAP Unbind Successful');
      }
    });*/
  }
});


// Handle LDAP client events
client.on('error', (err) => {
  console.error('LDAP Client Error:', err);
});
