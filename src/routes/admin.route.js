var router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/create-audit', authMiddleware.isAdminLoggedIn,  adminController.post_create_audit);
router.post('/set-audit-schedule-job', authMiddleware.isAdminLoggedIn, adminController.post_set_audit_schedule_job);
router.get('/home', authMiddleware.isAdminLoggedIn, adminController.get_home)
router.get('/all-audits', authMiddleware.isAdminLoggedIn, adminController.get_all_audits)
router.get('/view-audit', authMiddleware.isAdminLoggedIn, adminController.get_view_audit)
router.get('/audit-details', authMiddleware.isAdminLoggedIn, adminController.get_audit_details)
router.get('/audit-report', authMiddleware.isAdminLoggedIn, adminController.get_audit_report)
router.get('/employees-without-managers', authMiddleware.isAdminLoggedIn, adminController.get_employees_without_managers)
router.post('/update-employee-managers', authMiddleware.isAdminLoggedIn, adminController.post_update_employee_managers)
module.exports = router;