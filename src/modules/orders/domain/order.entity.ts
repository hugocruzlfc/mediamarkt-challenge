import { OrderState, canTransition } from './order-state.js';
import {
  InvalidTransitionError,
  EmployeeRequiredError,
  InvalidInputError,
} from './errors.js';
import { LineItem, Customer, AssignedEmployee } from './types.js';

export interface OrderConstructorParams {
  id: string;
  state: OrderState;
  customer: Customer;
  lineItems: LineItem[];
  assignedEmployee?: AssignedEmployee;
  createdAt: Date;
  updatedAt: Date;
}

export class Order {
  readonly id: string;
  readonly state: OrderState;
  readonly customer: Customer;
  readonly lineItems: LineItem[];
  readonly assignedEmployee?: AssignedEmployee;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(params: OrderConstructorParams) {
    this.validateLineItems(params.lineItems);
    this.id = params.id;
    this.state = params.state;
    this.customer = params.customer;
    this.lineItems = params.lineItems;
    this.assignedEmployee = params.assignedEmployee;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  private validateLineItems(lineItems: LineItem[]): void {
    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      throw new InvalidInputError('An order must have at least one line item');
    }
    for (const item of lineItems) {
      if (!item.id || !item.name || item.quantity <= 0 || item.price < 0) {
        throw new InvalidInputError('Invalid line item: missing or invalid fields');
      }
    }
  }

  transitionTo(newState: OrderState, employeeId?: string, employeeName?: string): Order {
    if (!canTransition(this.state, newState)) {
      throw new InvalidTransitionError(
        `Cannot transition from ${this.state} to ${newState}`,
      );
    }

    let updatedEmployee = this.assignedEmployee;

    if (newState === OrderState.IN_PROGRESS) {
      if (!employeeId || !employeeName) {
        throw new EmployeeRequiredError();
      }
      updatedEmployee = { id: employeeId, name: employeeName };
    } else if (newState === OrderState.COMPLETE) {
      // Keep the existing employee assignment
      updatedEmployee = this.assignedEmployee;
    }

    return new Order({
      id: this.id,
      state: newState,
      customer: this.customer,
      lineItems: this.lineItems,
      assignedEmployee: updatedEmployee,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
