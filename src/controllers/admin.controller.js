
const {Audit, ScheduledJob} = require('../../models')

async function create_audit(audit_name, audit_description, audit_start_date){
    const audit = await Audit.create({auditName: audit_name, auditDescription: audit_description, auditStartDate: audit_start_date})
    return audit.id
}

async function post_create_audit (req, res, next){
    try{
        const {audit_name, audit_description, audit_start_date} = req.body
        const response = await create_audit(audit_name, audit_description, audit_start_date)
        res.json({"message": "Audit created successfully!", "audit_id": response})
    }catch(error){
        console.log(error)
    }
}

async function post_set_audit_schedule_job(req, res, next){
    try{
        const {audit_id, audit_description, cron_string} = req.body
        const scheduledJob = await ScheduledJob.findOne({where: {id: audit_id}})
        if (scheduledJob){
            scheduledJob.cronString = cron_string
            scheduledJob.description = audit_description
            await scheduledJob.save()
            res.json({"message": "Audit schedule updated successfully!"})
        }else{
            res.json({"message": "Audit not found!"})
        }
    }catch(error){
        console.log(error)
        res.json({"message": "Error updating audit schedule!"})
    }
}

async function get_create_audit(req, res, next){
    res.render('pages/create_audit')
}

async function get_home(req, res, next){
    res.render('pages/admin_home', {email: req.session.adminEmail})
}

// TODO: Add changing password, setting names for admin, and the works


module.exports = {
    post_create_audit,
    post_set_audit_schedule_job,
    get_home
};