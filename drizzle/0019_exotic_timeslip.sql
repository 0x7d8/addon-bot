CREATE TABLE "product_changelogs" (
	"productId" integer NOT NULL,
	"version" varchar(51) NOT NULL,
	"content" text NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_changelogs" ADD CONSTRAINT "product_changelogs_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "productChangelogs_productId_version_idx" ON "product_changelogs" USING btree ("productId","version");--> statement-breakpoint
CREATE INDEX "productChangelogs_productId_idx" ON "product_changelogs" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "productChangelogs_created_idx" ON "product_changelogs" USING btree ("created");