'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Audit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Audit.init({
    auditName: DataTypes.STRING,
    auditDescription: DataTypes.STRING,
    auditStartDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Audit',
  });
  return Audit;
};