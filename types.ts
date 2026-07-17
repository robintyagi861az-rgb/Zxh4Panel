export type UserRole = "user" | "subadmin" | "admin";

export interface SubAdminPermissions {
  manageChats: boolean;
  editWalletsAndCoupons: boolean;
  sendPromoEmails: boolean;
  viewFinancialLogs: boolean;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  walletBalance: number;
  permissions?: SubAdminPermissions; // only present for subadmin
  createdAt: number;
  disabled?: boolean;
}

export interface Service {
  id: string;
  category: string;
  name: string;
  ratePer1000: number;
  min: number;
  max: number;
  smmVaultServiceId: string;
  description?: string;
  active: boolean;
}

export type OrderStatus = "pending" | "in_progress" | "completed" | "canceled" | "partial";

export interface Order {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  targetLink: string;
  quantity: number;
  charge: number;
  status: OrderStatus;
  smmVaultOrderId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Coupon {
  code: string;
  creditAmount: number;
  expiryDate: number; // epoch ms
  claimLimit: number;
  claimedBy: string[]; // uids that redeemed it
  createdAt: number;
  createdBy: string;
}

export interface ChatMessage {
  id: string;
  chatId: string; // == userId, one thread per user
  senderId: string;
  senderRole: UserRole;
  text: string;
  createdAt: number;
  read: boolean;
}

export interface ChatThread {
  userId: string;
  userDisplayName: string;
  lastMessage: string;
  lastMessageAt: number;
  unreadForAdmin: number;
}

export interface SystemConfig {
  maintenanceMode: boolean;
}

export interface SmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  user: string; // Google Workspace / Gmail address
  appPassword: string; // Google App Password, never a real account password
  fromName: string;
}

export interface OAuthSettings {
  googleClientId: string;
  googleClientSecret: string;
  enabled: boolean;
}

export interface SmmVaultSettings {
  baseUrl: string;
  apiKey: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: "credit" | "debit";
  amount: number;
  reason: string;
  actorId: string; // admin/subadmin uid, or "coupon:<code>"
  createdAt: number;
}
