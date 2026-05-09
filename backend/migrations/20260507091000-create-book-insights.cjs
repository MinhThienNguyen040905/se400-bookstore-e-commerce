'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BookInsights', {
      insight_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      book_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Books',
          key: 'book_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      summary: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      positive_points: {
        type: Sequelize.JSON,
        allowNull: true
      },
      negative_points: {
        type: Sequelize.JSON,
        allowNull: true
      },
      reader_fit: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      recommendation_hint: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sentiment_distribution: {
        type: Sequelize.JSON,
        allowNull: true
      },
      review_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      provider: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'fallback'
      },
      model: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      prompt_version: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'book-insight-v1'
      },
      generated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('BookInsights');
  }
};
