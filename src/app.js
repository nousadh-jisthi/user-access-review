const ldap = require('ldapjs');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const app_port = process.env.APP_PORT || 3000;
const app_host = process.env.APP_HOST || 'localhost';

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const { Employee, PermissionGroup, EmployeeGroup } = require('../models');
const { get } = require('http');
require('dotenv').config();


const ldapRouter = require('./routes/ldap.route');
app.use('/ldap', ldapRouter);

const server = app.listen( app_port , app_host, function(){
  console.log('Listening on port ' + server.address().port);
});