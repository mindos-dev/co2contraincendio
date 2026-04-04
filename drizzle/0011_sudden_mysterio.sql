CREATE TABLE `inspection_rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inspectionId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` enum('sala','quarto','cozinha','banheiro','area_servico','garagem','varanda','corredor','outro') NOT NULL DEFAULT 'outro',
	`order` int NOT NULL DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inspection_rooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `property_inspections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`createdByUserId` int NOT NULL,
	`type` enum('entrada','saida','periodica','devolucao') NOT NULL DEFAULT 'entrada',
	`status` enum('rascunho','em_andamento','aguardando_assinatura','concluida','cancelada') NOT NULL DEFAULT 'rascunho',
	`propertyAddress` text NOT NULL,
	`propertyType` enum('apartamento','casa','sala_comercial','galpao','outro') NOT NULL DEFAULT 'apartamento',
	`propertyArea` varchar(20),
	`propertyRegistration` varchar(100),
	`landlordName` varchar(200) NOT NULL,
	`landlordCpfCnpj` varchar(20),
	`landlordPhone` varchar(30),
	`landlordEmail` varchar(320),
	`tenantName` varchar(200) NOT NULL,
	`tenantCpfCnpj` varchar(20),
	`tenantPhone` varchar(30),
	`tenantEmail` varchar(320),
	`contractNumber` varchar(100),
	`contractStartDate` timestamp,
	`contractEndDate` timestamp,
	`rentValue` varchar(30),
	`inspectorName` varchar(200),
	`inspectorCrea` varchar(50),
	`inspectorCompany` varchar(200),
	`reportHtml` text,
	`reportSlug` varchar(100),
	`landlordSignatureUrl` text,
	`tenantSignatureUrl` text,
	`inspectorSignatureUrl` text,
	`landlordSignedAt` timestamp,
	`tenantSignedAt` timestamp,
	`inspectorSignedAt` timestamp,
	`generalNotes` text,
	`inspectedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `property_inspections_id` PRIMARY KEY(`id`),
	CONSTRAINT `property_inspections_reportSlug_unique` UNIQUE(`reportSlug`)
);
--> statement-breakpoint
CREATE TABLE `room_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`inspectionId` int NOT NULL,
	`name` varchar(150) NOT NULL,
	`category` enum('piso','parede','teto','porta','janela','eletrico','hidraulico','movel','equipamento','outro') NOT NULL DEFAULT 'outro',
	`condition` enum('otimo','bom','regular','ruim','pessimo','inexistente') DEFAULT 'bom',
	`notes` text,
	`photoUrl` text,
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `room_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `inspection_rooms` ADD CONSTRAINT `inspection_rooms_inspectionId_property_inspections_id_fk` FOREIGN KEY (`inspectionId`) REFERENCES `property_inspections`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `property_inspections` ADD CONSTRAINT `property_inspections_companyId_saas_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `saas_companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `property_inspections` ADD CONSTRAINT `property_inspections_createdByUserId_saas_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `saas_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `room_items` ADD CONSTRAINT `room_items_roomId_inspection_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `inspection_rooms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `room_items` ADD CONSTRAINT `room_items_inspectionId_property_inspections_id_fk` FOREIGN KEY (`inspectionId`) REFERENCES `property_inspections`(`id`) ON DELETE no action ON UPDATE no action;