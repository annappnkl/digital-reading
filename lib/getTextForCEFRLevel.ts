import { storyDictionary } from './storyDictionary';

export function getTextForCEFRLevel(step: number): string {
  const level = localStorage.getItem('english_level') || 'B2';

  // Map input levels to story sets
  let storyKey: keyof typeof storyDictionary = 'B2';
  if (['A1', 'A2', 'basic'].includes(level)) storyKey = 'B2'; // easiest stories
  else if (['B1', 'B2', 'intermediate'].includes(level)) storyKey = 'C2'; // medium stories
  else if (['C1', 'C2', 'fluent', 'native'].includes(level)) storyKey = 'D1'; // hardest stories

  const stories = storyDictionary[storyKey];
  return stories[step % stories.length]; // Safe cycle if more steps than stories
}
