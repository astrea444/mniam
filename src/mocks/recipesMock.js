export const INITIAL_RECIPES = [
  {
    id: "rec-1",
    title: "Owsianka z jagodami i orzechami",
    description: "Pożywne śniadanie bogate w błonnik i antyoksydanty.",
    image:
      "https://images.unsplash.com/photo-1594490150174-b349c66d93c5?auto=format&fit=crop&w=600&q=80",
    prepTime: 10,
    difficulty: "easy",
    category: "breakfast",
    dietCategories: ["vegetarian", "lactose-free", "fit"],
    defaultServings: 1,
    calories: 380,
    protein: 14,
    carbs: 58,
    fat: 10,

    ingredients: [
      {
        name: "Płatki owsiane",
        amount: 60,
        unit: "g",
        category: "grains_pasta",
      },
      {
        name: "Mleko migdałowe",
        amount: 200,
        unit: "ml",
        category: "beverages",
      },
      {
        name: "Jagody",
        amount: 80,
        unit: "g",
        category: "fruits",
      },
      {
        name: "Orzechy włoskie",
        amount: 15,
        unit: "g",
        category: "other",
      },
    ],

    instructions: [
      {
        text: "Zagotuj mleko migdałowe w małym garnuszku.",
        time: 3,
      },
      {
        text: "Dodaj płatki owsiane i gotuj na małym ogniu przez 5 minut, mieszając.",
        time: 5,
      },
      {
        text: "Przełóż do miseczki, udekoruj świeżymi jagodami i posiekanymi orzechami.",
        time: 2,
      },
    ],

    tags: ["Wegetariańskie", "Szybkie"],
    isFavorite: true,
  },

  {
    id: "rec-2",
    title: "Pieczony łosoś z komosą ryżową",
    description: "Zdrowy obiad pełen kwasów Omega-3 i białka.",
    image:
      "https://images.unsplash.com/photo-1539136788836-5699e78bfc75?auto=format&fit=crop&w=600&q=80",
    prepTime: 25,
    difficulty: "medium",
    category: "lunch",
    dietCategories: ["gluten-free", "high-protein", "fit"],
    defaultServings: 1,
    calories: 540,
    protein: 42,
    carbs: 35,
    fat: 22,

    ingredients: [
      {
        name: "Filet z łososia",
        amount: 180,
        unit: "g",
        category: "meat_fish",
      },
      {
        name: "Komosa ryżowa",
        amount: 50,
        unit: "g",
        category: "grains_pasta",
      },
      {
        name: "Brokuł",
        amount: 150,
        unit: "g",
        category: "vegetables",
      },
      {
        name: "Oliwa z oliwek",
        amount: 10,
        unit: "ml",
        category: "oils_fats",
      },
    ],

    instructions: [
      {
        text: "Ugotuj komosę ryżową według instrukcji na opakowaniu.",
        time: 15,
      },
      {
        text: "Przypraw łososia solą, pieprzem i sokiem z cytryny, a następnie usmaż na patelni grillowej.",
        time: 8,
      },
      {
        text: "Ugotuj brokuł na parze i podawaj wszystko razem, skropione oliwą.",
        time: 5,
      },
    ],

    tags: ["Wysokobiałkowe", "Zdrowe"],
    isFavorite: false,
  },

  {
    id: "rec-3",
    title: "Sałatka z komosy z pomidorkami i oliwą",
    description:
      "Lekka sałatka, na którą masz już wszystkie składniki w spiżarni.",
    image:
      "https://images.unsplash.com/photo-1494220394759-e0b232f883ef?auto=format&fit=crop&w=600&q=80",
    prepTime: 10,
    difficulty: "easy",
    category: "dinner",
    dietCategories: ["vegetarian", "gluten-free", "fit"],
    defaultServings: 1,
    calories: 310,
    protein: 9,
    carbs: 40,
    fat: 12,

    ingredients: [
      {
        name: "Komosa ryżowa",
        amount: 50,
        unit: "g",
        category: "grains_pasta",
      },
      {
        name: "Pomidorki koktajlowe",
        amount: 100,
        unit: "g",
        category: "vegetables",
      },
      {
        name: "Oliwa z oliwek",
        amount: 15,
        unit: "ml",
        category: "oils_fats",
      },
    ],

    instructions: [
      {
        text: "Ugotuj komosę ryżową według instrukcji na opakowaniu i odstaw do ostygnięcia.",
        time: 15,
      },
      {
        text: "Przekrój pomidorki koktajlowe na pół.",
        time: 2,
      },
      {
        text: "Wymieszaj komosę z pomidorkami, skrop oliwą i dopraw solą oraz pieprzem.",
        time: 2,
      },
    ],

    tags: ["Wegetariańskie", "Zero zakupów"],
    isFavorite: false,
  },

  {
    id: "rec-4",
    title: "Szybki koktajl mleczny z bananem",
    description:
      "Kremowy koktajl, który wykorzysta mleko migdałowe zanim się zepsuje.",
    image:
      "https://images.unsplash.com/photo-1685967836529-b0e8d6938227?auto=format&fit=crop&w=600&q=80",
    prepTime: 5,
    difficulty: "easy",
    category: "snack",
    dietCategories: ["vegetarian", "lactose-free"],
    defaultServings: 1,
    calories: 220,
    protein: 5,
    carbs: 34,
    fat: 7,

    ingredients: [
      {
        name: "Mleko migdałowe",
        amount: 200,
        unit: "ml",
        category: "beverages",
      },
      {
        name: "Banan",
        amount: 1,
        unit: "szt",
        category: "fruits",
      },
      {
        name: "Miód",
        amount: 10,
        unit: "g",
        category: "other",
      },
    ],

    instructions: [
      {
        text: "Obierz banana i pokrój na kawałki.",
        time: 1,
      },
      {
        text: "Zmiksuj banana z mlekiem migdałowym i miodem do uzyskania gładkiej konsystencji.",
        time: 3,
      },
      {
        text: "Przelej do szklanki i podawaj od razu.",
        time: 1,
      },
    ],

    tags: ["Wegetariańskie", "Szybkie"],
    isFavorite: false,
  },

  {
    id: "rec-5",
    title: "Sałatka pomidorowa z mozzarellą i bazylią",
    description:
      "Prosta caprese, która wykorzysta pomidorki koktajlowe zanim się zepsują.",
    image:
      "https://images.unsplash.com/photo-1769458313860-3c8db667d990?auto=format&fit=crop&w=600&q=80",
    prepTime: 10,
    difficulty: "easy",
    category: "snack",
    dietCategories: ["vegetarian", "gluten-free"],
    defaultServings: 1,
    calories: 280,
    protein: 14,
    carbs: 8,
    fat: 20,

    ingredients: [
      {
        name: "Pomidorki koktajlowe",
        amount: 150,
        unit: "g",
        category: "vegetables",
      },
      {
        name: "Mozzarella",
        amount: 100,
        unit: "g",
        category: "dairy",
      },
      {
        name: "Oliwa z oliwek",
        amount: 10,
        unit: "ml",
        category: "oils_fats",
      },
      {
        name: "Bazylia świeża",
        amount: 5,
        unit: "g",
        category: "spices_herbs",
      },
    ],

    instructions: [
      {
        text: "Przekrój pomidorki koktajlowe na pół.",
        time: 3,
      },
      {
        text: "Pokrój mozzarellę w kostkę i wymieszaj z pomidorkami.",
        time: 4,
      },
      {
        text: "Skrop oliwą, dodaj listki bazylii i dopraw solą.",
        time: 3,
      },
    ],

    tags: ["Wegetariańskie", "Bez grillowania"],
    isFavorite: false,
  },
];
