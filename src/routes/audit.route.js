var router = require('express').Router();
const auditController = require('../controllers/audit.controller');

router.post('/create-audit', auditController.post_create_audit);
module.exports = router;