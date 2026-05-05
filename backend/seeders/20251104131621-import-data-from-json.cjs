// seeders/20251104123456-import-data-from-json.cjs
'use strict';

const fs = require('fs');
const path = require('path');
const dataPath = path.resolve(__dirname, '../data/data_seeder.json');
const data = require(dataPath);

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // 1. Insert Users
      if (data.users && data.users.length > 0) {
        await queryInterface.bulkInsert('Users', data.users.map(user => ({
          ...user,
          createdAt: new Date(),
          updatedAt: new Date()
        })));
      }

      // 2. Insert Authors
      if (data.authors && data.authors.length > 0) {
        await queryInterface.bulkInsert('Authors', data.authors.map(author => ({
          ...author,
          createdAt: new Date(),
          updatedAt: new Date()
        })));
      }

      // 3. Insert Genres
      if (data.genres && data.genres.length > 0) {
        await queryInterface.bulkInsert('Genres', data.genres.map(genre => ({
          ...genre,
          createdAt: new Date(),
          updatedAt: new Date()
        })));
      }

      // 4. Insert Publishers
      if (data.publishers && data.publishers.length > 0) {
        await queryInterface.bulkInsert('Publishers', data.publishers.map(publisher => ({
          ...publisher,
          createdAt: new Date(),
          updatedAt: new Date()
        })));
      }

      // 5. Insert Books
      if (data.books && data.books.length > 0) {
        await queryInterface.bulkInsert('Books', data.books.map(book => ({
          ...book,
          createdAt: new Date(),
          updatedAt: new Date()
        })));
      }

      // 6. Insert BookAuthors (quan hệ N:N)
      if (data.bookAuthors && data.bookAuthors.length > 0) {
        await queryInterface.bulkInsert('BookAuthors', data.bookAuthors.map(ba => ({
          ...ba,
          createdAt: new Date(),
          updatedAt: new Date()
        })));
      }

      // 7. Insert BookGenres (quan hệ N:N)
      if (data.bookGenres && data.bookGenres.length > 0) {
        await queryInterface.bulkInsert('BookGenres', data.bookGenres.map(bg => ({
          ...bg,
          createdAt: new Date(),
          updatedAt: new Date()
        })));
      }

      // 8. Insert CartItems
      if (data.cartItems && data.cartItems.length > 0) {
        await queryInterface.bulkInsert('CartItems', data.cartItems.map(ci => ({
          ...ci,
          createdAt: new Date(),
          updatedAt: new Date()
        })));
      }

      // 9. Insert Orders
      if (data.orders && data.orders.length > 0) {
        await queryInterface.bulkInsert('Orders', data.orders.map(order => ({
          ...order,
          createdAt: new Date(),
          updatedAt: new Date()
        })));
      }

      // 10. Insert OrderItems
      if (data.orderItems && data.orderItems.length > 0) {
        await queryInterface.bulkInsert('OrderItems', data.orderItems.map(oi => ({
          ...oi,
          createdAt: new Date(),
          updatedAt: new Date()
        })));
      }

      // 11. Insert Reviews
      if (data.reviews && data.reviews.length > 0) {
        await queryInterface.bulkInsert('Reviews', data.reviews.map(review => ({
          ...review,
          createdAt: new Date(),
          updatedAt: new Date()
        })));
      }

      // 12. Insert PromoCodes
      if (data.promoCodes && data.promoCodes.length > 0) {
        await queryInterface.bulkInsert('PromoCodes', data.promoCodes.map(promo => ({
          ...promo,
          createdAt: new Date(),
          updatedAt: new Date()
        })));
      }

      console.log('Dữ liệu từ JSON đã được insert thành công!');
    } catch (err) {
      console.error('Lỗi khi insert dữ liệu:', err);
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    // Xóa dữ liệu theo thứ tự ngược lại (bảng phụ trước)
    await queryInterface.bulkDelete('PromoCodes', null, {});
    await queryInterface.bulkDelete('Reviews', null, {});
    await queryInterface.bulkDelete('OrderItems', null, {});
    await queryInterface.bulkDelete('Orders', null, {});
    await queryInterface.bulkDelete('CartItems', null, {});
    await queryInterface.bulkDelete('BookGenres', null, {});
    await queryInterface.bulkDelete('BookAuthors', null, {});
    await queryInterface.bulkDelete('Books', null, {});
    await queryInterface.bulkDelete('Publishers', null, {});
    await queryInterface.bulkDelete('Genres', null, {});
    await queryInterface.bulkDelete('Authors', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};