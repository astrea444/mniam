export function getStorageItem(key, fallbackValue = null) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallbackValue
  } catch {
    return fallbackValue
  }
}

export function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}
