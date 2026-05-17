// Database seeding temporarily disabled while using pg driver workaround
// Will be re-enabled once Prisma client generation is fixed on Windows

async function main() {
  console.log('⏭️  Database seeding skipped (using pg driver workaround)');
}

main()
  .then(() => {
    console.log('✅ Seed completed');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  });
