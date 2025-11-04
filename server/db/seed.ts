import { prisma } from "./client";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "@ExampleAdmin@!";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: "Admin",
    },
  });

  console.log("Admin created:", admin.email);

  const settings = await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "ApologyHub",
      maxApologyLength: 500,
      enableModeration: true,
    },
  });

  console.log("Settings created:", settings.siteName);

  const sampleApologies = [
    {
      content: "I'm sorry for not being there when you needed me most. I was selfish and didn't realize how much you were hurting.",
      toWho: "My best friend",
    },
    {
      content: "I apologize for the harsh words I said in anger. You didn't deserve that, and I regret every moment of it.",
      toWho: "Mom",
    },
    {
      content: "I'm sorry for breaking your trust. I know it will take time to rebuild, but I'm willing to do whatever it takes.",
      toWho: null,
    },
  ];

  for (const apology of sampleApologies) {
    await prisma.apology.create({
      data: apology,
    });
  }

  console.log(`Created ${sampleApologies.length} sample apologies`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.analytics.upsert({
    where: { date: today },
    update: {},
    create: {
      date: today,
      visits: 0,
      submissions: 0,
      views: 0,
    },
  });

  console.log("Analytics initialized");
  console.log("Seeding completed!");
}

const profanityWords = [
  { word: "fuck", language: "en", severity: "high", addedBy: "system" },
  { word: "shit", language: "en", severity: "medium", addedBy: "system" },
  { word: "damn", language: "en", severity: "low", addedBy: "system" },
  { word: "bitch", language: "en", severity: "high", addedBy: "system" },
  { word: "asshole", language: "en", severity: "high", addedBy: "system" },
  { word: "bastard", language: "en", severity: "medium", addedBy: "system" },
  { word: "crap", language: "en", severity: "low", addedBy: "system" },
  { word: "dick", language: "en", severity: "medium", addedBy: "system" },
  { word: "pussy", language: "en", severity: "high", addedBy: "system" },
  { word: "cock", language: "en", severity: "high", addedBy: "system" },
  { word: "anjing", language: "id", severity: "high", addedBy: "system" },
  { word: "babi", language: "id", severity: "high", addedBy: "system" },
  { word: "bangsat", language: "id", severity: "high", addedBy: "system" },
  { word: "kontol", language: "id", severity: "high", addedBy: "system" },
  { word: "memek", language: "id", severity: "high", addedBy: "system" },
  { word: "tolol", language: "id", severity: "medium", addedBy: "system" },
  { word: "bodoh", language: "id", severity: "low", addedBy: "system" },
  { word: "goblok", language: "id", severity: "medium", addedBy: "system" },
  { word: "kampret", language: "id", severity: "medium", addedBy: "system" },
  { word: "tai", language: "id", severity: "medium", addedBy: "system" },
  { word: "jancok", language: "id", severity: "high", addedBy: "system" },
  { word: "asu", language: "id", severity: "high", addedBy: "system" },
  { word: "cok", language: "id", severity: "high", addedBy: "system" },
  { word: "monyet", language: "id", severity: "medium", addedBy: "system" },
  { word: "perek", language: "id", severity: "high", addedBy: "system" },
];

let profanityCount = 0;
for (const profanity of profanityWords) {
  try {
    await prisma.profanityWord.upsert({
      where: { word: profanity.word },
      update: {},
      create: profanity,
    });
    profanityCount++;
  } catch (error) {
    console.log(`Skipping duplicate word: ${profanity.word}`);
  }
}

console.log(`Seeded ${profanityCount} profanity words`);
console.log("Seeding completed!");

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
