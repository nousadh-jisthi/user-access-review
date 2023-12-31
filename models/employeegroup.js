'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EmployeeGroup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EmployeeGroup.init({
    auditId: DataTypes.INTEGER,
    isApproved: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'EmployeeGroup',
  });

  return EmployeeGroup;
};
