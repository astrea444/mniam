export const TOAST = {
  SHOPPING: {
    ADDED: "Dodano produkt do listy zakupów.",
    GENERATED: (count) => `Wygenerowano ${count} produktów z planu posiłków.`,
    EMPTY_PLAN:
      "Plan na ten tydzień jest pusty albo wszystko masz już w spiżarni.",
    CLEARED: "Wyczyszczono kupione produkty z listy.",
    RECIPE_ADDED: "Dodano składniki przepisu do listy zakupów.",
  },
  PANTRY: {
    ADDED: "Dodano produkt do spiżarni.",
    REMOVED: (name) => `Usunięto "${name}" ze spiżarni.`,
  },
  FAVORITES: {
    ADDED: (name) => `Dodano "${name}" do ulubionych.`,
    REMOVED: (name) => `Usunięto "${name}" z ulubionych.`,
  },
  MEAL_PLAN: {
    PLANNED: (name) => `Dodano "${name}" do planu.`,
    EATEN: (name) => `Oznaczono "${name}" jako zjedzone.`,
    UNMARK: "Cofnięto oznaczenie posiłku.",
    COPIED: "Skopiowano posiłki z wczorajszego dnia.",
    NO_PLAN: "Wczorajszy dzień nie ma zaplanowanych posiłków.",
    SAVED: "Zaktualizowano posiłki na wybrany dzień.",
  },
  SETTINGS: {
    CALORIE_UPDATED: "Zaktualizowano dzienny cel kalorii.",
    PROFILE_UPDATED: "Zaktualizowano dane profilu.",
    DATA_EXPORTED: "Wyeksportowano dane.",
  },
};
