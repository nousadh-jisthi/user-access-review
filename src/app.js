const ldap = require('ldapjs');
const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const app_port = process.env.APP_PORT || 3000;
const app_host = process.env.APP_HOST || 'localhost';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'/views'));

app.use(session({
	secret: process.env.APP_SECRET,
	resave: true,
	saveUninitialized: true
}));1

const { Employee, PermissionGroup, EmployeeGroup } = require('../models');

const employeeRouter = require('./routes/employee.route');
app.use('/employee', employeeRouter);

const auditRouter = require('./routes/audit.route');
app.use('/audit', auditRouter);

const authRouter = require('./routes/auth.route');
app.use('/auth', authRouter);

const auditService = require('./services/audit.service');
//auditService.collect_audit_data(1);


const auditScheduler = require('./schedulers/audit.scheduler');
auditScheduler.initialize();

const server = app.listen( app_port , app_host, function(){
  console.log('Listening on port ' + server.address().port);
});