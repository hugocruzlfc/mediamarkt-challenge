import { injectable } from 'inversify';
import { Model } from 'mongoose';
import { Order } from '../../domain/order.entity.js';
import { OrderState } from '../../domain/order-state.js';
import { OrderRepository } from './order-repository.interface.js';

interface OrderDoc {
  _id: string;
  state: OrderState;
  customer: { id: string; name: string; email?: string };
  lineItems: Array<{ id: string; name: string; quantity: number; price: number }>;
  assignedEmployee?: { id: string; name: string };
  createdAt: Date;
  updatedAt: Date;
}

@injectable()
export class MongoOrderRepository implements OrderRepository {
  constructor(private model: Model<OrderDoc>) {}

  async save(order: Order): Promise<void> {
    const doc: OrderDoc = {
      _id: order.id,
      state: order.state,
      customer: order.customer,
      lineItems: order.lineItems,
      assignedEmployee: order.assignedEmployee,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    await this.model.findByIdAndUpdate(order.id, doc, { upsert: true, new: true });
  }

  async findById(id: string): Promise<Order | null> {
    const doc = await this.model.findById(id).lean().exec();
    if (!doc) return null;

    return new Order({
      id: doc._id,
      state: doc.state,
      customer: doc.customer,
      lineItems: doc.lineItems,
      assignedEmployee: doc.assignedEmployee,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findAll(limit: number, offset: number): Promise<Order[]> {
    const docs = await this.model
      .find()
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return docs.map(
      (doc) =>
        new Order({
          id: doc._id,
          state: doc.state,
          customer: doc.customer,
          lineItems: doc.lineItems,
          assignedEmployee: doc.assignedEmployee,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        }),
    );
  }

  async count(): Promise<number> {
    return this.model.countDocuments().exec();
  }
}
