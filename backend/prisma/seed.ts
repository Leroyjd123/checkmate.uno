import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with test data...\n');

  // Clear existing data
  await prisma.move.deleteMany();
  await prisma.gameCard.deleteMany();
  await prisma.game.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      themePreference: 'light',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      themePreference: 'dark',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      themePreference: 'light',
    },
  });

  console.log('✅ Created 3 test users:');
  console.log(`   - alice@example.com`);
  console.log(`   - bob@example.com`);
  console.log(`   - charlie@example.com\n`);

  // Create test games
  const localGame = await prisma.game.create({
    data: {
      mode: 'local',
      status: 'in_progress',
      boardState: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      currentTurn: 'white',
      activeEffects: [],
    },
  });

  const onlineGame = await prisma.game.create({
    data: {
      mode: 'online',
      status: 'waiting',
      roomCode: 'ABC123',
      boardState: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      currentTurn: 'white',
      activeEffects: [],
      hostId: user1.id,
    },
  });

  const completedGame = await prisma.game.create({
    data: {
      mode: 'online',
      status: 'completed',
      roomCode: 'XYZ789',
      boardState: '6k1/5Q2/6K1/8/8/8/8/8 b - - 0 1',
      currentTurn: 'black',
      activeEffects: [],
      hostId: user1.id,
      guestId: user2.id,
      winnerId: user1.id,
    },
  });

  console.log('✅ Created 3 test games:');
  console.log(`   - Local game (in_progress)`);
  console.log(`   - Online game (waiting) - room code: ABC123`);
  console.log(`   - Completed game (Alice won)\n`);

  // Create cards for local game
  const cardTypes = [
    'skip_turn',
    'reverse_move',
    'extra_move',
    'teleport',
    'shield',
    'sacrifice',
    'wild_swap',
    'freeze',
  ];

  for (let i = 0; i < 3; i++) {
    await prisma.gameCard.create({
      data: {
        gameId: localGame.id,
        cardType: cardTypes[i] as any,
        status: 'available',
      },
    });
  }

  for (let i = 3; i < 6; i++) {
    await prisma.gameCard.create({
      data: {
        gameId: localGame.id,
        cardType: cardTypes[i] as any,
        status: 'available',
      },
    });
  }

  console.log('✅ Created 6 power cards for local game\n');

  // Create cards for online game
  for (let i = 0; i < 3; i++) {
    await prisma.gameCard.create({
      data: {
        gameId: onlineGame.id,
        playerId: user1.id,
        cardType: cardTypes[i] as any,
        status: 'available',
      },
    });
  }

  for (let i = 3; i < 6; i++) {
    await prisma.gameCard.create({
      data: {
        gameId: onlineGame.id,
        playerId: null, // Waiting for guest
        cardType: cardTypes[i] as any,
        status: 'available',
      },
    });
  }

  console.log('✅ Created 6 power cards for online game\n');

  // Create sample moves
  await prisma.move.create({
    data: {
      gameId: completedGame.id,
      playerId: user1.id,
      moveNotation: 'e2e4',
    },
  });

  await prisma.move.create({
    data: {
      gameId: completedGame.id,
      playerId: user2.id,
      moveNotation: 'e7e5',
    },
  });

  console.log('✅ Created sample move history\n');

  console.log('🎉 Database seeding complete!\n');
  console.log('Test credentials:');
  console.log('  Email: alice@example.com');
  console.log('  Email: bob@example.com');
  console.log('  Email: charlie@example.com');
  console.log('  (Password: any, auth is by email only in this seed)\n');
  console.log('Test room code: ABC123 (join online game)\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('✅ Seed completed successfully');
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
