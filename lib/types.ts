// Shared types for user and subscription

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: 'active' | 'inactive';
  current_period_end: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string; // ISO date string
  subscription: Subscription | null;
}
