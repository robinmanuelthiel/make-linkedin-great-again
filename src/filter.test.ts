import { getBannedWordPattern } from './filter';

const bannedWords = ['KI', 'elon', 'musk'];
const testCases = [
  { text: 'KI is important.', matches: ['KI'] },
  { text: 'This is #KI and #AI.', matches: ['KI'] },
  { text: 'Elon Musk is in the news.', matches: ['elon', 'musk'] },
  { text: 'This is all about Elon.', matches: ['elon'] }, // Elon at the end here with a period
  { text: 'This is about #elon and #musk.', matches: ['elon', 'musk'] },
  { text: 'No banned words here.', matches: [] },
  { text: 'KIel is a city.', matches: [] }, // Should not match 'KI' in 'KIel'
  { text: 'Check #KI!', matches: ['KI'] },
  { text: 'Check #musketeer.', matches: [] }, // Should not match 'musk' in 'musketeer'
  { text: 'KI, elon, and musk are all here.', matches: ['KI', 'elon', 'musk'] },
  { text: 'Hashtag #KI, normal KI, and #elon.', matches: ['KI', 'KI', 'elon'] },
  { text: 'Musk', matches: ['musk'] } // One word sentence
];

function getMatches(text: string, bannedWords: string[]): string[] {
  const found: string[] = [];
  bannedWords.forEach(word => {
    const pattern = getBannedWordPattern(word);
    let match;
    while ((match = pattern.exec(text))) {
      found.push(word);
    }
  });
  return found;
}

// Run the tests
let allPass = true;
testCases.forEach(({ text, matches }, idx) => {
  const found = getMatches(text, bannedWords);
  const pass = JSON.stringify(found.sort()) === JSON.stringify(matches.sort());
  console.log(`Test ${idx + 1}: ${pass ? 'PASS' : 'FAIL'}`);
  if (!pass) {
    allPass = false;
    console.log(`  Text: ${text}`);
    console.log(`  Expected: ${JSON.stringify(matches)}, Found: ${JSON.stringify(found)}`);
  }
});

if (allPass) process.exit(0);
else process.exit(1);
