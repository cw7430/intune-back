CREATE TABLE "user"."user_online_status" (
	"id" bigint NOT NULL,
	"is_online" boolean DEFAULT false NOT NULL,
	"last_seen_at" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "pk_user_online_status" PRIMARY KEY("id")
);
--> statement-breakpoint
ALTER TABLE "user"."user_online_status" ADD CONSTRAINT "fk_user_online_status" FOREIGN KEY ("id") REFERENCES "user"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "ix_user_online_status_is_online" ON "user"."user_online_status" USING btree ("is_online","last_seen_at" DESC NULLS LAST);