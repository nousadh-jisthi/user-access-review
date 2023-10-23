
const {Audit} = require('../../models')

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

module.exports = {
    post_create_audit
};