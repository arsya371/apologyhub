import { prisma } from "@/server/db/client";

let profanityCache: { word: string; language: string }[] = [];
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000;

async function getProfanityWords(): Promise<{ word: string; language: string }[]> {
  const now = Date.now();
  
  if (profanityCache.length > 0 && now - lastCacheUpdate < CACHE_DURATION) {
    return profanityCache;
  }

  const words = await prisma.profanityWord.findMany({
    where: { isActive: true },
    select: { word: true, language: true },
  });

  profanityCache = words;
  lastCacheUpdate = now;
  
  return words;
}

export async function containsProfanity(text: string): Promise<boolean> {
  const lowerText = text.toLowerCase();
  const profanityWords = await getProfanityWords();
  
  return profanityWords.some((item) => {
    const word = item.word.toLowerCase();
    const regex = new RegExp(`\\b${word}\\b`, "i");
    return regex.test(lowerText);
  });
}

export async function moderateContent(content: string): Promise<{
  isClean: boolean;
  filtered: string;
  detectedWords: string[];
}> {
  let filtered = content;
  const detectedWords: string[] = [];
  const profanityWords = await getProfanityWords();

  profanityWords.forEach((item) => {
    const word = item.word.toLowerCase();
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    
    if (regex.test(filtered.toLowerCase())) {
      detectedWords.push(word);
      filtered = filtered.replace(regex, "*".repeat(word.length));
    }
  });

  return {
    isClean: detectedWords.length === 0,
    filtered,
    detectedWords,
  };
}

export function validateContentLength(content: string, maxLength: number): boolean {
  return content.length >= 10 && content.length <= maxLength;
}

export function refreshProfanityCache(): void {
  profanityCache = [];
  lastCacheUpdate = 0;
}
