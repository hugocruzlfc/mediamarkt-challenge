import { EmployeeRequiredError, InvalidInputError, InvalidTransitionError } from './errors.js';
import { Order } from './order.entity.js';
import { OrderState } from './order-state.js';
import type { Customer, LineItem } from './types.js';

describe('Order Entity', () => {
  const mockCustomer: Customer = { id: '1', name: 'John Doe', email: 'john@example.com' };
  const mockLineItem: LineItem = { id: '1', name: 'Widget', quantity: 2, price: 1000 };

  describe('construction', () => {
    it('should create an order in OPEN state', () => {
      const order = new Order({
        id: 'order-1',
        state: OrderState.OPEN,
        customer: mockCustomer,
        lineItems: [mockLineItem],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(order.state).toBe(OrderState.OPEN);
      expect(order.customer).toEqual(mockCustomer);
      expect(order.lineItems).toHaveLength(1);
      expect(order.assignedEmployee).toBeUndefined();
    });

    it('should throw when lineItems is empty', () => {
      expect(
        () =>
          new Order({
            id: 'order-1',
            state: OrderState.OPEN,
            customer: mockCustomer,
            lineItems: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
      ).toThrow(InvalidInputError);
    });

    it('should throw when lineItem has invalid fields', () => {
      expect(
        () =>
          new Order({
            id: 'order-1',
            state: OrderState.OPEN,
            customer: mockCustomer,
            lineItems: [{ id: '1', name: 'Widget', quantity: 0, price: 1000 }],
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
      ).toThrow(InvalidInputError);
    });
  });

  describe('valid transitions', () => {
    it('should transition OPEN → IN_PROGRESS with employee', () => {
      const order = new Order({
        id: 'order-1',
        state: OrderState.OPEN,
        customer: mockCustomer,
        lineItems: [mockLineItem],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const transitioned = order.transitionTo(OrderState.IN_PROGRESS, 'emp-1', 'Alice');
      expect(transitioned.state).toBe(OrderState.IN_PROGRESS);
      expect(transitioned.assignedEmployee).toEqual({ id: 'emp-1', name: 'Alice' });
      expect(transitioned.id).toBe(order.id);
      expect(transitioned.customer).toEqual(order.customer);
    });

    it('should transition IN_PROGRESS → COMPLETE and carry the employee forward', () => {
      const order = new Order({
        id: 'order-1',
        state: OrderState.IN_PROGRESS,
        customer: mockCustomer,
        lineItems: [mockLineItem],
        assignedEmployee: { id: 'emp-1', name: 'Alice' },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const completed = order.transitionTo(OrderState.COMPLETE);
      expect(completed.state).toBe(OrderState.COMPLETE);
      expect(completed.assignedEmployee).toEqual({ id: 'emp-1', name: 'Alice' });
    });

    it('should update updatedAt on transition', () => {
      const order = new Order({
        id: 'order-1',
        state: OrderState.OPEN,
        customer: mockCustomer,
        lineItems: [mockLineItem],
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      });

      const beforeTime = new Date();
      const transitioned = order.transitionTo(OrderState.IN_PROGRESS, 'emp-1', 'Alice');
      const afterTime = new Date();

      expect(transitioned.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(transitioned.updatedAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
      expect(transitioned.createdAt).toEqual(order.createdAt);
    });
  });

  describe('invalid transitions', () => {
    it('should not allow OPEN → COMPLETE (skip)', () => {
      const order = new Order({
        id: 'order-1',
        state: OrderState.OPEN,
        customer: mockCustomer,
        lineItems: [mockLineItem],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => order.transitionTo(OrderState.COMPLETE)).toThrow(InvalidTransitionError);
    });

    it('should not allow IN_PROGRESS → OPEN (revert)', () => {
      const order = new Order({
        id: 'order-1',
        state: OrderState.IN_PROGRESS,
        customer: mockCustomer,
        lineItems: [mockLineItem],
        assignedEmployee: { id: 'emp-1', name: 'Alice' },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => order.transitionTo(OrderState.OPEN)).toThrow(InvalidTransitionError);
    });

    it('should not allow COMPLETE → anything', () => {
      const order = new Order({
        id: 'order-1',
        state: OrderState.COMPLETE,
        customer: mockCustomer,
        lineItems: [mockLineItem],
        assignedEmployee: { id: 'emp-1', name: 'Alice' },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => order.transitionTo(OrderState.OPEN)).toThrow(InvalidTransitionError);
      expect(() => order.transitionTo(OrderState.IN_PROGRESS)).toThrow(InvalidTransitionError);
    });
  });

  describe('employee requirement', () => {
    it('should throw when transitioning to IN_PROGRESS without employee', () => {
      const order = new Order({
        id: 'order-1',
        state: OrderState.OPEN,
        customer: mockCustomer,
        lineItems: [mockLineItem],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => order.transitionTo(OrderState.IN_PROGRESS)).toThrow(EmployeeRequiredError);
    });

    it('should throw when transitioning to IN_PROGRESS with only employee id', () => {
      const order = new Order({
        id: 'order-1',
        state: OrderState.OPEN,
        customer: mockCustomer,
        lineItems: [mockLineItem],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => order.transitionTo(OrderState.IN_PROGRESS, 'emp-1')).toThrow(
        EmployeeRequiredError,
      );
    });

    it('should not require employee when transitioning to COMPLETE', () => {
      const order = new Order({
        id: 'order-1',
        state: OrderState.IN_PROGRESS,
        customer: mockCustomer,
        lineItems: [mockLineItem],
        assignedEmployee: { id: 'emp-1', name: 'Alice' },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => order.transitionTo(OrderState.COMPLETE)).not.toThrow();
    });
  });
});
