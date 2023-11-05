const ldap = require('ldapjs');
const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');
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
}));

app.use(express.static(path.join(__dirname,'public')))

const { Employee, PermissionGroup, EmployeeGroup, Admin } = require('../models');

const employeeRouter = require('./routes/employee.route');
app.use('/employee', employeeRouter);

const adminRouter = require('./routes/admin.route');
app.use('/admin', adminRouter);

const authRouter = require('./routes/auth.route');
app.use('/auth', authRouter);

const auditService = require('./services/audit.service');
//auditService.collect_audit_data(1);


const auditScheduler = require('./schedulers/audit.scheduler');
auditScheduler.initialize();

// TODO: Move this section to admin utils
// Create admin user if not exists
function createAdmin(){
	Admin.findAll().then(function(admins){
		if(admins.length == 0){
			passwordHash = bcrypt.hashSync(process.env.ADMIN_PASS, 10);
			Admin.create({
				email: process.env.ADMIN_EMAIL,
				password: passwordHash
			});
		}
	});
}
createAdmin();

const server = app.listen( app_port , app_host, function(){
  console.log('Listening on port ' + server.address().port);
});