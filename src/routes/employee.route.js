var router = require('express').Router();
const employeeController = require('../controllers/employee.controller');

router.get('/get-employees-by-manager', employeeController.get_employees_by_manager);
module.exports = router;