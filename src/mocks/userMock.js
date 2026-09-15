export const INITIAL_USER_PROFILE = {
  name: "Rosie Boyle",
  handle: "rosieboyle",
  email: "rosiebee@gmail.com",
  avatar: "/avatar.jpg",

  calorieGoal: 2000,
  proteinGoal: 120,
  carbsGoal: 220,
  fatGoal: 65,

  dietaryRestrictions: ["Wegetariańskie"],
  allergies: ["Orzechy"],
  weekStartsOn: "monday",

  notifications: [
  ],

  stats: [
    {
      key: "daysWithMniam",
      label: "dni z Mniam",
      value: 12,
      solid: true,
      icon: "PhCalendarHeart",
    },
    {
      key: "completionRate",
      label: "realizacji",
      value: "87%",
      solid: false,
      icon: "PhTarget",
    },
    {
      key: "newRecipes",
      label: "nowe przepisy",
      value: 24,
      solid: false,
      icon: "PhNotebook",
    },
  ],
};