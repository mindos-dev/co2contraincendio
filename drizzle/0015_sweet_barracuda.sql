CREATE TABLE `art_approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artServiceId` int NOT NULL,
	`reviewerId` int NOT NULL,
	`action` enum('aprovado','reprovado') NOT NULL,
	`notes` text,
	`reviewedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `art_approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `art_evidences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artServiceId` int NOT NULL,
	`uploadedById` int NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`fileSizeBytes` int,
	`evidenceType` enum('foto','video','nota_fiscal','laudo','outro') NOT NULL,
	`sha256Hash` varchar(64) NOT NULL,
	`serverTimestamp` timestamp NOT NULL DEFAULT (now()),
	`geoLatitude` decimal(10,7),
	`geoLongitude` decimal(10,7),
	`ocrExtractedData` json,
	`ocrProcessedAt` timestamp,
	`isLocked` boolean NOT NULL DEFAULT false,
	`lockedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `art_evidences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `art_services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`technicianId` int NOT NULL,
	`engineerId` int,
	`serviceType` enum('pmoc','incendio','eletrica','gas','hidraulico','co2','outro') NOT NULL,
	`description` text NOT NULL,
	`clientName` varchar(200) NOT NULL,
	`clientDocument` varchar(30),
	`serviceAddress` varchar(500),
	`serviceDate` date NOT NULL,
	`technicianDeclaration` boolean NOT NULL DEFAULT false,
	`technicianSignatureTs` timestamp,
	`submissionHash` varchar(64),
	`serverTimestamp` timestamp,
	`geoLatitude` decimal(10,7),
	`geoLongitude` decimal(10,7),
	`status` enum('rascunho','aguardando_aprovacao','aprovado','reprovado') NOT NULL DEFAULT 'rascunho',
	`rejectionReason` text,
	`approvedAt` timestamp,
	`pdfUrl` text,
	`pdfGeneratedAt` timestamp,
	`paymentStatus` enum('free_plan','pending_payment','paid','exempt') NOT NULL DEFAULT 'pending_payment',
	`stripePaymentIntentId` varchar(100),
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `art_services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `art_approvals` ADD CONSTRAINT `art_approvals_artServiceId_art_services_id_fk` FOREIGN KEY (`artServiceId`) REFERENCES `art_services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `art_approvals` ADD CONSTRAINT `art_approvals_reviewerId_saas_users_id_fk` FOREIGN KEY (`reviewerId`) REFERENCES `saas_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `art_evidences` ADD CONSTRAINT `art_evidences_artServiceId_art_services_id_fk` FOREIGN KEY (`artServiceId`) REFERENCES `art_services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `art_evidences` ADD CONSTRAINT `art_evidences_uploadedById_saas_users_id_fk` FOREIGN KEY (`uploadedById`) REFERENCES `saas_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `art_services` ADD CONSTRAINT `art_services_companyId_saas_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `saas_companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `art_services` ADD CONSTRAINT `art_services_technicianId_saas_users_id_fk` FOREIGN KEY (`technicianId`) REFERENCES `saas_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `art_services` ADD CONSTRAINT `art_services_engineerId_saas_users_id_fk` FOREIGN KEY (`engineerId`) REFERENCES `saas_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_approval_art` ON `art_approvals` (`artServiceId`);--> statement-breakpoint
CREATE INDEX `idx_evidence_art` ON `art_evidences` (`artServiceId`);--> statement-breakpoint
CREATE INDEX `idx_art_company_status` ON `art_services` (`companyId`,`status`);--> statement-breakpoint
CREATE INDEX `idx_art_technician` ON `art_services` (`technicianId`);--> statement-breakpoint
CREATE INDEX `idx_art_created` ON `art_services` (`companyId`,`createdAt`);