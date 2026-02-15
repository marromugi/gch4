CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`id_token` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `chat_message` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_session_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`target_form_field_id` text,
	`review_passed` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`chat_session_id`) REFERENCES `chat_session`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_form_field_id`) REFERENCES `form_field`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `chat_session` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text,
	`form_id` text,
	`type` text NOT NULL,
	`conductor_id` text,
	`bootstrap_completed` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`turn_count` integer DEFAULT 0 NOT NULL,
	`soft_cap` integer,
	`hard_cap` integer,
	`soft_capped_at` integer,
	`hard_capped_at` integer,
	`review_fail_streak` integer DEFAULT 0 NOT NULL,
	`extraction_fail_streak` integer DEFAULT 0 NOT NULL,
	`timeout_streak` integer DEFAULT 0 NOT NULL,
	`current_agent` text DEFAULT 'greeter' NOT NULL,
	`plan` text,
	`plan_schema_version` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`submission_id`) REFERENCES `submission`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`form_id`) REFERENCES `form`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`conductor_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `collected_field` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`form_field_id` text NOT NULL,
	`value` text NOT NULL,
	`source` text DEFAULT 'llm' NOT NULL,
	`confirmed` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`submission_id`) REFERENCES `submission`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`form_field_id`) REFERENCES `form_field`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `collected_field_submission_field_idx` ON `collected_field` (`submission_id`,`form_field_id`);--> statement-breakpoint
CREATE TABLE `consent_log` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`consent_type` text NOT NULL,
	`consented` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`submission_id`) REFERENCES `submission`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `event_log` (
	`id` text PRIMARY KEY NOT NULL,
	`form_id` text,
	`submission_id` text,
	`chat_session_id` text,
	`event_type` text NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`form_id`) REFERENCES `form`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`submission_id`) REFERENCES `submission`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`chat_session_id`) REFERENCES `chat_session`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `field_completion_criteria` (
	`id` text PRIMARY KEY NOT NULL,
	`schema_version_id` text NOT NULL,
	`form_field_id` text NOT NULL,
	`criteria_key` text NOT NULL,
	`criteria` text NOT NULL,
	`done_condition` text NOT NULL,
	`questioning_hints` text,
	`boundaries` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`schema_version_id`) REFERENCES `form_schema_version`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`form_field_id`) REFERENCES `form_field`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `field_completion_criteria_version_field_key_idx` ON `field_completion_criteria` (`schema_version_id`,`form_field_id`,`criteria_key`);--> statement-breakpoint
CREATE TABLE `form` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`purpose` text,
	`completion_message` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `form_field` (
	`id` text PRIMARY KEY NOT NULL,
	`form_id` text NOT NULL,
	`field_id` text NOT NULL,
	`label` text NOT NULL,
	`description` text,
	`intent` text,
	`required` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`form_id`) REFERENCES `form`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `form_field_form_id_field_id_idx` ON `form_field` (`form_id`,`field_id`);--> statement-breakpoint
CREATE TABLE `form_schema_version` (
	`id` text PRIMARY KEY NOT NULL,
	`form_id` text NOT NULL,
	`version` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`approved_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`form_id`) REFERENCES `form`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `form_schema_version_form_id_version_idx` ON `form_schema_version` (`form_id`,`version`);--> statement-breakpoint
CREATE TABLE `privacy_request` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`request_type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`requested_at` integer NOT NULL,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`submission_id`) REFERENCES `submission`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `submission` (
	`id` text PRIMARY KEY NOT NULL,
	`form_id` text NOT NULL,
	`schema_version_id` text NOT NULL,
	`respondent_name` text,
	`respondent_email` text,
	`language` text,
	`status` text DEFAULT 'in_progress' NOT NULL,
	`review_completed_at` integer,
	`consent_checked_at` integer,
	`submitted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`form_id`) REFERENCES `form`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`schema_version_id`) REFERENCES `form_schema_version`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `submission_form_status_created_idx` ON `submission` (`form_id`,`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `submission_task` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`field_completion_criteria_id` text NOT NULL,
	`form_field_id` text NOT NULL,
	`criteria` text NOT NULL,
	`done_condition` text NOT NULL,
	`required` integer DEFAULT true NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`collected_value` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`submission_id`) REFERENCES `submission`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`field_completion_criteria_id`) REFERENCES `field_completion_criteria`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`form_field_id`) REFERENCES `form_field`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
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
CREATE INDEX `tool_call_log_session_sequence_idx` ON `tool_call_log` (`session_id`,`sequence`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`custom_prompt` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
