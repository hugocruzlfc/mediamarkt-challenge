import { injectable, inject } from "inversify";
import { ListOrdersQuery } from './list-orders.query.js';
import { Order } from '../../domain/order.entity.js';
import { OrderRepository } from '../../infrastructure/persistence/order-repository.interface.js';
import { TYPES } from '../../../../../src/container/types.js';

export interface ListOrdersResult {
  orders: Order[];
  total: number;
  limit: number;
  offset: number;
}

@injectable()
export class ListOrdersHandler {
  constructor(
    @inject(TYPES.OrderRepository) private repository: OrderRepository,
  ) {}

  async execute(query: ListOrdersQuery): Promise<ListOrdersResult> {
    const [orders, total] = await Promise.all([
      this.repository.findAll(query.limit, query.offset),
      this.repository.count(),
    ]);

    return {
      orders,
      total,
      limit: query.limit,
      offset: query.offset,
    };
  }
}
