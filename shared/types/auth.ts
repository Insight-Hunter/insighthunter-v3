// shared/types/auth.ts
// Authentication and User Types

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  companyId?: string;
  role: UserRole;
  plan: SubscriptionPlan;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer'
}

export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
  WHITE_LABEL = 'white_label'
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  companyName?: string;
}
