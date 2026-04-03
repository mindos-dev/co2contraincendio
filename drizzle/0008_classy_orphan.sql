CREATE TABLE `cookie_consents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`sessionId` varchar(100),
	`consentType` enum('all','custom','essential_only') NOT NULL,
	`essential` boolean NOT NULL DEFAULT true,
	`performance` boolean NOT NULL DEFAULT false,
	`analytics` boolean NOT NULL DEFAULT false,
	`ipAddress` varchar(45),
	`userAgent` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cookie_consents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lgpd_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('export','delete','correction','access','portability') NOT NULL,
	`status` enum('pending','processing','completed','rejected') NOT NULL DEFAULT 'pending',
	`notes` text,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lgpd_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `cookie_consents` ADD CONSTRAINT `cookie_consents_userId_saas_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `saas_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lgpd_requests` ADD CONSTRAINT `lgpd_requests_userId_saas_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `saas_users`(`id`) ON DELETE no action ON UPDATE no action;