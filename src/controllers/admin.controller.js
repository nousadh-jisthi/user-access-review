
const { response } = require('express')
const {Audit, ScheduledJob, Employee, PermissionGroup, sequelize} = require('../../models')

async function create_audit(audit_name, audit_description, audit_start_date){
    const audit = await Audit.create({auditName: audit_name, auditDescription: audit_description, auditStartDate: audit_start_date})
    return audit.id
}

async function post_create_audit (req, res, next){
    try{   
        const {audit_name, audit_description, audit_start_date} = req.body
        const response = await create_audit(audit_name, audit_description, audit_start_date)
        // TODO: Add success message
        // redirect to home page
        res.redirect('/admin/home')
    }catch(error){
        console.log(error)
        res.status(500).json({"message": "Server Error!"})
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

async function get_home(req, res, next){
    res.render('pages/admin_home', {email: req.session.adminEmail})
}

// Function to retrieve information about all audits
async function get_all_audits(req, res, next){
    const audits = await Audit.findAll()
    res.json(audits)
}

async function get_audit_details(req, res, next){
    const audit_id = req.query.audit_id
    const audit = await Audit.findOne({where: {id: audit_id}})

    // Get list of managers and manager status
    const managers = await Employee.findAll({
        where: {auditId: audit_id},
        attributes: ['manager', [sequelize.fn('COUNT', sequelize.col('PermissionGroups.EmployeeGroup.isApproved')), 'isApprovedCount']],  
        include: [
            {
                model: PermissionGroup,
                attributes: [],
                through: {
                    attributes: ['isApproved']
                },
                required: true
            }
        ],
        group: ['Employee.id','manager','PermissionGroups.EmployeeGroup.permissiongroupId','isApproved'],
        
    })

    // Counting the number of users that the managers reviewed, and the number of users left to review
    managersMap = {}
    for (let i=0; i<managers.length; i++){
        if(!(managers[i].dataValues.manager in managersMap)){
            managersMap[managers[i].dataValues.manager] = {"reviewed": 0, "notReviewed": 0}
        }
        if(managers[i].dataValues.isApprovedCount > 0){
            managersMap[managers[i].dataValues.manager]["reviewed"] += 1
        }else{
            managersMap[managers[i].dataValues.manager]["notReviewed"] += 1
        }
    }

    res.json(managersMap)
}

async function get_view_audit(req, res, next){
    const audit = await Audit.findOne({where: {id: req.query.audit_id}})
    return res.render('pages/audit_details', {audit: audit})
}

// TODO: Add changing password, setting names for admin, and the works


module.exports = {
    post_create_audit,
    post_set_audit_schedule_job,
    get_home,
    get_all_audits,
    get_view_audit,
    get_audit_details
};