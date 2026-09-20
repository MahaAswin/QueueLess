-- QueueLess Database Schema Initialization / Migration Script
-- Safe idempotent DDL updates for existing tables

-- 1. Users Table Migrations
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS valid_complaint_count INTEGER DEFAULT 0;
UPDATE users SET valid_complaint_count = 0 WHERE valid_complaint_count IS NULL;

-- 2. Orders Table Migrations
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS hidden_for_customer BOOLEAN DEFAULT FALSE;
UPDATE orders SET hidden_for_customer = FALSE WHERE hidden_for_customer IS NULL;
