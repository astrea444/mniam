export const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/HomeView.vue"),
    meta: { title: "Planer Posiłków" },
  },
  {
    path: "/recipes",
    name: "recipes",
    component: () => import("../views/RecipesView.vue"),
    meta: { title: "Książka Przepisów" },
  },
  {
    path: "/pantry",
    name: "pantry",
    component: () => import("../views/PantryView.vue"),
    meta: { title: "Moja Spiżarnia" },
  },
  {
    path: "/shopping-list",
    name: "shopping-list",
    component: () => import("../views/ShoppingListView.vue"),
    meta: { title: "Lista Zakupów" },
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("../views/ProfileView.vue"),
    meta: { title: "Mój Profil" },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];