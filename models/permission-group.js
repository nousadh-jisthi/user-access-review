'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PermissionGroup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PermissionGroup.belongsToMany(models.Employee, { through: 'EmployeeGroup', foreignKey: 'permissiongroupId' });
    }
  }
  PermissionGroup.init({
    auditId: DataTypes.INTEGER,
    cn: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PermissionGroup',
  });
  
  return PermissionGroup;
};