import { BookingStatus } from "@/hooks/user/useUserApi";

interface Booking {
  _id: string;           // MongoDB ID
  id?: string;           // Optional, for compatibility
  status: BookingStatus;
  moveInDate: string;
  numberOfTenants: number;
  totalAmount: number;
  property: {
    _id?: string;
    id?: string;
    title: string;
    area: string;
    city: string;
    images?: string[];
  };
  payment?: {
    status: string;
  };
}