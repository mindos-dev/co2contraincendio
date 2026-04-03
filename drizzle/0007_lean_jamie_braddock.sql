CREATE TABLE `checklist_executions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workOrderId` int,
	`templateId` int NOT NULL,
	`companyId` int NOT NULL,
	`equipmentId` int,
	`executedById` int,
	`status` enum('em_andamento','concluido','cancelado') NOT NULL DEFAULT 'em_andamento',
	`responses` json,
	`score` int,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checklist_executions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	`section` varchar(100),
	`description` varchar(500) NOT NULL,
	`normClause` varchar(50),
	`required` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checklist_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklist_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`category` varchar(100),
	`normReference` varchar(100),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checklist_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `work_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`equipmentId` int,
	`number` varchar(30) NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`type` enum('preventiva','corretiva','inspecao','instalacao','desativacao') NOT NULL DEFAULT 'preventiva',
	`priority` enum('baixa','media','alta','critica') NOT NULL DEFAULT 'media',
	`status` enum('aberta','em_andamento','aguardando_peca','concluida','cancelada') NOT NULL DEFAULT 'aberta',
	`assignedToId` int,
	`scheduledDate` date,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`estimatedHours` int,
	`actualHours` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `work_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `checklist_executions` ADD CONSTRAINT `checklist_executions_workOrderId_work_orders_id_fk` FOREIGN KEY (`workOrderId`) REFERENCES `work_orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklist_executions` ADD CONSTRAINT `checklist_executions_templateId_checklist_templates_id_fk` FOREIGN KEY (`templateId`) REFERENCES `checklist_templates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklist_executions` ADD CONSTRAINT `checklist_executions_companyId_saas_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `saas_companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklist_executions` ADD CONSTRAINT `checklist_executions_equipmentId_equipment_id_fk` FOREIGN KEY (`equipmentId`) REFERENCES `equipment`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklist_executions` ADD CONSTRAINT `checklist_executions_executedById_saas_users_id_fk` FOREIGN KEY (`executedById`) REFERENCES `saas_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklist_items` ADD CONSTRAINT `checklist_items_templateId_checklist_templates_id_fk` FOREIGN KEY (`templateId`) REFERENCES `checklist_templates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklist_templates` ADD CONSTRAINT `checklist_templates_companyId_saas_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `saas_companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_companyId_saas_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `saas_companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_equipmentId_equipment_id_fk` FOREIGN KEY (`equipmentId`) REFERENCES `equipment`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `work_orders` ADD CONSTRAINT `work_orders_assignedToId_saas_users_id_fk` FOREIGN KEY (`assignedToId`) REFERENCES `saas_users`(`id`) ON DELETE no action ON UPDATE no action;