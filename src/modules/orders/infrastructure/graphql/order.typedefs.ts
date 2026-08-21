export const orderTypeDefs = `
  enum OrderState {
    OPEN
    IN_PROGRESS
    COMPLETE
  }

  type LineItem {
    id: String!
    name: String!
    quantity: Int!
    price: Int!
  }

  type Customer {
    id: String!
    name: String!
    email: String
  }

  type AssignedEmployee {
    id: String!
    name: String!
  }

  type Order {
    id: String!
    state: OrderState!
    customer: Customer!
    lineItems: [LineItem!]!
    assignedEmployee: AssignedEmployee
    createdAt: String!
    updatedAt: String!
  }

  type ListOrdersResult {
    orders: [Order!]!
    total: Int!
    limit: Int!
    offset: Int!
  }

  extend type Query {
    order(id: String!): Order!
    orders(limit: Int, offset: Int): ListOrdersResult!
  }

  input LineItemInput {
    id: String!
    name: String!
    quantity: Int!
    price: Int!
  }

  extend type Mutation {
    createOrder(
      customerId: String!
      customerName: String!
      customerEmail: String
      lineItems: [LineItemInput!]!
    ): Order!

    transitionOrder(
      orderId: String!
      targetState: OrderState!
      employeeId: String
      employeeName: String
    ): Order!
  }
`;
