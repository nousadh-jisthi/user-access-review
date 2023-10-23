var router = require('express').Router();
const auditController = require('../controllers/audit.controller');

router.post('/create-audit', auditController.post_create_audit);
router.post('/set-audit-schedule-job', auditController.post_set_audit_schedule_job);
module.exports = router;