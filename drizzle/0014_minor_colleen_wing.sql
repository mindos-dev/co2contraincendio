CREATE INDEX `idx_exec_company_created` ON `checklist_executions` (`companyId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_exec_equipment` ON `checklist_executions` (`equipmentId`);--> statement-breakpoint
CREATE INDEX `idx_exec_status` ON `checklist_executions` (`companyId`,`status`);--> statement-breakpoint
CREATE INDEX `idx_doc_company_created` ON `documents` (`companyId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_doc_equipment` ON `documents` (`equipmentId`);