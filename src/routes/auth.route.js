var router = require('express').Router();
const authController = require('../controllers/auth.controller');

router.post('/employee-login', authController.post_employee_login);
//router.post('/admin-login', authController.post_admin_login);
router.get('/login', function(req, res){
    res.render('pages/login');
  });
router.get('/logout', authController.post_employee_logout);
module.exports = router;