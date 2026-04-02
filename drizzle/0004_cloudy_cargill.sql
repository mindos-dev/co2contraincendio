CREATE TABLE `checklist_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inspectionId` int NOT NULL,
	`questionKey` varchar(100) NOT NULL,
	`questionText` text NOT NULL,
	`answer` enum('conforme','nao_conforme','nao_aplicavel','pendente') NOT NULL DEFAULT 'pendente',
	`observation` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checklist_answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `field_inspections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int,
	`technicianId` int,
	`type` enum('pmoc','incendio','eletrica','outros') NOT NULL,
	`status` enum('rascunho','em_andamento','concluida','cancelada') NOT NULL DEFAULT 'rascunho',
	`title` varchar(200),
	`notes` text,
	`location` varchar(300),
	`offlineId` varchar(64),
	`syncedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `field_inspections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `field_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inspectionId` int NOT NULL,
	`companyId` int,
	`type` enum('pmoc','incendio','eletrica','outros') NOT NULL,
	`content` text,
	`pdfUrl` text,
	`pdfKey` varchar(300),
	`status` enum('gerando','pronto','erro') NOT NULL DEFAULT 'gerando',
	`generatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `field_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inspection_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inspectionId` int NOT NULL,
	`url` text NOT NULL,
	`fileKey` varchar(300) NOT NULL,
	`caption` varchar(200),
	`mimeType` varchar(50) DEFAULT 'image/jpeg',
	`sizeBytes` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inspection_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `checklist_answers` ADD CONSTRAINT `checklist_answers_inspectionId_field_inspections_id_fk` FOREIGN KEY (`inspectionId`) REFERENCES `field_inspections`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `field_inspections` ADD CONSTRAINT `field_inspections_companyId_saas_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `saas_companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `field_inspections` ADD CONSTRAINT `field_inspections_technicianId_saas_users_id_fk` FOREIGN KEY (`technicianId`) REFERENCES `saas_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `field_reports` ADD CONSTRAINT `field_reports_inspectionId_field_inspections_id_fk` FOREIGN KEY (`inspectionId`) REFERENCES `field_inspections`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `field_reports` ADD CONSTRAINT `field_reports_companyId_saas_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `saas_companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inspection_images` ADD CONSTRAINT `inspection_images_inspectionId_field_inspections_id_fk` FOREIGN KEY (`inspectionId`) REFERENCES `field_inspections`(`id`) ON DELETE no action ON UPDATE no action;