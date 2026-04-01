// ============= ADMIN TYPES =============

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TUTOR" | "ADMIN";
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
}

export interface AdminBooking {
  id: string;
  sessionDate: string;
  duration: number;
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED";
  price: number;
  notes?: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  tutor: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalTutors: number;
  totalBookings: number;
  totalRevenue: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}