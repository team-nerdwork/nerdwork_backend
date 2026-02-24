ALTER TABLE "user_transactions" ADD COLUMN "paystack_payment_id" varchar(255);--> statement-breakpoint
ALTER TABLE "user_transactions" ADD COLUMN "paystack_reference" varchar(255);