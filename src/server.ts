import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import mongoose from 'mongoose';
import { createContainer } from './container/inversify.config.js';
import { TYPES } from './container/types.js';
import { loadConfig } from './config/index.js';
import { typeDefs } from './graphql/schema.js';
import { createOrderResolvers } from './modules/orders/infrastructure/graphql/order.resolvers.js';
import { OrderSchema } from './modules/orders/infrastructure/persistence/order.schema.js';
import { CreateOrderHandler } from './modules/orders/application/commands/create-order.handler.js';
import { TransitionOrderHandler } from './modules/orders/application/commands/transition-order.handler.js';
import { GetOrderHandler } from './modules/orders/application/queries/get-order.handler.js';
import { ListOrdersHandler } from './modules/orders/application/queries/list-orders.handler.js';

export async function startServer() {
  const config = loadConfig();

  // Connect to MongoDB
  console.log(`Connecting to MongoDB: ${config.mongodbUri}`);
  await mongoose.connect(config.mongodbUri);
  console.log('MongoDB connected');

  // Create Mongoose model
  const OrderModel = mongoose.model('Order', OrderSchema);

  // Set up IoC container
  const container = createContainer(OrderModel);

  // Get handlers from the container
  const createOrderHandler = container.get<CreateOrderHandler>(TYPES.CreateOrderHandler);
  const transitionOrderHandler = container.get<TransitionOrderHandler>(
    TYPES.TransitionOrderHandler,
  );
  const getOrderHandler = container.get<GetOrderHandler>(TYPES.GetOrderHandler);
  const listOrdersHandler = container.get<ListOrdersHandler>(TYPES.ListOrdersHandler);

  // Create resolvers
  const resolvers = createOrderResolvers(
    createOrderHandler,
    transitionOrderHandler,
    getOrderHandler,
    listOrdersHandler,
  );

  // Create Apollo server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  // Start server
  const { url } = await startStandaloneServer(server, {
    listen: { port: config.port },
  });

  console.log(`🚀 Server ready at ${url}`);
  console.log(`Environment: ${config.nodeEnv}`);

  return { server, url };
}
