-- Remove country and timezone columns from submission table
ALTER TABLE `submission` DROP COLUMN `country`;
--> statement-breakpoint
ALTER TABLE `submission` DROP COLUMN `timezone`;
