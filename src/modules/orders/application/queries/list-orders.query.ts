// Read DTO for listing orders with optional pagination
export class ListOrdersQuery {
  constructor(
    readonly limit: number = 10,
    readonly offset: number = 0,
  ) {}
}
