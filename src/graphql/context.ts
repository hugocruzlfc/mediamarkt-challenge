import { Container } from 'inversify';

// GraphQL context carries the DI container so resolvers can access handlers
export interface GraphQLContext {
  container: Container;
}

export function createContext(container: Container): GraphQLContext {
  return { container };
}
