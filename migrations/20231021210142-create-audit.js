'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Audits', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      auditName: {
        type: Sequelize.STRING
      },
      auditDescription: {
        type: Sequelize.STRING
      },
      auditStartDate: {
        type: Sequelize.DATE
      },
      collected_at:{
        type: Sequelize.DATE
      },
      last_emailed_at:{
        type: Sequelize.DATE
      },
      completed_at:{
        type: Sequelize.DATE
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
    await queryInterface.dropTable('Audits');
  }
};