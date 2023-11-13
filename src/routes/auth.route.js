var router = require('express').Router();
const authController = require('../controllers/auth.controller');

router.get('/login', authController.get_login);
router.post('/employee-login', authController.post_employee_login);
router.post('/admin-login', authController.post_admin_login);
router.post('/admin-logout', authController.post_admin_logout);
router.post('/employee-logout', authController.post_employee_logout);
module.exports = router;