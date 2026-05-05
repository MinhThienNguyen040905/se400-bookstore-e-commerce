'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'payment_status', {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: 'pending',
      comment: 'Trạng thái thanh toán: pending, paid, failed'
    });

    await queryInterface.addColumn('Orders', 'vnpay_transaction_no', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Mã giao dịch VNPay'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'payment_status');
    await queryInterface.removeColumn('Orders', 'vnpay_transaction_no');
  }
};

