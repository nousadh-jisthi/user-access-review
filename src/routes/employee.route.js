var router = require('express').Router();
const employeeController = require('../controllers/employee.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/get-employees-by-manager', employeeController.get_employees_by_manager);
router.get('/get-my-employees', authMiddleware.verifyToken, employeeController.get_my_employees);
router.post('/reject-group', authMiddleware.verifyToken, employeeController.reject_group);

module.exports = router;