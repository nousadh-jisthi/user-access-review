const schedule = require('node-schedule');
const { Audit, Employee, ScheduledJob} = require('../../models');
const auditUtils = require('../utils/audit.utils');
const employeeService = require('../services/employee.service');
const emailUtils = require('../utils/email.utils');
const { renderFile } = require('ejs');

async function send_any_pending_emails(){
    const incomplete_audits = await auditUtils.list_incomplete_audits();
    console.log(incomplete_audits)
    incomplete_audits.forEach(async (audit) => {
        // Check if email was send for this audit in last 24 hours
        const last_emailed_at = audit.last_emailed_at;
        if (last_emailed_at == null || last_emailed_at < Date.now() - 86400000){
            // Get unique list of managers from employee table using sequelize
            const managerDns = await Employee.findAll({attributes: ['manager'], group: ['manager'], where: {
                auditId: audit.id
            }})
            managerDns.forEach(async (managerDn) => {
                // If manager has not approved/rejected any employee group, send email
                if (managerDn.manager != null){
                    const isCompleted = await employeeService.is_manager_review_completed(audit.id, managerDn.manager)
                    if (isCompleted == false){
                            const manager = await Employee.findOne({where: {dn: managerDn.manager, auditId: audit.id}})
                            const html_data = await renderFile(__dirname+'/../views/pages/email.ejs', {managerDn: manager.dn});
                            emailUtils.sendMail(manager.mail, "User Access Review Pending for Audit "+audit.id,html_data)
                        }
                    }
                });
            Audit.update({last_emailed_at: new Date()}, {where: {id: audit.id}})
        }
    });
}

async function initialize(){
    try {
        let scheduledJob = await ScheduledJob.findOne({where: {name: "email_scheduler"}})
        
        // TODO: Consider including this in initial setup or config file
        // if scheduled job is not in the database, create it
        if(!scheduledJob){
            scheduledJob = await ScheduledJob.create({name: "email_scheduler", description: "This scheduler uses cron string to decide how often it needs to check for emails that needs to be sent out to the managers", cronString: "*/5 * * * *"})
        }

        const job = schedule.scheduleJob(scheduledJob.cronString, function(){
            send_any_pending_emails();
        }); 
    }catch(err){
        console.log(err)
    }
}

module.exports = {
    initialize
};