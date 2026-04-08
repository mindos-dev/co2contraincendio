CREATE TABLE `inspection_comparisons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`entry_inspection_id` int NOT NULL,
	`exit_inspection_id` int,
	`property_address` varchar(500),
	`contract_number` varchar(100),
	`diff_summary` text,
	`overall_condition_entry` varchar(20),
	`overall_condition_exit` varchar(20),
	`depreciation_estimate` decimal(10,2),
	`created_at` timestamp DEFAULT (now()),
	`created_by_user_id` int NOT NULL,
	CONSTRAINT `inspection_comparisons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inspection_maintenance_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`inspection_id` int NOT NULL,
	`pathology_id` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`priority` varchar(20) NOT NULL DEFAULT 'medium',
	`status` varchar(30) NOT NULL DEFAULT 'pendente',
	`due_date` date,
	`estimated_cost` decimal(10,2),
	`assigned_to` varchar(255),
	`is_fire_safety_related` boolean DEFAULT false,
	`co2_service_offered` boolean DEFAULT false,
	`notified_owner` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_by_user_id` int NOT NULL,
	CONSTRAINT `inspection_maintenance_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inspection_pathologies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`inspection_id` int NOT NULL,
	`room_item_id` int,
	`category` varchar(50) NOT NULL,
	`severity` varchar(20) NOT NULL,
	`cause_analysis` text,
	`repair_suggestion` text,
	`estimated_repair_cost` decimal(10,2),
	`photo_context_url` varchar(500),
	`photo_detail_url` varchar(500),
	`risk_score` int DEFAULT 0,
	`notified_owner` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`created_by_user_id` int NOT NULL,
	CONSTRAINT `inspection_pathologies_id` PRIMARY KEY(`id`)
);
