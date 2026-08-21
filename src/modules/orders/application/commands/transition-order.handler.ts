import { inject, injectable } from "inversify";

import { OrderNotFoundError } from "../../domain/errors.js";
import type { Order } from "../../domain/order.entity.js";
import type { OrderRepository } from "../../infrastructure/persistence/order-repository.interface.js";
import type { TransitionOrderCommand } from "./transition-order.command.js";
import { TYPES } from "@/container/types.js";

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
