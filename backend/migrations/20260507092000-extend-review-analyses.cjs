'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ReviewAnalyses', 'aspects', {
      type: Sequelize.JSON,
      allowNull: true
    });

    await queryInterface.addColumn('ReviewAnalyses', 'ensemble_agreement', {
      type: Sequelize.DECIMAL(3, 2),
      allowNull: true
    });

    await queryInterface.addColumn('ReviewAnalyses', 'ensemble_sources', {
      type: Sequelize.JSON,
      allowNull: true
    });

    await queryInterface.addIndex('ReviewAnalyses', ['sentiment_label'], {
      name: 'review_analyses_sentiment_label_idx'
    });

    await queryInterface.addIndex('ReviewAnalyses', ['spam_risk'], {
      name: 'review_analyses_spam_risk_idx'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('ReviewAnalyses', 'review_analyses_sentiment_label_idx');
    await queryInterface.removeIndex('ReviewAnalyses', 'review_analyses_spam_risk_idx');
    await queryInterface.removeColumn('ReviewAnalyses', 'aspects');
    await queryInterface.removeColumn('ReviewAnalyses', 'ensemble_agreement');
    await queryInterface.removeColumn('ReviewAnalyses', 'ensemble_sources');
  }
};
