CREATE TABLE `orcamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(120) NOT NULL,
	`telefone` varchar(30) NOT NULL,
	`email` varchar(320),
	`empresa` varchar(160),
	`servico` varchar(80) NOT NULL DEFAULT 'sistema-saponificante',
	`mensagem` text,
	`status` enum('novo','em_andamento','respondido') NOT NULL DEFAULT 'novo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orcamentos_id` PRIMARY KEY(`id`)
);
