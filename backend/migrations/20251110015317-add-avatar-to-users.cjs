// migrations/20251106xxxxxx-add-avatar-to-users.cjs
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Đang thêm cột avatar vào bảng Users...');

    await queryInterface.addColumn('Users', 'avatar', {
      type: Sequelize.STRING(255),
      allowNull: true,     // Cho phép NULL
      defaultValue: null   // Mặc định NULL
    });

    console.log('Thêm cột avatar thành công! Dữ liệu cũ giữ nguyên.');
  },

  async down(queryInterface, Sequelize) {
    console.log('Đang xóa cột avatar...');
    await queryInterface.removeColumn('Users', 'avatar');
    console.log('Đã xóa cột avatar.');
  }
};