const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Budget = sequelize.define('Budget', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  limit: { type: DataTypes.FLOAT, allowNull: false },
}, { timestamps: true });

Budget.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Budget, { foreignKey: 'userId' });

module.exports = Budget;