// Order state machine definition

export enum OrderState {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETE = 'COMPLETE',
}

// Maps which states can transition to which
const TRANSITIONS: Record<OrderState, OrderState[]> = {
  [OrderState.OPEN]: [OrderState.IN_PROGRESS],
  [OrderState.IN_PROGRESS]: [OrderState.COMPLETE],
  [OrderState.COMPLETE]: [],
};

export function canTransition(from: OrderState, to: OrderState): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}
