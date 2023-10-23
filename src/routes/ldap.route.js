var router = require('express').Router();
const ldapController = require('../controllers/ldap.controller');

router.get('/get-employees-by-manager', ldapController.get_employees_by_manager);
module.exports = router;