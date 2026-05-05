// migrations/20251105150318-fix-session-id-auto-increment.cjs
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Sửa session_id → AUTO_INCREMENT...');

    // 1. Xóa FK tạm thời
    try {
      await queryInterface.removeConstraint('Sessions', 'sessions_ibfk_1');
    } catch (err) {
      console.log('Không tìm thấy FK → bỏ qua');
    }

    // 2. SỬA CỘT: BỎ primaryKey (đã có rồi)
    await queryInterface.changeColumn('Sessions', 'session_id', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false
      // BỎ primaryKey: true → vì đã là PK rồi
    });

    // 3. Tạo lại FK
    await queryInterface.addConstraint('Sessions', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'sessions_ibfk_1',
      references: {
        table: 'Users',
        field: 'user_id'
      },
      onDelete: 'CASCADE'
    });

    console.log('HOÀN TẤT! session_id có AUTO_INCREMENT');
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('Sessions', 'sessions_ibfk_1');
    await queryInterface.changeColumn('Sessions', 'session_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};