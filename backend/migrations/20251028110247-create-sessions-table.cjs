// migrations/20251028120000-create-sessions-table.cjs
'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface.tableExists('Sessions');
    
    if (!tableExists) {
      await queryInterface.createTable('Sessions', {
        session_id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Users',
            key: 'user_id'
          },
          onDelete: 'CASCADE'
        },
        refresh_token: {
          type: DataTypes.STRING(500), // TỐI ƯU: Dùng STRING thay TEXT
          allowNull: false
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false
        },
        createdAt: {
          allowNull: false,
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        },
        updatedAt: {
          allowNull: false,
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        }
      });
    }

    // Add indexes only if they don't exist
    const indexes = [
      { fields: ['user_id'], name: 'sessions_user_id' },
      { fields: ['refresh_token'], name: 'sessions_refresh_token' },
      { fields: ['expires_at'], name: 'sessions_expires_at' }
    ];

    for (const index of indexes) {
      try {
        await queryInterface.addIndex('Sessions', index.fields, { name: index.name });
      } catch (err) {
        // Index already exists, skip
        console.log(`Index ${index.name} already exists, skipping...`);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Sessions');
  }
};