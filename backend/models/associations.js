// models/associations.js
import User from './User.js';
import Book from './Book.js';
import Author from './Author.js';
import Genre from './Genre.js';
import Publisher from './Publisher.js';
import CartItem from './CartItem.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Review from './Review.js';
import PromoCode from './PromoCode.js';
import Session from './Session.js';
import BookAuthor from './BookAuthor.js';
import BookGenre from './BookGenre.js';
import Wishlist from './Wishlist.js';

// 1. User ↔ CartItem
User.hasMany(CartItem, { foreignKey: 'user_id', onDelete: 'CASCADE' });
CartItem.belongsTo(User, { foreignKey: 'user_id' });

// 2. Book ↔ CartItem
Book.hasMany(CartItem, { foreignKey: 'book_id', onDelete: 'CASCADE' });
CartItem.belongsTo(Book, { foreignKey: 'book_id' });

// 3. User ↔ Order
User.hasMany(Order, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'user_id' });

// 4. Order ↔ OrderItem
Order.hasMany(OrderItem, { foreignKey: 'order_id', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

// 5. Book ↔ OrderItem
Book.hasMany(OrderItem, { foreignKey: 'book_id', onDelete: 'CASCADE' });
OrderItem.belongsTo(Book, { foreignKey: 'book_id' });

// 6. User ↔ Review
User.hasMany(Review, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'user_id' });

// 7. Book ↔ Review
Book.hasMany(Review, { foreignKey: 'book_id', onDelete: 'CASCADE' });
Review.belongsTo(Book, { foreignKey: 'book_id' });

// 8. Order ↔ PromoCode (nullable)
Order.belongsTo(PromoCode, { foreignKey: 'promo_id', allowNull: true });
PromoCode.hasMany(Order, { foreignKey: 'promo_id' });

// 9. User ↔ Session
User.hasMany(Session, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Session.belongsTo(User, { foreignKey: 'user_id' });

// 10. Book ↔ Publisher
Book.belongsTo(Publisher, { foreignKey: 'publisher_id' });
Publisher.hasMany(Book, { foreignKey: 'publisher_id' });

// 11. Book ↔ Author (N:N)
Book.belongsToMany(Author, {
    through: BookAuthor,
    foreignKey: 'book_id',
    otherKey: 'author_id',
    onDelete: 'CASCADE'
});
Author.belongsToMany(Book, {
    through: BookAuthor,
    foreignKey: 'author_id',
    otherKey: 'book_id',
    onDelete: 'CASCADE'
});

// 12. Book ↔ Genre (N:N)
Book.belongsToMany(Genre, {
    through: BookGenre,
    foreignKey: 'book_id',
    otherKey: 'genre_id',
    onDelete: 'CASCADE'
});
Genre.belongsToMany(Book, {
    through: BookGenre,
    foreignKey: 'genre_id',
    otherKey: 'book_id',
    onDelete: 'CASCADE'
});

// 13. User ↔ Wishlist
User.hasMany(Wishlist, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Wishlist.belongsTo(User, { foreignKey: 'user_id' });

// 14. Book ↔ Wishlist
Book.hasMany(Wishlist, { foreignKey: 'book_id', onDelete: 'CASCADE' });
Wishlist.belongsTo(Book, { foreignKey: 'book_id' });

console.log('Tất cả quan hệ đã được thiết lập!');

export default {};