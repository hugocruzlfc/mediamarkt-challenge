// IoC container symbol tokens
export const TYPES = {
  // Repositories
  OrderRepository: Symbol.for('OrderRepository'),

  // Command handlers
  CreateOrderHandler: Symbol.for('CreateOrderHandler'),
  TransitionOrderHandler: Symbol.for('TransitionOrderHandler'),

  // Query handlers
  GetOrderHandler: Symbol.for('GetOrderHandler'),
  ListOrdersHandler: Symbol.for('ListOrdersHandler'),

  // Mongoose models
  OrderModel: Symbol.for('OrderModel'),
};
