const Admin = require('../../models').Admin;
const bcrypt = require('bcryptjs');
require('dotenv').config();

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

module.exports = {
    createAdmin
}