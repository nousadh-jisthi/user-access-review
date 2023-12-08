const ldap = require('ldapjs');
const { Employee, PermissionGroup, EmployeeGroup, Audit } = require('../../models');
require('dotenv').config();
const sequelize = require('../../models/index').sequelize;
const { Op } = require("sequelize");
const employeeService = require('../services/employee.service');
const auditUtils = require('../utils/audit.utils');

// TODO: Add middleware for checking if audit is active


async function get_employees_by_manager (req, res, next){
    try{
        const response = await employeeService.employeesUnderManager(req.query.managerDn, req.query.audit_id)
        res.json(response)
    }catch(error){
        next(error)
    }
}

async function get_my_employees (req, res, next){
    try{
        const response = await employeeService.employeesUnderManager(req.session.userDn, req.query.audit_id)
        res.json(response)
    }catch(error){
        console.log(error)
        res.status(500).json({"message": "Server Error"})
    }
}


async function get_home(req, res, next){
    res.render('pages/employee_home', {userDn: req.session.userDn})
}

async function get_audit_employees(req, res, next){
    res.render('pages/audit_employees',{audit_id: req.query.audit_id, userDn: req.session.userDn} )
}

async function post_bulk_update(req, res, next){
    const t = await sequelize.transaction();
    try{
        const auditId = req.body.auditId
        // TODO: Validate user id belongs to manager
        for (let entry of req.body.changes){
            for (let change of entry){
                const userId = change.userId
                const permissionGroupId = change.permissionGroupId
                const isApproved = change.isApproved
                await employeeService.update_permission(auditId, userId, permissionGroupId, isApproved)
            }
        }

        await t.commit();
        await auditUtils.audit_completion_update(auditId)
        res.json({"message": "success"})
    }catch(error){
        await t.rollback();
        console.log(error)
        res.status(500).json({"message": "Server Error"})
    }

}


async function get_on_going_audits_for_manager(req, res, next){
    try{
        const response = await employeeService.on_going_audits_for_manager(req.session.userDn)
        res.json(response)
    }catch(error){
        console.log(error)
        res.status(500).json({"message": "Server Error"})
    }
}

module.exports = {
    get_employees_by_manager,
    get_my_employees,
    get_home,
    get_audit_employees,
    post_bulk_update,
    get_on_going_audits_for_manager,
};