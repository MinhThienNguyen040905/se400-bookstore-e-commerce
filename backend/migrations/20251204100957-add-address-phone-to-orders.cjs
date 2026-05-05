// migrations/20251204xxxxxx-add-address-phone-to-orders.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'address', {
      type: Sequelize.STRING(255),
      allowNull: true,        // cho phép NULL vì dữ liệu cũ chưa có
      after: 'payment_method'
    });

    await queryInterface.addColumn('Orders', 'phone', {
      type: Sequelize.STRING(20),
      allowNull: true,
      after: 'address'
    });

    console.log('Đã thêm cột address và phone vào bảng Orders');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'phone');
    await queryInterface.removeColumn('Orders', 'address');
  }
};