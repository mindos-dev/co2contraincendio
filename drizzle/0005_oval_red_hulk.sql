CREATE TABLE `operis_inspection_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inspectionId` int NOT NULL,
	`itemId` varchar(100) NOT NULL,
	`itemTitle` varchar(300) NOT NULL,
	`system` varchar(100) NOT NULL,
	`normReference` varchar(200),
	`status` enum('conforme','nao_conforme','necessita_revisao','pendente') DEFAULT 'pendente',
	`findings` text,
	`riskLevel` enum('R1','R2','R3','R4','R5') DEFAULT 'R1',
	`recommendations` json,
	`aiConfidence` varchar(10),
	`imageUrls` json,
	`analyzedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `operis_inspection_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `operis_inspections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(300) NOT NULL,
	`location` varchar(300) NOT NULL,
	`client` varchar(200) NOT NULL,
	`unit` varchar(200),
	`system` varchar(100) NOT NULL,
	`status` enum('em_progresso','concluida','revisao') NOT NULL DEFAULT 'em_progresso',
	`globalRisk` enum('R1','R2','R3','R4','R5') DEFAULT 'R1',
	`riskBySystem` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `operis_inspections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `operis_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inspectionId` int NOT NULL,
	`companyId` int NOT NULL,
	`htmlContent` text,
	`pdfUrl` text,
	`pdfKey` varchar(300),
	`signatureUrl` text,
	`globalRisk` enum('R1','R2','R3','R4','R5'),
	`status` enum('gerando','pronto','erro') NOT NULL DEFAULT 'gerando',
	`publicSlug` varchar(100),
	`generatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `operis_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `operis_inspection_items` ADD CONSTRAINT `operis_inspection_items_inspectionId_operis_inspections_id_fk` FOREIGN KEY (`inspectionId`) REFERENCES `operis_inspections`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `operis_inspections` ADD CONSTRAINT `operis_inspections_companyId_saas_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `saas_companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `operis_inspections` ADD CONSTRAINT `operis_inspections_userId_saas_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `saas_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `operis_reports` ADD CONSTRAINT `operis_reports_inspectionId_operis_inspections_id_fk` FOREIGN KEY (`inspectionId`) REFERENCES `operis_inspections`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `operis_reports` ADD CONSTRAINT `operis_reports_companyId_saas_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `saas_companies`(`id`) ON DELETE no action ON UPDATE no action;