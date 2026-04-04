ALTER TABLE `art_services` ADD `artNumber` varchar(20);--> statement-breakpoint
CREATE INDEX `idx_art_number` ON `art_services` (`artNumber`);