CREATE TABLE "github_connection" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"owner_type" text NOT NULL,
	"owner_login" text NOT NULL,
	"owner_id" text,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "github_connection" ADD CONSTRAINT "github_connection_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "github_connection_user_id_idx" ON "github_connection" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "github_connection_user_owner_uidx" ON "github_connection" USING btree ("user_id","owner_type","owner_login");