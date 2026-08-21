import 'reflect-metadata';
import { Container } from 'inversify';
import { Model } from 'mongoose';
import { TYPES } from './types.js';
import { OrderRepository } from '../modules/orders/infrastructure/persistence/order-repository.interface.js';
import { MongoOrderRepository } from '../modules/orders/infrastructure/persistence/order.repository.js';
import { CreateOrderHandler } from '../modules/orders/application/commands/create-order.handler.js';
import { TransitionOrderHandler } from '../modules/orders/application/commands/transition-order.handler.js';
import { GetOrderHandler } from '../modules/orders/application/queries/get-order.handler.js';
import { ListOrdersHandler } from '../modules/orders/application/queries/list-orders.handler.js';

export function createContainer(orderModel: Model<any>): Container {
  const container = new Container();

  // Register the Mongoose model
  container.bind<Model<any>>(TYPES.OrderModel).toConstantValue(orderModel);

  // Register repository (as Singleton so it uses the same model instance)
  container.bind<OrderRepository>(TYPES.OrderRepository).toDynamicValue(() => {
    return new MongoOrderRepository(orderModel);
  });

  // Register command handlers
  container.bind<CreateOrderHandler>(TYPES.CreateOrderHandler).to(CreateOrderHandler);
  container.bind<TransitionOrderHandler>(TYPES.TransitionOrderHandler).to(TransitionOrderHandler);

  // Register query handlers
  container.bind<GetOrderHandler>(TYPES.GetOrderHandler).to(GetOrderHandler);
  container.bind<ListOrdersHandler>(TYPES.ListOrdersHandler).to(ListOrdersHandler);

  return container;
}
