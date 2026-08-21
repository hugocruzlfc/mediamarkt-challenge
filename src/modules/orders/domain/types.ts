export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
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
