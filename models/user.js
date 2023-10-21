'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsToMany(models.Group, { through: 'UserGroup' });
    }
  }
  User.init({
    auditId: DataTypes.INTEGER,
    dn: DataTypes.STRING,
    cn: DataTypes.STRING,
    manager: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};