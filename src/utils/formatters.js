export function formatCalories(calories) {
  return `${Math.round(calories || 0)} kcal`
}

export function formatPrepTime(minutes) {
  if (!minutes) return '0 min'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMin = minutes % 60
  return remainingMin > 0 ? `${hours}h ${remainingMin}m` : `${hours}h`
}

export function formatAmount(amount, unit = 'szt') {
  return `${amount} ${unit}`
}

const UNIT_SCALE = {
  'kg_g': 1000,
  'g_kg': 1 / 1000,
  'l_ml': 1000,
  'ml_l': 1 / 1000,
}

export function areUnitsCompatible(unitA, unitB) {
  if (!unitA || !unitB) return false
  const a = unitA.toLowerCase().trim()
  const b = unitB.toLowerCase().trim()
  if (a === b) return true
  return `${a}_${b}` in UNIT_SCALE
}

export function normalizeUnits(amount, fromUnit, toUnit) {
  if (!fromUnit || !toUnit) return amount
  const from = fromUnit.toLowerCase().trim()
  const to = toUnit.toLowerCase().trim()
  if (from === to) return amount
  const key = `${from}_${to}`
  const scale = UNIT_SCALE[key]
  return scale != null ? amount * scale : amount
}

