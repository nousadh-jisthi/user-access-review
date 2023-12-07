const ldap = require('ldapjs');
const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
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
app.use(flash());

app.use(express.static(path.join(__dirname,'public')))

const { Employee, PermissionGroup, EmployeeGroup, Admin } = require('../models');

try{
	const employeeRouter = require('./routes/employee.route');
	app.use('/employee', employeeRouter);
}catch(e){
	console.log(e);
}

try{
	const adminRouter = require('./routes/admin.route');
	app.use('/admin', adminRouter);
}catch(e){
	console.log(e);
}

try{
	const authRouter = require('./routes/auth.route');
	app.use('/auth', authRouter);
}catch(e){
	console.log(e);
}

try{
	const auditScheduler = require('./schedulers/audit.scheduler');
	auditScheduler.initialize();
}catch(e){
	console.log(e);
}

try{
	const emailScheduler = require('./schedulers/email.scheduler');
	emailScheduler.initialize();
}catch(e){
	console.log(e);
}


try{
	const adminUtils = require('./utils/admin.utils');
	adminUtils.createAdmin();
}catch(e){
	console.log(e);
}

app.get('/', async (req, res) => {
	res.redirect('/auth/login');
});

const server = app.listen( app_port , app_host, function(){
  console.log('Listening on port ' + server.address().port);
});