const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Finance = sequelize.define('Finance', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.ENUM('income', 'expense'), allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  date: { type: DataTypes.DATEONLY, allowNull: false }
}, { timestamps: true });

Finance.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Finance, { foreignKey: 'userId' });

module.exports = Finance;