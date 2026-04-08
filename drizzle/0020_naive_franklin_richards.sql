ALTER TABLE `property_inspections` ADD `landlordSignedIp` varchar(45);--> statement-breakpoint
ALTER TABLE `property_inspections` ADD `tenantSignedIp` varchar(45);--> statement-breakpoint
ALTER TABLE `property_inspections` ADD `inspectorSignedIp` varchar(45);--> statement-breakpoint
ALTER TABLE `property_inspections` ADD `landlordSignedHash` varchar(64);--> statement-breakpoint
ALTER TABLE `property_inspections` ADD `tenantSignedHash` varchar(64);--> statement-breakpoint
ALTER TABLE `property_inspections` ADD `inspectorSignedHash` varchar(64);--> statement-breakpoint
ALTER TABLE `room_items` ADD `photoUrl2` text;--> statement-breakpoint
ALTER TABLE `room_items` ADD `photoGps` varchar(60);--> statement-breakpoint
ALTER TABLE `room_items` ADD `photoTimestamp` timestamp;