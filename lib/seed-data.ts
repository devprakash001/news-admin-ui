import type { DbCategory } from './types'

/** Fresh start: categories only — no demo users or articles */
export function getSeedCategories(): Omit<DbCategory, '_id'>[] {
  return [
    { name: 'Technology', slug: 'technology', description: 'Latest news and innovations in tech.', icon: '🔧', articleCount: 0 },
    { name: 'Business', slug: 'business', description: 'Markets, startups, and enterprise insights.', icon: '💼', articleCount: 0 },
    { name: 'Health', slug: 'health', description: 'Wellness, medicine, and lifestyle.', icon: '🏥', articleCount: 0 },
    { name: 'Sports', slug: 'sports', description: 'Scores, analysis, and athlete stories.', icon: '⚽', articleCount: 0 },
    { name: 'Entertainment', slug: 'entertainment', description: 'Film, music, and culture.', icon: '🎬', articleCount: 0 },
    { name: 'Education', slug: 'education', description: 'Learning, schools, and ed-tech.', icon: '📚', articleCount: 0 },
    { name: 'Politics', slug: 'politics', description: 'Policy, elections, and world affairs.', icon: '🏛️', articleCount: 0 },
  ]
}
