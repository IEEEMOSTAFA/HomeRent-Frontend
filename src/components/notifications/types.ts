export type NotifType = "booking_update" | "payment" | "review" | "system";
export type FilterTab = "all" | NotifType;

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}