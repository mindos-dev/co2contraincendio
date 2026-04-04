CREATE INDEX `idx_equipment_company_created` ON `equipment` (`companyId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_equipment_company_status` ON `equipment` (`companyId`,`status`);--> statement-breakpoint
CREATE INDEX `idx_equipment_company_next_maint` ON `equipment` (`companyId`,`nextMaintenanceDate`);--> statement-breakpoint
CREATE INDEX `idx_maint_equipment_date` ON `maintenance_records` (`equipmentId`,`serviceDate`);--> statement-breakpoint
CREATE INDEX `idx_maint_created` ON `maintenance_records` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_wo_company_status` ON `work_orders` (`companyId`,`status`);--> statement-breakpoint
CREATE INDEX `idx_wo_company_created` ON `work_orders` (`companyId`,`createdAt`);