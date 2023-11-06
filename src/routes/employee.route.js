var router = require('express').Router();
const employeeController = require('../controllers/employee.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/get-employees-by-manager', employeeController.get_employees_by_manager);
router.get('/get-my-employees', authMiddleware.isEmployeeLoggedIn, employeeController.get_my_employees);
router.get('/home', authMiddleware.isEmployeeLoggedIn, employeeController.get_home);
router.get('/audit-employees', authMiddleware.isEmployeeLoggedIn, employeeController.get_audit_employees);
router.post('/bulk-update', authMiddleware.isEmployeeLoggedIn, employeeController.post_bulk_update);

module.exports = router;