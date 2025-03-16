export interface Configuration {
  bannedWords: string[];
  replacementText: string;
  filterMode: 'hide' | 'fade' | 'none' | 'emoji';
  bannedPostClasses: string[];
  emojiReplacement?: string;
}

export const DEFAULT_CONFIG: Configuration = {
  bannedWords: ['elon', 'musk', 'trump', 'biden', 'israel', 'putin', 'afd', 'weidel'],
  replacementText: '🚫 Filtered out',
  filterMode: 'fade',
  bannedPostClasses: [],
  emojiReplacement: '🐣'
};
