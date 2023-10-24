var router = require('express').Router();
const employeeController = require('../controllers/employee.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/get-employees-by-manager', employeeController.get_employees_by_manager);
router.get('/get-my-employees', authMiddleware.verifyToken, employeeController.get_my_employees);

module.exports = router;