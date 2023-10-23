
const {Audit} = require('../../models')
const auditService = require('../services/audit.service')

async function run_any_pending_audit(){
    try{
        const audit = await auditService.check_pending_audit();
        console.log(audit.id)
        if (audit){
            auditService.collect_audit_data(audit.id);
        }
    }catch(err){
      console.log(err)
    }
}

// TODO: Create scheduler to periodically check for pending audits

module.exports = {
    run_any_pending_audit
};