// Input DTO for creating an order
export class CreateOrderCommand {
  constructor(
    readonly customerId: string,
    readonly customerName: string,
    readonly customerEmail: string | undefined,
    readonly lineItems: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>,
  ) {}
}
