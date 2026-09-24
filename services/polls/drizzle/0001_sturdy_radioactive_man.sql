CREATE INDEX `idx_polls_created_at` ON `polls` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_responses_poll_created` ON `responses` (`poll_id`,`created_at`);