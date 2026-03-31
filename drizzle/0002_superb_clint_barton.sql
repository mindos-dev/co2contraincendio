CREATE TABLE `access_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`equipmentId` int NOT NULL,
	`equipmentCode` varchar(50),
	`storeName` varchar(200),
	`storeNumber` varchar(30),
	`shoppingName` varchar(200),
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `access_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alert_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`equipmentId` int NOT NULL,
	`companyId` int,
	`alertType` enum('proximo_vencimento','vencido','sem_manutencao') NOT NULL,
	`message` text,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`acknowledged` boolean NOT NULL DEFAULT false,
	CONSTRAINT `alert_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`maintenanceId` int,
	`equipmentId` int,
	`companyId` int,
	`type` enum('nota_fiscal','ordem_servico','relatorio','laudo','art','outro') NOT NULL,
	`documentNumber` varchar(80),
	`fileUrl` text,
	`fileName` varchar(255),
	`extractedData` text,
	`processingStatus` enum('pending','processed','error') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `equipment` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int,
	`code` varchar(50) NOT NULL,
	`category` enum('extintor','hidrante','sprinkler','detector','sinalizacao','complementar') NOT NULL DEFAULT 'extintor',
	`subType` varchar(80),
	`manufacturer` varchar(100),
	`model` varchar(100),
	`serialNumber` varchar(80),
	`installationLocation` varchar(200),
	`floor` varchar(30),
	`sector` varchar(100),
	`agentType` varchar(80),
	`capacity` varchar(30),
	`pressure` varchar(30),
	`riskClass` varchar(30),
	`flowRate` varchar(30),
	`activationTemp` varchar(30),
	`coverageArea` varchar(30),
	`detectorType` varchar(80),
	`sensitivity` varchar(30),
	`signageType` varchar(80),
	`signageDimensions` varchar(50),
	`status` enum('ok','proximo_vencimento','vencido','inativo') NOT NULL DEFAULT 'ok',
	`installationDate` date,
	`lastMaintenanceDate` date,
	`nextMaintenanceDate` date,
	`qrCodeUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `equipment_id` PRIMARY KEY(`id`),
	CONSTRAINT `equipment_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `maintenance_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`equipmentId` int NOT NULL,
	`serviceDate` date NOT NULL,
	`serviceType` enum('recarga','inspecao','substituicao','instalacao','teste','outro') NOT NULL,
	`description` text,
	`agentType` varchar(80),
	`capacity` varchar(30),
	`pressure` varchar(30),
	`quantity` int DEFAULT 1,
	`technicianName` varchar(200),
	`engineerName` varchar(200),
	`crea` varchar(30),
	`rnp` varchar(30),
	`nextMaintenanceDate` date,
	`invoiceNumber` varchar(80),
	`serviceOrderNumber` varchar(80),
	`reportNumber` varchar(80),
	`fileUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `maintenance_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saas_companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`cnpj` varchar(20),
	`type` enum('shopping','industria','comercio','residencial','outro') NOT NULL DEFAULT 'comercio',
	`address` text,
	`phone` varchar(30),
	`email` varchar(320),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `saas_companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saas_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int,
	`name` varchar(200) NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`role` enum('superadmin','admin','tecnico','cliente') NOT NULL DEFAULT 'cliente',
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `saas_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `saas_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`plan` enum('basico','profissional','enterprise') NOT NULL DEFAULT 'basico',
	`price` decimal(10,2),
	`status` enum('ativo','suspenso','cancelado','trial') NOT NULL DEFAULT 'trial',
	`startDate` date,
	`endDate` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `access_logs` ADD CONSTRAINT `access_logs_equipmentId_equipment_id_fk` FOREIGN KEY (`equipmentId`) REFERENCES `equipment`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alert_events` ADD CONSTRAINT `alert_events_equipmentId_equipment_id_fk` FOREIGN KEY (`equipmentId`) REFERENCES `equipment`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alert_events` ADD CONSTRAINT `alert_events_companyId_saas_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `saas_companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_maintenanceId_maintenance_records_id_fk` FOREIGN KEY (`maintenanceId`) REFERENCES `maintenance_records`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_equipmentId_equipment_id_fk` FOREIGN KEY (`equipmentId`) REFERENCES `equipment`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_companyId_saas_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `saas_companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `equipment` ADD CONSTRAINT `equipment_companyId_saas_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `saas_companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `maintenance_records` ADD CONSTRAINT `maintenance_records_equipmentId_equipment_id_fk` FOREIGN KEY (`equipmentId`) REFERENCES `equipment`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `saas_users` ADD CONSTRAINT `saas_users_companyId_saas_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `saas_companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_companyId_saas_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `saas_companies`(`id`) ON DELETE no action ON UPDATE no action;