const ldap = require('ldapjs');
const express = require('express');

const app = express();
const app_port = process.env.APP_PORT || 3000;
const app_host = process.env.APP_HOST || 'localhost';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { Employee, PermissionGroup, EmployeeGroup } = require('../models');

require('dotenv').config();


const ldapRouter = require('./routes/ldap.route');
app.use('/ldap', ldapRouter);

const auditRouter = require('./routes/audit.route');
app.use('/audit', auditRouter);

const server = app.listen( app_port , app_host, function(){
  console.log('Listening on port ' + server.address().port);
});