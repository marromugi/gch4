-- Drop Job and Application related tables
-- Order: dependent tables first (reverse order of creation)

-- Drop tables that depend on job_form_field and job_schema_version
DROP TABLE IF EXISTS `prohibited_topic`;
--> statement-breakpoint
DROP TABLE IF EXISTS `field_fact_definition`;
--> statement-breakpoint

-- Drop tables that depend on review_policy_version
DROP TABLE IF EXISTS `review_policy_signal`;
--> statement-breakpoint

-- Drop tables that depend on application
DROP TABLE IF EXISTS `privacy_request`;
--> statement-breakpoint
DROP TABLE IF EXISTS `interview_feedback`;
--> statement-breakpoint
DROP TABLE IF EXISTS `chat_message`;
--> statement-breakpoint
DROP TABLE IF EXISTS `chat_session`;
--> statement-breakpoint
DROP TABLE IF EXISTS `consent_log`;
--> statement-breakpoint
DROP TABLE IF EXISTS `extracted_field`;
--> statement-breakpoint
DROP TABLE IF EXISTS `application_todo`;
--> statement-breakpoint

-- Drop review_policy_version (depends on job)
DROP TABLE IF EXISTS `review_policy_version`;
--> statement-breakpoint

-- Drop application (depends on job)
DROP TABLE IF EXISTS `application`;
--> statement-breakpoint

-- Drop job_schema_version (depends on job)
DROP TABLE IF EXISTS `job_schema_version`;
--> statement-breakpoint

-- Drop job_form_field (depends on job)
DROP TABLE IF EXISTS `job_form_field`;
--> statement-breakpoint

-- Drop job table
DROP TABLE IF EXISTS `job`;
