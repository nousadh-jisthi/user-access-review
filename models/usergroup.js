'use strict';
const {
  Model
} = require('sequelize');
const { User, Group } = require('.');

module.exports = (sequelize, DataTypes) => {
  class UserGroup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserGroup.init({
    auditId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'UserGroup',
  });
  Group.belongsToMany(User, { through: 'UserGroup' });
  User.belongsToMany(Group, { through: 'UserGroup' });

  return UserGroup;
};