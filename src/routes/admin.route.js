var router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/create-audit', authMiddleware.isAdminLoggedIn,  adminController.post_create_audit);
router.post('/set-audit-schedule-job', authMiddleware.isAdminLoggedIn, adminController.post_set_audit_schedule_job);
router.get('/home', authMiddleware.isAdminLoggedIn, adminController.get_home);

module.exports = router;