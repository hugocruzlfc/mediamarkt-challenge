export class DomainError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidTransitionError extends DomainError {
  constructor(message: string) {
    super(message, "INVALID_TRANSITION");
  }
}

export class EmployeeRequiredError extends DomainError {
  constructor(
    message: string = "An employee is required to move an order to IN_PROGRESS",
  ) {
    super(message, "EMPLOYEE_REQUIRED");
  }
}

export class OrderNotFoundError extends DomainError {
  constructor(orderId: string) {
    super(`Order with id ${orderId} not found`, "ORDER_NOT_FOUND");
  }
}

export class InvalidInputError extends DomainError {
  constructor(message: string) {
    super(message, "INVALID_INPUT");
  }
}
