// Value objects for the Order aggregate

export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  price: number; // in cents
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
}

export interface AssignedEmployee {
  id: string;
  name: string;
}
