'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EmployeeGroups', {
      auditId: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      employeeId: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      permissiongroupId: {
        type: Sequelize.INTEGER,
        primaryKey: true      
      },
      isApproved: {
        type: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable('EmployeeGroups');
  }
};