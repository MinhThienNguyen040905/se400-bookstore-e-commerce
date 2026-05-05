// migrations/20251220100000-create-wishlists-table.cjs
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Wishlists', {
      wishlist_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'user_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      book_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Books',
          key: 'book_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add unique constraint to prevent duplicate wishlist entries
    await queryInterface.addConstraint('Wishlists', {
      fields: ['user_id', 'book_id'],
      type: 'unique',
      name: 'unique_wishlist'
    });

    console.log('Đã tạo bảng Wishlists thành công');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Wishlists');
    console.log('Đã xóa bảng Wishlists');
  }
};
