"use strict";

const moment = require('moment');

module.exports = function(sqlize, DataTypes) {

  // Define the task.
  let Task = sqlize.define('task', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'userId',
      validate: {
        notEmpty: true
      }
    },
    name: {
      type: DataTypes.STRING,
      field: 'name',
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.STRING,
      field: 'password',
      allowNull: true,
      validate: {
        notEmpty: true
      }
    },
    completedAt: {
      type: DataTypes.DATE,
      field: 'completedAt',
      allowNull: true
    },
    isComplete: {
      type: DataTypes.BOOLEAN,
      field: 'isComplete',
      allowNull: true,
      set(val) {
        if (val) {
          this.setDataValue('completedAt', moment.utc.toDate());
        }
      }
    },
    priority: {
      type: DataTypes.INTEGER,
      field: 'priority',
      allowNull: true
    },
    difficulty: {
      type: DataTypes.INTEGER,
      field: 'difficulty',
      allowNull: true
    },
    dueDate: {
      type: DataTypes.DATE,
      field: 'dueDate',
      allowNull: true
    }
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['name']
      }
    ],
  },
  {
    classMethods: {
      // Define the relationships
      associate(models) {
        Task.belongsTo(models.user);
      }
    }
  }
);

  // Return the task.
  return Task;
};