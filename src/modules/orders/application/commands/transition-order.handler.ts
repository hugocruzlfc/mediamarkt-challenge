import { injectable, inject } from "inversify";
import { TransitionOrderCommand } from './transition-order.command.js';
import { Order } from '../../domain/order.entity.js';
import { OrderRepository } from '../../infrastructure/persistence/order-repository.interface.js';
import { OrderNotFoundError } from '../../domain/errors.js';
import { TYPES } from '../../../../../src/container/types.js';

@injectable()
export class TransitionOrderHandler {
  constructor(
    @inject(TYPES.OrderRepository) private repository: OrderRepository,
  ) {}

  async execute(command: TransitionOrderCommand): Promise<Order> {
    const order = await this.repository.findById(command.orderId);
    if (!order) {
      throw new OrderNotFoundError(command.orderId);
    }

    const transitioned = order.transitionTo(
      command.targetState,
      command.employeeId,
      command.employeeName,
    );

    await this.repository.save(transitioned);
    return transitioned;
  }
}
