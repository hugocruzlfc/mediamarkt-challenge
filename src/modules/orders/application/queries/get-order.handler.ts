import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../../src/container/types.js';
import { OrderNotFoundError } from '../../domain/errors.js';
import type { Order } from '../../domain/order.entity.js';
import type { OrderRepository } from '../../infrastructure/persistence/order-repository.interface.js';
import type { GetOrderQuery } from './get-order.query.js';

@injectable()
export class GetOrderHandler {
  constructor(@inject(TYPES.OrderRepository) private repository: OrderRepository) {}

  async execute(query: GetOrderQuery): Promise<Order> {
    const order = await this.repository.findById(query.orderId);
    if (!order) {
      throw new OrderNotFoundError(query.orderId);
    }
    return order;
  }
}
