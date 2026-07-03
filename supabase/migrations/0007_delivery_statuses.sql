-- ===========================================================================
-- Furniture (rental app)
-- Migration 0007: add delivery-stage order statuses.
-- NOTE: each ALTER TYPE ... ADD VALUE must run outside a transaction block;
-- apply with scripts/run-sql-each.mjs.
-- ===========================================================================

alter type order_status add value if not exists 'preparing';
alter type order_status add value if not exists 'out_for_delivery';
