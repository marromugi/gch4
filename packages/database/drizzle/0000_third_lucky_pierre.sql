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
CREATE TABLE `application` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`schema_version_id` text NOT NULL,
	`applicant_name` text,
	`applicant_email` text,
	`language` text,
	`country` text,
	`timezone` text,
	`status` text DEFAULT 'new' NOT NULL,
	`meet_link` text,
	`extraction_reviewed_at` integer,
	`consent_checked_at` integer,
	`submitted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `job`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`schema_version_id`) REFERENCES `job_schema_version`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `application_job_status_created_idx` ON `application` (`job_id`,`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `application_todo` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`field_fact_definition_id` text NOT NULL,
	`job_form_field_id` text NOT NULL,
	`fact` text NOT NULL,
	`done_criteria` text NOT NULL,
	`required` integer DEFAULT true NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`extracted_value` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `application`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`field_fact_definition_id`) REFERENCES `field_fact_definition`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`job_form_field_id`) REFERENCES `job_form_field`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `chat_message` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_session_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`target_job_form_field_id` text,
	`target_review_signal_id` text,
	`review_passed` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`chat_session_id`) REFERENCES `chat_session`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_job_form_field_id`) REFERENCES `job_form_field`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`target_review_signal_id`) REFERENCES `review_policy_signal`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `chat_session` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text,
	`job_id` text,
	`policy_version_id` text,
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
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `application`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`job_id`) REFERENCES `job`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`policy_version_id`) REFERENCES `review_policy_version`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`conductor_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `consent_log` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`consent_type` text NOT NULL,
	`consented` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `application`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `event_log` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text,
	`application_id` text,
	`chat_session_id` text,
	`policy_version_id` text,
	`event_type` text NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `job`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`application_id`) REFERENCES `application`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`chat_session_id`) REFERENCES `chat_session`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`policy_version_id`) REFERENCES `review_policy_version`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `extracted_field` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`job_form_field_id` text NOT NULL,
	`value` text NOT NULL,
	`source` text DEFAULT 'llm' NOT NULL,
	`confirmed` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `application`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`job_form_field_id`) REFERENCES `job_form_field`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `extracted_field_app_field_idx` ON `extracted_field` (`application_id`,`job_form_field_id`);--> statement-breakpoint
CREATE TABLE `field_fact_definition` (
	`id` text PRIMARY KEY NOT NULL,
	`schema_version_id` text NOT NULL,
	`job_form_field_id` text NOT NULL,
	`fact_key` text NOT NULL,
	`fact` text NOT NULL,
	`done_criteria` text NOT NULL,
	`questioning_hints` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`schema_version_id`) REFERENCES `job_schema_version`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`job_form_field_id`) REFERENCES `job_form_field`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `field_fact_def_version_field_key_idx` ON `field_fact_definition` (`schema_version_id`,`job_form_field_id`,`fact_key`);--> statement-breakpoint
CREATE TABLE `interview_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`chat_session_id` text NOT NULL,
	`policy_version_id` text NOT NULL,
	`structured_data` text,
	`structured_schema_version` integer DEFAULT 1 NOT NULL,
	`summary_confirmed_at` integer,
	`submitted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `application`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`chat_session_id`) REFERENCES `chat_session`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`policy_version_id`) REFERENCES `review_policy_version`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `job` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`ideal_candidate` text,
	`culture_context` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `job_form_field` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`field_id` text NOT NULL,
	`label` text NOT NULL,
	`intent` text,
	`required` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `job`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `job_form_field_job_id_field_id_idx` ON `job_form_field` (`job_id`,`field_id`);--> statement-breakpoint
CREATE TABLE `job_schema_version` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`version` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`approved_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `job`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `job_schema_version_job_id_version_idx` ON `job_schema_version` (`job_id`,`version`);--> statement-breakpoint
CREATE TABLE `privacy_request` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`request_type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`requested_at` integer NOT NULL,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `application`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `prohibited_topic` (
	`id` text PRIMARY KEY NOT NULL,
	`schema_version_id` text NOT NULL,
	`job_form_field_id` text NOT NULL,
	`topic` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`schema_version_id`) REFERENCES `job_schema_version`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`job_form_field_id`) REFERENCES `job_form_field`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `review_policy_signal` (
	`id` text PRIMARY KEY NOT NULL,
	`policy_version_id` text NOT NULL,
	`signal_key` text NOT NULL,
	`label` text NOT NULL,
	`description` text,
	`priority` text NOT NULL,
	`category` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`policy_version_id`) REFERENCES `review_policy_version`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `review_policy_signal_unique` ON `review_policy_signal` (`policy_version_id`,`signal_key`);--> statement-breakpoint
CREATE TABLE `review_policy_version` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`version` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`soft_cap` integer DEFAULT 6 NOT NULL,
	`hard_cap` integer DEFAULT 10 NOT NULL,
	`created_by` text NOT NULL,
	`confirmed_at` integer,
	`published_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `job`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `review_policy_job_version_idx` ON `review_policy_version` (`job_id`,`version`);--> statement-breakpoint
CREATE TABLE `review_prohibited_topic` (
	`id` text PRIMARY KEY NOT NULL,
	`policy_version_id` text NOT NULL,
	`topic` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`policy_version_id`) REFERENCES `review_policy_version`(`id`) ON UPDATE no action ON DELETE cascade
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
