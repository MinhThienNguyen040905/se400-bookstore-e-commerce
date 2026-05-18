import AppError from "../errors/AppError.js";
import orderRepository from "../repositories/orderRepository.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Book from "../models/Book.js";
import CartItem from "../models/CartItem.js";
import User from "../models/User.js";
import { ORDER_STATUS, ORDER_STATUS_LIST } from "../constants/orderStatus.js";
import { sendOrderConfirmation } from "../utils/email.js";
import { buildStatusHistory } from "../utils/orderTimeline.js";
import withTransaction from "../utils/withTransaction.js";
import { calculateOrderPricing } from "./orderPricingService.js";
import {
  decreaseStockForCartItems,
  restoreStockForOrderItems,
  validateCartItemsInStock,
} from "./inventoryService.js";

const sendConfirmationEmail = async ({ user, orderId }) => {
  if (!user?.email) return;

  try {
    const fullOrder =
      await orderRepository.findOrderForConfirmationEmail(orderId);
    const items = fullOrder.OrderItems.map((i) => ({
      title: i.Book.title,
      quantity: i.quantity,
      price: i.price,
    }));

    await sendOrderConfirmation({
      to: user.email,
      name: user.name,
      orderId,
      totalPrice: fullOrder.total_price,
      items,
    });
  } catch (err) {
    console.error("Loi gui mail:", err);
  }
};

const createCodOrder = async ({
  userId,
  promoCode,
  paymentMethod,
  address,
  phone,
}) => {
  if (paymentMethod !== "COD") {
    throw new AppError(
      "API nay chi danh cho thanh toan COD. Vui long dung API VNPay rieng.",
      400,
    );
  }

  if (!address || !phone) {
    throw new AppError("Thieu dia chi hoac so dien thoai", 400);
  }

  const result = await withTransaction(async (transaction) => {
    const user = await User.findByPk(userId, { transaction });
    if (!user) throw new AppError("Khong tim thay User", 404);

    const cartItems = await CartItem.findAll({
      where: { user_id: userId },
      include: [Book],
      transaction,
    });

    if (!cartItems.length) throw new AppError("Gio hang trong", 400);

    const booksById = await validateCartItemsInStock({
      cartItems,
      transaction,
      lock: true,
    });

    const pricingItems = cartItems.map((item) => ({
      quantity: item.quantity,
      Book: booksById.get(item.book_id),
    }));
    const pricing = await calculateOrderPricing({
      cartItems: pricingItems,
      promoCode,
    });

    const order = await Order.create(
      {
        user_id: userId,
        promo_id: pricing.promoId,
        total_price: Math.round(pricing.totalPrice),
        payment_method: "COD",
        status: ORDER_STATUS.DELIVERED,
        address,
        phone,
        payment_status: "pending",
      },
      { transaction },
    );

    for (const item of cartItems) {
      const book = booksById.get(item.book_id);

      await OrderItem.create(
        {
          order_id: order.order_id,
          book_id: item.book_id,
          quantity: item.quantity,
          price: book.price,
        },
        { transaction },
      );
    }

    await decreaseStockForCartItems({ cartItems, transaction });
    await CartItem.destroy({ where: { user_id: userId }, transaction });

    return { order_id: order.order_id, user };
  });

  await sendConfirmationEmail({ user: result.user, orderId: result.order_id });

  return { order_id: result.order_id };
};

const getOrders = async ({ userId }) => orderRepository.findUserOrders(userId);

const getMyOrders = async ({ userId }) => {
  const orders = await orderRepository.findUserOrdersWithTimelineData(userId);

  return orders.map((order) => ({
    order_id: order.order_id,
    total_price: order.total_price,
    status: order.status,
    order_date: order.order_date,
    promo: order.PromoCode
      ? {
          code: order.PromoCode.code,
          discount_percent: order.PromoCode.discount_percent,
        }
      : null,
    order_items: (order.OrderItems || []).map((item) => ({
      order_item_id: item.order_item_id,
      quantity: item.quantity,
      price: item.price,
      book: item.Book
        ? {
            book_id: item.Book.book_id,
            title: item.Book.title,
            cover_image: item.Book.cover_image,
          }
        : null,
    })),
    status_history: buildStatusHistory(order.status, order.order_date),
  }));
};

const getAllOrders = async ({ page = 1, limit = 10 }) => {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 10;
  const offset = (parsedPage - 1) * parsedLimit;

  const { count, rows } = await orderRepository.findAllOrdersPaginated({
    limit: parsedLimit,
    offset,
  });

  return {
    orders: rows,
    pagination: {
      totalItems: count,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage,
      pageSize: parsedLimit,
    },
  };
};

const updateOrderStatus = async ({ orderId, status }) => {
  if (!ORDER_STATUS_LIST.includes(status)) {
    throw new AppError("Trang thai khong hop le", 400);
  }

  const order = await Order.findByPk(orderId);
  if (!order) throw new AppError("Khong tim thay don hang", 404);

  order.status = status;
  await order.save();

  return order;
};

const cancelOrder = async ({ userId, orderId }) => {
  if (!orderId) {
    throw new AppError("Vui long cung cap ma don hang (order_id)", 400);
  }

  return withTransaction(async (transaction) => {
    const order = await orderRepository.findOrderForCancel({
      orderId,
      userId,
      transaction,
    });

    if (!order) {
      throw new AppError("Don hang khong ton tai hoac khong thuoc ve ban", 404);
    }

    if (order.status !== ORDER_STATUS.PROCESSING) {
      throw new AppError("Chi co the huy don hang khi dang xu ly.", 400);
    }

    order.status = ORDER_STATUS.CANCELLED;
    await order.save({ transaction });

    await restoreStockForOrderItems({
      orderItems: order.OrderItems,
      transaction,
    });

    return { order_id: order.order_id };
  });
};

const getOrderById = async ({ orderId, userId, userRole }) => {
  const order = await orderRepository.findOrderDetailById(orderId);

  if (!order) throw new AppError("Don hang khong ton tai", 404);

  if (userRole !== "admin" && order.user_id !== userId) {
    throw new AppError("Ban khong co quyen xem don hang nay", 403);
  }

  return {
    order_id: order.order_id,
    status: order.status,
    total_price: Number(order.total_price),
    payment_method: order.payment_method,
    address: order.address,
    phone: order.phone,
    order_date: order.order_date,
    user: order.User,
    promo: order.PromoCode,
    items: order.OrderItems.map((item) => ({
      order_item_id: item.order_item_id,
      quantity: item.quantity,
      price: Number(item.price),
      book: item.Book,
    })),
    status_history: buildStatusHistory(order.status, order.order_date),
  };
};

export default {
  createCodOrder,
  getOrders,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderById,
};
