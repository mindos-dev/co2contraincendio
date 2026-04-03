ALTER TABLE `saas_users` ADD `resetToken` varchar(255);--> statement-breakpoint
ALTER TABLE `saas_users` ADD `resetTokenExpiry` timestamp;