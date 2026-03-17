-- Migration script for order history feature
-- Run this on your Supabase database to enable customer order tracking

-- Add indexes for faster lookups by customer phone
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_created ON orders(restaurant_id, created_at DESC);

-- Optional: Add a note about the feature
COMMENT ON COLUMN orders.customer_phone IS 'Used for customer order tracking without authentication';
