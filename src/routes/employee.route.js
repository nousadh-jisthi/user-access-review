var router = require('express').Router();
const employeeController = require('../controllers/employee.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/get-employees-by-manager', employeeController.get_employees_by_manager);
router.get('/get-my-employees', authMiddleware.isEmployeeLoggedIn, employeeController.get_my_employees);
router.post('/reject-group', authMiddleware.isEmployeeLoggedIn, employeeController.reject_group);
router.get('/home', authMiddleware.isEmployeeLoggedIn, employeeController.get_home);

module.exports = router;