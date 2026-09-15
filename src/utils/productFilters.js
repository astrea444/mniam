function normalize(str = "") {
  return str.toLowerCase().trim();
}

function getExpiryDays(item) {
  if (!item) return Infinity;
  if (item.expiryDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(item.expiryDate);
    target.setHours(0, 0, 0, 0);
    const days = Math.round((target - today) / (1000 * 60 * 60 * 24));
    return Number.isNaN(days) ? Infinity : days;
  }
  if (item.expiresInDays !== null && item.expiresInDays !== undefined) {
    return Number(item.expiresInDays);
  }
  return Infinity;
}

export function sortProducts(items = [], sortBy = "name-asc") {
  const arr = [...items];
  switch (sortBy) {
    case "name-asc":
      return arr.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", "pl"),
      );
    case "name-desc":
      return arr.sort((a, b) =>
        (b.name || "").localeCompare(a.name || "", "pl"),
      );
    case "amount-asc":
      return arr.sort((a, b) => (a.amount || 0) - (b.amount || 0));
    case "amount-desc":
      return arr.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    case "expiry":
    case "expiry-asc":
      return arr.sort((a, b) => getExpiryDays(a) - getExpiryDays(b));
    case "expiry-desc":
      return arr.sort((a, b) => getExpiryDays(b) - getExpiryDays(a));
    case "checked":
      return arr.sort(
        (a, b) => Number(Boolean(a.checked)) - Number(Boolean(b.checked)),
      );
    default:
      return arr;
  }
}

export function filterProducts(items = [], criteria = {}) {
  const query = normalize(criteria.query);
  const category = criteria.category;

  return items.filter((item) => {
    if (query) {
      const matchName = normalize(item.name).includes(query);
      const matchCategory = item.category
        ? normalize(item.category).includes(query)
        : false;
      if (!matchName && !matchCategory) return false;
    }

    if (category && category !== "Wszystkie") {
      if (item.category !== category) return false;
    }

    return true;
  });
}
