import type { OrderState } from '../../domain/order-state.js';

// Input DTO for transitioning an order
export class TransitionOrderCommand {
  constructor(
    readonly orderId: string,
    readonly targetState: OrderState,
    readonly employeeId?: string,
    readonly employeeName?: string,
  ) {}
}
