export interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  description: string;
  image: string;
  prices: {
    single: number;
    couple: number;
    group: number;
    vip: number;
  };
}

export interface Drink {
  id: string;
  name: string;
  price: number;
  category: "Alcoholic" | "Non-Alcoholic" | "Premium";
  description: string;
  image: string;
}

export interface CartItem {
  id: string;
  type: "ticket" | "drink";
  name: string;
  price: number;
  quantity: number;
  ticketType?: string;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: string;
}

export interface Ticket {
  id: string;
  userId: string;
  orderId: string;
  eventId: string;
  type: string;
  price: number;
  qrCode: string;
  status: "unused" | "used";
  createdAt: string;
}
