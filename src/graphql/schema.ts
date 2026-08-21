import { orderTypeDefs } from '../modules/orders/infrastructure/graphql/order.typedefs.js';

// Base schema with root Query and Mutation types
const baseTypeDefs = `
  type Query {
    _: String
  }

  type Mutation {
    _: String
  }
`;

// Combine all type definitions
export const typeDefs = `${baseTypeDefs}
${orderTypeDefs}`;
