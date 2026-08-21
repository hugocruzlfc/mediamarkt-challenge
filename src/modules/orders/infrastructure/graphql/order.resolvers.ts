import { GraphQLError } from 'graphql';
import { CreateOrderCommand } from '../../application/commands/create-order.command.js';
import { TransitionOrderCommand } from '../../application/commands/transition-order.command.js';
import { GetOrderQuery } from '../../application/queries/get-order.query.js';
import { ListOrdersQuery } from '../../application/queries/list-orders.query.js';
import { CreateOrderHandler } from '../../application/commands/create-order.handler.js';
import { TransitionOrderHandler } from '../../application/commands/transition-order.handler.js';
import { GetOrderHandler } from '../../application/queries/get-order.handler.js';
import { ListOrdersHandler } from '../../application/queries/list-orders.handler.js';
import { DomainError } from '../../domain/errors.js';
import { Order } from '../../domain/order.entity.js';

// Map domain errors to GraphQL errors with stable extensions.code
function mapDomainError(error: unknown): GraphQLError {
  if (error instanceof DomainError) {
    return new GraphQLError(error.message, {
      extensions: {
        code: error.code,
      },
    });
  }
  if (error instanceof Error) {
    return new GraphQLError(error.message, {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
  return new GraphQLError('An unknown error occurred', {
    extensions: {
      code: 'INTERNAL_SERVER_ERROR',
    },
  });
}

function serializeOrder(order: Order) {
  return {
    id: order.id,
    state: order.state,
    customer: order.customer,
    lineItems: order.lineItems,
    assignedEmployee: order.assignedEmployee,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export function createOrderResolvers(
  createOrderHandler: CreateOrderHandler,
  transitionOrderHandler: TransitionOrderHandler,
  getOrderHandler: GetOrderHandler,
  listOrdersHandler: ListOrdersHandler,
) {
  return {
    Query: {
      async order(_: unknown, args: { id: string }) {
        try {
          const order = await getOrderHandler.execute(new GetOrderQuery(args.id));
          return serializeOrder(order);
        } catch (error) {
          throw mapDomainError(error);
        }
      },

      async orders(
        _: unknown,
        args: { limit?: number; offset?: number },
      ) {
        try {
          const limit = args.limit ?? 10;
          const offset = args.offset ?? 0;
          const result = await listOrdersHandler.execute(new ListOrdersQuery(limit, offset));
          return {
            orders: result.orders.map(serializeOrder),
            total: result.total,
            limit: result.limit,
            offset: result.offset,
          };
        } catch (error) {
          throw mapDomainError(error);
        }
      },
    },

    Mutation: {
      async createOrder(
        _: unknown,
        args: {
          customerId: string;
          customerName: string;
          customerEmail?: string;
          lineItems: Array<{
            id: string;
            name: string;
            quantity: number;
            price: number;
          }>;
        },
      ) {
        try {
          const command = new CreateOrderCommand(
            args.customerId,
            args.customerName,
            args.customerEmail,
            args.lineItems,
          );
          const order = await createOrderHandler.execute(command);
          return serializeOrder(order);
        } catch (error) {
          throw mapDomainError(error);
        }
      },

      async transitionOrder(
        _: unknown,
        args: {
          orderId: string;
          targetState: string;
          employeeId?: string;
          employeeName?: string;
        },
      ) {
        try {
          const command = new TransitionOrderCommand(
            args.orderId,
            args.targetState as any,
            args.employeeId,
            args.employeeName,
          );
          const order = await transitionOrderHandler.execute(command);
          return serializeOrder(order);
        } catch (error) {
          throw mapDomainError(error);
        }
      },
    },
  };
}
