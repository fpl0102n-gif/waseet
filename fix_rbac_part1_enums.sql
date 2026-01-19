-- Part 1: Update Enums
-- Run this script FIRST.
-- This effectively commits the new enum values so they can be used in the next script.

ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'humanitarian_admin';
