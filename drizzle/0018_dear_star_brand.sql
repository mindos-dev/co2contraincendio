ALTER TABLE `property_inspections` MODIFY COLUMN `status` enum('rascunho','em_andamento','pending_validation','aguardando_assinatura','concluida','cancelada') NOT NULL DEFAULT 'rascunho';--> statement-breakpoint
ALTER TABLE `property_inspections` ADD `contractId` varchar(30);--> statement-breakpoint
ALTER TABLE `property_inspections` ADD `auditHash` varchar(64);--> statement-breakpoint
ALTER TABLE `property_inspections` ADD `lockedAt` timestamp;--> statement-breakpoint
ALTER TABLE `property_inspections` ADD `lockedByUserId` int;--> statement-breakpoint
ALTER TABLE `property_inspections` ADD CONSTRAINT `property_inspections_contractId_unique` UNIQUE(`contractId`);