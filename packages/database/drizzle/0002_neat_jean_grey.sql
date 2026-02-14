CREATE TABLE `tool_call_log` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`sequence` integer NOT NULL,
	`agent` text NOT NULL,
	`tool_name` text NOT NULL,
	`args` text NOT NULL,
	`result` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `chat_session`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tool_call_log_session_sequence_idx` ON `tool_call_log` (`session_id`,`sequence`);