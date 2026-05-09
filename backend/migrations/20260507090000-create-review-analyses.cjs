'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ReviewAnalyses', {
      analysis_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      review_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Reviews',
          key: 'review_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sentiment_label: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      sentiment_score: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false
      },
      confidence: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false
      },
      summary: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      signals: {
        type: Sequelize.JSON,
        allowNull: true
      },
      spam_risk: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'low'
      },
      spam_reasons: {
        type: Sequelize.JSON,
        allowNull: true
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
        defaultValue: 'review-sentiment-v1'
      },
      raw_response: {
        type: Sequelize.JSON,
        allowNull: true
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
    await queryInterface.dropTable('ReviewAnalyses');
  }
};
