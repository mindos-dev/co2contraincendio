CREATE TABLE `notification_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`emailEnabled` boolean NOT NULL DEFAULT false,
	`whatsappEnabled` boolean NOT NULL DEFAULT false,
	`emailRecipients` text,
	`whatsappNumbers` text,
	`daysBeforeAlert` int NOT NULL DEFAULT 30,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `notification_settings` ADD CONSTRAINT `notification_settings_companyId_saas_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `saas_companies`(`id`) ON DELETE no action ON UPDATE no action;