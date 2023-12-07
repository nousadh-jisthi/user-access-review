'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Employees', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      auditId: {
        type: Sequelize.INTEGER
      },
      dn: {
        type: Sequelize.STRING
      },
      cn: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      manager: {
        type: Sequelize.STRING
      },
      mail:{
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Employees');
  }
};