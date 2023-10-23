var router = require('express').Router();
const ldapController = require('../controllers/ldap.controller');

router.get('/get-users-by-manager', ldapController.get_users_by_manager);
module.exports = router;