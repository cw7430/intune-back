ALTER TABLE "user"."refresh_token" RENAME COLUMN "expired_at" TO "expires_at";--> statement-breakpoint
DROP INDEX "user"."ix_refresh_token_expire";--> statement-breakpoint
CREATE INDEX "ix_refresh_token_expire" ON "user"."refresh_token" USING btree ("expires_at");