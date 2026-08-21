import type { Order } from '../../domain/order.entity.js';

// Domain port: what any persistence implementation must provide
export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findAll(limit: number, offset: number): Promise<Order[]>;
  count(): Promise<number>;
}
