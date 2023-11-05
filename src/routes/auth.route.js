var router = require('express').Router();
const authController = require('../controllers/auth.controller');

router.post('/employee-login', authController.post_employee_login);
//router.post('/admin-login', authController.post_admin_login);
router.get('/employee-login', function(req, res){
    res.render('pages/employee_login');
});
router.get('/admin-login', function(req, res){
    res.render('pages/admin_login');
});
router.post('/admin-login', authController.post_admin_login);
router.post('/admin-logout', authController.post_admin_logout);

router.post('/employee-logout', authController.post_employee_logout);
module.exports = router;