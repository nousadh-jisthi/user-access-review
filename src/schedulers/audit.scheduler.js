
const schedule = require('node-schedule');
const {ScheduledJob} = require('../../models')

const auditUtil = require('../utils/audit.utils')

async function run_any_pending_audit(){
    try{
        const audit = await auditUtil.retrieve_pending_data_collection_audits();
        if (audit){
            auditUtil.collect_audit_data(audit.id);
        }
    }catch(err){
      console.log(err)
    }
}
async function initialize(){
    try{
        scheduledJob = await ScheduledJob.findOne({where: {name: "audit_scheduler"}})
        
        // TODO: Consider including this in initial setup or config file
        // if scheduled job is not in the database, create it
        if (!scheduledJob){
            scheduledJob = await ScheduledJob.create({name: "audit_scheduler", description: "This scheduler uses cron string to decide how often it needs to check for any pending audits for which data needs to be collected.", cronString: "*/1 * * * *"})
        }
        
        const job = schedule.scheduleJob(scheduledJob.cronString, function(){
            run_any_pending_audit();
        });

    }catch(err){
        console.log(err)
    } 
    
}

module.exports = {
    initialize
};