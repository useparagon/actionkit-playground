PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Chat` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`messages` text NOT NULL,
	`userId` text NOT NULL,
	`systemPrompt` text NOT NULL,
	`tools` text NOT NULL,
	`modelName` text NOT NULL,
	`modelProvider` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_Chat`("id", "createdAt", "messages", "userId", "systemPrompt", "tools", "modelName", "modelProvider") SELECT "id", "createdAt", "messages", "userId", "systemPrompt", "tools", "modelName", "modelProvider" FROM `Chat`;--> statement-breakpoint
DROP TABLE `Chat`;--> statement-breakpoint
ALTER TABLE `__new_Chat` RENAME TO `Chat`;--> statement-breakpoint
PRAGMA foreign_keys=ON;