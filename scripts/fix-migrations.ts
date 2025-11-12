import { sql } from "drizzle-orm";
import { db } from "../src/config/db";

async function fixMigrations() {
  console.log("🔧 Fixing migration tracking...\n");

  try {
    // Step 1: Check current migration state
    console.log("📋 Checking current migrations in database...");
    const existingMigrations = await db.execute(
      sql`SELECT * FROM __drizzle_migrations ORDER BY created_at`
    );
    console.log(`Found ${existingMigrations.rows.length} migration records`);
    console.log(existingMigrations.rows);

    // Step 2: Check if wallet_type_enum exists
    console.log("\n🔍 Checking if wallet_type_enum exists...");
    const enumCheck = await db.execute(
      sql`SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wallet_type_enum')`
    );
    const enumExists = enumCheck.rows[0].exists;
    console.log(`wallet_type_enum exists: ${enumExists}`);

    // Step 3: If enum exists but migration record doesn't, add the migration record
    if (enumExists && existingMigrations.rows.length === 0) {
      console.log("\n✍️  Adding migration records...");

      // Add migration 0000
      await db.execute(sql`
        INSERT INTO __drizzle_migrations (hash, created_at)
        VALUES ('0000_spooky_loa', 1759141257584)
        ON CONFLICT DO NOTHING
      `);
      console.log("✓ Added migration 0000_spooky_loa");

      // Check if NFT tables exist (from migration 0001)
      const nftTableCheck = await db.execute(
        sql`SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nfts')`
      );

      if (nftTableCheck.rows[0].exists) {
        await db.execute(sql`
          INSERT INTO __drizzle_migrations (hash, created_at)
          VALUES ('0001_numerous_stick', 1762945376080)
          ON CONFLICT DO NOTHING
        `);
        console.log("✓ Added migration 0001_numerous_stick");
      }
    }

    // Step 4: Add marketplace_purchase to spend_category enum
    console.log("\n📦 Checking spend_category enum...");
    const spendCategoryCheck = await db.execute(sql`
      SELECT enumlabel FROM pg_enum
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'spend_category')
      ORDER BY enumsortorder
    `);

    const enumValues = spendCategoryCheck.rows.map((row: any) => row.enumlabel);
    console.log("Current values:", enumValues);

    if (!enumValues.includes('marketplace_purchase')) {
      console.log("\n✍️  Adding marketplace_purchase to enum...");
      await db.execute(sql`
        ALTER TYPE spend_category ADD VALUE 'marketplace_purchase'
      `);
      console.log("✓ Added marketplace_purchase");

      // Mark migration 0002 as complete
      await db.execute(sql`
        INSERT INTO __drizzle_migrations (hash, created_at)
        VALUES ('0002_chunky_emma_frost', 1762945902192)
        ON CONFLICT DO NOTHING
      `);
      console.log("✓ Added migration 0002_chunky_emma_frost");
    } else {
      console.log("✓ marketplace_purchase already exists");
    }

    // Step 5: Final verification
    console.log("\n✅ Final verification:");
    const finalMigrations = await db.execute(
      sql`SELECT * FROM __drizzle_migrations ORDER BY created_at`
    );
    console.log(`Total migrations recorded: ${finalMigrations.rows.length}`);
    finalMigrations.rows.forEach((row: any) => {
      console.log(`  - ${row.hash} (created: ${new Date(row.created_at).toISOString()})`);
    });

    console.log("\n🎉 Migration fix complete!");
    console.log("You can now run: npm run migrate:dev");

  } catch (error) {
    console.error("❌ Error fixing migrations:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

fixMigrations();
