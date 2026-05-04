ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'new_order';
UPDATE "Order" SET "status" = 'new_order' WHERE "status" = 'pending';
