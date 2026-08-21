import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../../src/container/types.js';
import { Order } from '../../domain/order.entity.js';
import { OrderState } from '../../domain/order-state.js';
import type { OrderRepository } from '../../infrastructure/persistence/order-repository.interface.js';
import type { CreateOrderCommand } from './create-order.command.js';

@injectable()
export class CreateOrderHandler {
  constructor(@inject(TYPES.OrderRepository) private repository: OrderRepository) {}

  async execute(command: CreateOrderCommand): Promise<Order> {
    const order = new Order({
      id: this.generateId(),
      state: OrderState.OPEN,
      customer: {
        id: command.customerId,
        name: command.customerName,
        email: command.customerEmail,
      },
      lineItems: command.lineItems,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.repository.save(order);
    return order;
  }

  private generateId(): string {
    return `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
