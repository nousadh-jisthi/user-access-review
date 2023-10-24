const ldapUtils = require('../utils/ldap.utils');
const {Audit} = require('../../models')
const { Op } = require('sequelize')
require('dotenv').config();

async function collect_audit_data(audit_id){
    try{
        await ldapUtils.createLdapConnection(process.env.LDAP_BIND_DN, process.env.LDAP_PASSWORD);
        await ldapUtils.getAllEmployeesWrapper(audit_id);
        await ldapUtils.getAllPermissionGroups(audit_id);

        await Audit.update({collected_at: new Date()}, {where: {id: audit_id}})

        return true;
      }catch(err){
        console.log(err)
        return false;
    }finally{
        ldapUtils.closeLdapConnection();
    
    }
}

async function check_pending_audit() {    
    return new Promise((resolve, reject) => {
        Audit.findOne({where: {
            collected_at: null, 
            auditStartDate:{
                [Op.lte]: new Date()
            } 
        }
    }).then(audit => {
            resolve(audit)
    }).catch(err => {
        console.log(err)
        reject(err)
    });
    });
}

module.exports = {
    collect_audit_data,
    check_pending_audit
};