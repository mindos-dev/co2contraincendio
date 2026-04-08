CREATE TABLE `operis_knowledge_chunks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int,
	`source` varchar(255) NOT NULL,
	`source_type` enum('norm','manual','inspection','budget','custom') NOT NULL DEFAULT 'norm',
	`title` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`embedding` text,
	`tags` varchar(1000),
	`norm_code` varchar(50),
	`section` varchar(100),
	`risk_level` varchar(5),
	`language` varchar(10) DEFAULT 'pt-BR',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `operis_knowledge_chunks_id` PRIMARY KEY(`id`)
);
