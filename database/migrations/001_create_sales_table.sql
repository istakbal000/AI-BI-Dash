-- Migration: Create sales table
-- Run this script against your PostgreSQL database

CREATE TABLE IF NOT EXISTS sales (
  order_id INTEGER PRIMARY KEY,
  order_date DATE,
  product_id INTEGER,
  product_category TEXT,
  price FLOAT,
  discount_percent INTEGER,
  quantity_sold INTEGER,
  customer_region TEXT,
  payment_method TEXT,
  rating FLOAT,
  review_count INTEGER,
  discounted_price FLOAT,
  total_revenue FLOAT
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_sales_order_date ON sales(order_date);
CREATE INDEX IF NOT EXISTS idx_sales_product_category ON sales(product_category);
CREATE INDEX IF NOT EXISTS idx_sales_customer_region ON sales(customer_region);
CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON sales(payment_method);
CREATE INDEX IF NOT EXISTS idx_sales_total_revenue ON sales(total_revenue);
