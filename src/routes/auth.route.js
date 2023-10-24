var router = require('express').Router();
const authController = require('../controllers/auth.controller');

router.post('/employee-login', authController.post_employee_login);
//router.post('/admin-login', authController.post_admin_login);

module.exports = router;