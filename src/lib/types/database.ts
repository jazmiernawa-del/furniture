/**
 * Database types for the Supabase client.
 *
 * Hand-authored to mirror supabase/migrations. Once you have the Supabase CLI
 * connected you can regenerate this file with:
 *
 *   npx supabase gen types typescript --linked > src/lib/types/database.ts
 */

export type UserRole = "customer" | "admin";
export type ProductCondition = "new" | "like_new" | "good" | "fair";
export type ProductStatus = "active" | "archived";
export type BillingPeriod = "weekly" | "monthly";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "delivered"
  | "active"
  | "returned"
  | "overdue"
  | "cancelled";
export type PaymentType = "rental_fee" | "deposit" | "delivery_fee";
export type PaymentStatus =
  | "pending"
  | "paid"
  | "refunded"
  | "partially_refunded"
  | "failed";

export interface Address {
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: UserRole;
          stripe_customer_id: string | null;
          default_address: Address | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          stripe_customer_id?: string | null;
          default_address?: Address | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: string;
          style: string | null;
          description: string | null;
          condition: ProductCondition;
          monthly_rate: number;
          weekly_rate: number | null;
          deposit: number;
          delivery_fee: number;
          status: ProductStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category: string;
          style?: string | null;
          description?: string | null;
          condition?: ProductCondition;
          monthly_rate: number;
          weekly_rate?: number | null;
          deposit?: number;
          delivery_fee?: number;
          status?: ProductStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt: string | null;
          position: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt?: string | null;
          position?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["product_images"]["Insert"]
        >;
        Relationships: [];
      };
      rental_orders: {
        Row: {
          id: string;
          user_id: string;
          status: OrderStatus;
          billing_period: BillingPeriod;
          start_date: string;
          end_date: string;
          delivery_date: string | null;
          delivery_address: Address | null;
          delivery_contact_name: string | null;
          delivery_contact_phone: string | null;
          notes: string | null;
          subtotal: number;
          deposit_total: number;
          delivery_fee: number;
          total: number;
          currency: string;
          stripe_checkout_session_id: string | null;
          stripe_payment_intent_id: string | null;
          stripe_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: OrderStatus;
          billing_period: BillingPeriod;
          start_date: string;
          end_date: string;
          delivery_date?: string | null;
          delivery_address?: Address | null;
          delivery_contact_name?: string | null;
          delivery_contact_phone?: string | null;
          notes?: string | null;
          subtotal?: number;
          deposit_total?: number;
          delivery_fee?: number;
          total?: number;
          currency?: string;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["rental_orders"]["Insert"]
        >;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name: string;
          billing_period: BillingPeriod;
          rate: number;
          periods: number;
          deposit: number;
          start_date: string;
          end_date: string;
          line_total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name: string;
          billing_period: BillingPeriod;
          rate: number;
          periods?: number;
          deposit?: number;
          start_date: string;
          end_date: string;
          line_total: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          product_id: string;
          order_item_id: string | null;
          during: string; // daterange, e.g. "[2026-01-01,2026-02-01)"
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          order_item_id?: string | null;
          during: string;
          reason?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          type: PaymentType;
          amount: number;
          currency: string;
          status: PaymentStatus;
          refunded_amount: number;
          stripe_payment_intent_id: string | null;
          stripe_refund_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          type: PaymentType;
          amount: number;
          currency?: string;
          status?: PaymentStatus;
          refunded_amount?: number;
          stripe_payment_intent_id?: string | null;
          stripe_refund_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_product_available: {
        Args: { p_product: string; p_start: string; p_end: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      product_condition: ProductCondition;
      product_status: ProductStatus;
      billing_period: BillingPeriod;
      order_status: OrderStatus;
      payment_type: PaymentType;
      payment_status: PaymentStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

// Convenience row aliases used across the app.
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductImage =
  Database["public"]["Tables"]["product_images"]["Row"];
export type RentalOrder = Database["public"]["Tables"]["rental_orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];

export type { Json };
