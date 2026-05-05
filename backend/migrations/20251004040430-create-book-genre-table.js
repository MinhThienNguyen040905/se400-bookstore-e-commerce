'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('BookGenres', {
      book_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true, // Thêm vào khóa chính
        references: { model: 'Books', key: 'book_id' },
        onDelete: 'CASCADE'
      },
      genre_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true, // Thêm vào khóa chính
        references: { model: 'Genres', key: 'genre_id' },
        onDelete: 'CASCADE'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('BookGenres');
  }
};
