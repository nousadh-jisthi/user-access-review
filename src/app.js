const ldap = require('ldapjs');
const express = require('express');

const app = express();
const app_port = process.env.APP_PORT || 3000;
const app_host = process.env.APP_HOST || 'localhost';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { Employee, PermissionGroup, EmployeeGroup } = require('../models');

require('dotenv').config();


const employeeRouter = require('./routes/employee.route');
app.use('/employee', employeeRouter);

const auditRouter = require('./routes/audit.route');
app.use('/audit', auditRouter);

const auditService = require('./services/audit.service');
//auditService.collect_audit_data(1);

const auditScheduler = require('./schedulers/audit.scheduler');
auditScheduler.run_any_pending_audit();

const server = app.listen( app_port , app_host, function(){
  console.log('Listening on port ' + server.address().port);
});