// Shared types for user and subscription

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: string;
  current_period_end: string; // ISO date string
  created_at: string; // ISO date string
}

export interface UserWithSubscription {
  id: string;
  username: string;
  email: string;
  created_at: string; // ISO date string
  subscription: Subscription | null;
}
