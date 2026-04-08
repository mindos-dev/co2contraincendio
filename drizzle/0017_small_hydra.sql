ALTER TABLE `property_inspections` ADD `redutorSocial` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `property_inspections` ADD `clausulaVigencia` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `property_inspections` ADD `garantiaType` enum('caucao','fiador','seguro_fianca','sem_garantia') DEFAULT 'seguro_fianca';--> statement-breakpoint
ALTER TABLE `property_inspections` ADD `propertyCep` varchar(10);--> statement-breakpoint
ALTER TABLE `property_inspections` ADD `propertyStreet` varchar(200);--> statement-breakpoint
ALTER TABLE `property_inspections` ADD `propertyNeighborhood` varchar(100);--> statement-breakpoint
ALTER TABLE `property_inspections` ADD `propertyCity` varchar(100);--> statement-breakpoint
ALTER TABLE `property_inspections` ADD `propertyState` varchar(2);