CREATE TABLE `project_checklist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`company_id` int NOT NULL,
	`label` varchar(255) NOT NULL,
	`status` enum('ok','warning','critical','pending') NOT NULL DEFAULT 'pending',
	`notes` text,
	`photo_url` varchar(1000),
	`sort_order` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_checklist_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_financial_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`company_id` int NOT NULL,
	`type` enum('cost','payment','invoice') NOT NULL,
	`description` varchar(500) NOT NULL,
	`amount` int NOT NULL,
	`paid_at` timestamp,
	`attachment_url` varchar(1000),
	`attachment_type` varchar(50),
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `project_financial_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` enum('inspection','fire','work_order') NOT NULL,
	`status` enum('draft','in_progress','completed','cancelled') NOT NULL DEFAULT 'draft',
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`responsible_id` int,
	`client_name` varchar(255),
	`client_contact` varchar(255),
	`address` text,
	`description` text,
	`inspection_id` int,
	`fire_system_id` int,
	`work_order_id` int,
	`total_cost` int DEFAULT 0,
	`total_paid` int DEFAULT 0,
	`report_generated` int DEFAULT 0,
	`report_url` varchar(1000),
	`tags` varchar(500),
	`notes` text,
	`start_date` timestamp,
	`due_date` timestamp,
	`completed_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
