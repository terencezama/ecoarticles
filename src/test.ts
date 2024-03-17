import * as natural from "natural";
import * as fs from "fs";
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();
const tokenizer = new natural.WordTokenizer();

interface TermItem {
  word: string;
  tfidf: number;
}

interface BigramItem {
  phrase: string;
  count: number;
}

/**
 * Extracts keywords from a text.
 * @param text The text to extract keywords from.
 * @returns An array of keywords.
 */
function extractKeywords(text: string): string[] {
  tfidf.addDocument(text);
  let items: TermItem[] = [];

  tfidf.listTerms(0).forEach((item) => {
    items.push({ word: item.term, tfidf: item.tfidf });
  });

  items.sort((a, b) => b.tfidf - a.tfidf);

  return items.map((item) => item.word);
}

/**
 * Generates bigrams from a text.
 * @param text The text to generate bigrams from.
 * @returns An array of bigrams.
 */
function generateBigrams(text: string): BigramItem[] {
  const words =
    tokenizer.tokenize(text)?.filter((word) => isNaN(Number(word))) || [];
  let bigrams: Map<string, number> = new Map();
  console.log(words);

  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
  }

  let bigramItems: BigramItem[] = [];
  bigrams.forEach((count, phrase) => {
    bigramItems.push({ phrase, count });
  });

  bigramItems.sort((a, b) => b.count - a.count);

  // Optionally, filter out bigrams below a certain count threshold or limit the number of bigrams
  // For example, to get the top 10 bigrams:
  // bigramItems = bigramItems.slice(0, 10);

  return bigramItems;
}

// Example usage
const text = fs.readFileSync("prompts/test.txt", "utf8").toString();
console.log(text);
const keywords = extractKeywords(text).filter((word) => isNaN(Number(word)));
console.log("Keywords:", keywords);

const bigrams = generateBigrams(text);
console.log(
  "Bigrams:",
  bigrams.map((bigram) => `${bigram.phrase} (${bigram.count})`)
);
