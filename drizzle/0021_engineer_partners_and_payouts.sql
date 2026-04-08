CREATE TABLE `engineer_partners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`crea` varchar(60) NOT NULL,
	`specialty` varchar(255),
	`phone` varchar(30),
	`email` varchar(320),
	`cpf` varchar(20),
	`commission_rate` decimal(5,2) DEFAULT '0.00',
	`fixed_fee` decimal(10,2) DEFAULT '0.00',
	`pix_key` varchar(255),
	`bank_account` varchar(255),
	`service_contract_url` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_by_user_id` int NOT NULL,
	CONSTRAINT `engineer_partners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `freelance_payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`inspection_id` int NOT NULL,
	`engineer_partner_id` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`status` enum('pending_approval','approved','paid','cancelled') NOT NULL DEFAULT 'pending_approval',
	`payment_method` varchar(50),
	`payment_reference` varchar(255),
	`approved_by_user_id` int,
	`approved_at` timestamp,
	`paid_at` timestamp,
	`notes` text,
	`audit_log` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_by_user_id` int NOT NULL,
	CONSTRAINT `freelance_payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `property_inspections` ADD `engineer_partner_id` int;--> statement-breakpoint
ALTER TABLE `property_inspections` ADD `engineer_name` varchar(255);--> statement-breakpoint
ALTER TABLE `property_inspections` ADD `engineer_crea` varchar(60);--> statement-breakpoint
ALTER TABLE `property_inspections` ADD `engineer_contract_url` text;