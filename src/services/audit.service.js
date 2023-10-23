const ldapUtils = require('../utils/ldap.utils');

async function collect_audit_data(audit_id){
    try{
        ldapUtils.createLdapConnection();
        await ldapUtils.getAllEmployeesWrapper(audit_id);
        ldapUtils.getAllPermissionGroups(audit_id);
        return true;
      }catch(err){
        console.log(err)
        return false;
    }
}

module.exports = {
    collect_audit_data
};