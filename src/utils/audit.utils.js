const ldapUtils = require('./ldap.utils');
const {Audit, EmployeeGroup, Manager, Employee} = require('../../models')
const sequelize = require('../../models/index').sequelize;
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
// function to retrieve one audit that needs to be collected
async function retrieve_pending_data_collection_audits() {    
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

async function list_incomplete_audits(){
    return new Promise((resolve, reject) => {
        Audit.findAll({where: {
            completed_at: null, 
            collected_at:{
                [Op.lte]: new Date()
            }, 
        }}).then(audits => {
            resolve(audits)
        }).catch(err => {
            console.log(err)
            reject(err)
        });
    });
}

async function audit_completion_update(audit_id){
    const inprogress = await EmployeeGroup.findOne({where: {auditId: audit_id, isApproved: null}})
    if (inprogress != null){
        return;
    } else{
        const audit = await Audit.findOne({where: {id: audit_id}})
        audit.completed_at = new Date()
        await audit.save()
    }
}

module.exports = {
    collect_audit_data,
    retrieve_pending_data_collection_audits,
    audit_completion_update,
    list_incomplete_audits,
};