export const MEAL_SLOTS = [
  { key: 'breakfast', label: 'Śniadanie' },
  { key: 'lunch', label: 'Obiad', },
  { key: 'dinner', label: 'Kolacja' },
  { key: 'snack', label: 'Przekąska' },
]

export const MEAL_SLOT_META = Object.fromEntries(
  MEAL_SLOTS.map(s => [s.key, { label: s.label}])
)

export const MEAL_SLOT_OPTIONS = MEAL_SLOTS.map(s => ({ label: s.label, value: s.key }))

export const RECIPE_CATEGORIES = [
  { key: 'breakfast', label: 'Śniadanie' },
  { key: 'lunch', label: 'Obiad' },
  { key: 'dinner', label: 'Kolacja' },
  { key: 'snack', label: 'Przekąska' },
]

export const RECIPE_CATEGORY_LABELS = Object.fromEntries(
  RECIPE_CATEGORIES.map(c => [c.key, c.label])
)

export function getRecipeCategoryLabel(key) {
  return RECIPE_CATEGORY_LABELS[key] ?? key
}

export const DIFFICULTY_LEVELS = [
  { key: 'easy', label: 'Łatwy' },
  { key: 'medium', label: 'Średni' },
  { key: 'hard', label: 'Trudny' },
]

export const DIFFICULTY_LABELS = Object.fromEntries(
  DIFFICULTY_LEVELS.map(d => [d.key, d.label])
)

export function getDifficultyLabel(key) {
  return DIFFICULTY_LABELS[key] ?? key
}
