import { injectable, inject } from "inversify";
import { GetOrderQuery } from './get-order.query.js';
import { Order } from '../../domain/order.entity.js';
import { OrderRepository } from '../../infrastructure/persistence/order-repository.interface.js';
import { OrderNotFoundError } from '../../domain/errors.js';
import { TYPES } from '../../../../../src/container/types.js';

@injectable()
export class GetOrderHandler {
  constructor(
    @inject(TYPES.OrderRepository) private repository: OrderRepository,
  ) {}

  async execute(query: GetOrderQuery): Promise<Order> {
    const order = await this.repository.findById(query.orderId);
    if (!order) {
      throw new OrderNotFoundError(query.orderId);
    }
    return order;
  }
}
