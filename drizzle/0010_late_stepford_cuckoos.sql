CREATE TABLE `billing_invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subscriptionId` int NOT NULL,
	`companyId` int NOT NULL,
	`stripeInvoiceId` varchar(100),
	`stripePaymentIntentId` varchar(100),
	`amountCents` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'brl',
	`status` enum('draft','open','paid','void','uncollectible') NOT NULL DEFAULT 'open',
	`paidAt` timestamp,
	`dueDate` timestamp,
	`hostedInvoiceUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `billing_invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `billing_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`plan` enum('basic','pro','industrial','trial') NOT NULL DEFAULT 'trial',
	`status` enum('trialing','active','past_due','canceled','unpaid','paused') NOT NULL DEFAULT 'trialing',
	`stripeCustomerId` varchar(100),
	`stripeSubscriptionId` varchar(100),
	`stripePriceId` varchar(100),
	`trialEndsAt` timestamp,
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`canceledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `billing_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `equipment` ADD `signageColor` varchar(50);--> statement-breakpoint
ALTER TABLE `equipment` ADD `patrimonyTag` varchar(80);--> statement-breakpoint
ALTER TABLE `equipment` ADD `normReference` varchar(120);--> statement-breakpoint
ALTER TABLE `equipment` ADD `certificationUL` varchar(80);--> statement-breakpoint
ALTER TABLE `equipment` ADD `weightKg` varchar(30);--> statement-breakpoint
ALTER TABLE `equipment` ADD `workingPressureBar` varchar(30);--> statement-breakpoint
ALTER TABLE `equipment` ADD `testPressureBar` varchar(30);--> statement-breakpoint
ALTER TABLE `equipment` ADD `description` text;--> statement-breakpoint
ALTER TABLE `billing_invoices` ADD CONSTRAINT `billing_invoices_subscriptionId_billing_subscriptions_id_fk` FOREIGN KEY (`subscriptionId`) REFERENCES `billing_subscriptions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `billing_invoices` ADD CONSTRAINT `billing_invoices_companyId_saas_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `saas_companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `billing_subscriptions` ADD CONSTRAINT `billing_subscriptions_companyId_saas_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `saas_companies`(`id`) ON DELETE no action ON UPDATE no action;