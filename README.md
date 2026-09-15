# MNIAM

Mobilna aplikacja wspierająca planowanie posiłków i organizację codziennych zakupów łącząc planer posiłków, przepisy, spiżarnię i listę zakupów w jeden spójny system.

**Zakres:** identyfikacja wizualna, UI/UX Design, frontend (w toku)
**Okres:** lipiec - wrzesień 2026

## Problem

Planowanie posiłków, robienie zakupów i kontrolowanie zapasów w domu zwykle wymaga kilku niezależnych narzędzi. Same czynności nie są trudne, problemem jest ciągłe przenoszenie informacji między nimi: produkt z listy zakupów nie jest powiązany ze stanem spiżarni, a zaplanowany przepis wymaga ręcznego sprawdzenia, czego jeszcze brakuje.

MNIAM łączy te procesy w jeden system, w którym dane wprowadzone w jednym miejscu są wykorzystywane w kolejnych krokach.

## Jak to działa

- Lista zakupów generuje się automatycznie na podstawie zaplanowanych posiłków i aktualnego stanu spiżarni.
- Przy ręcznym dodawaniu produktów użytkownik dostaje podpowiedzi.
- Zakupione produkty przechodzą bezpośrednio do spiżarni (z możliwością dostosowania szczegółów)
- Składniki przepisu są rozdzielone na te dostępne w spiżarni i te, które trzeba kupić.

## Funkcje


### Planer posiłków
- Widok tygodniowy i dzienny pozwala szybko przełączać się między perspektywami.
- Posiłki można dodawać i edytować w wybranych slotach dnia.
- Aplikacja pokazuje podgląd makroskładników i kalorii dla każdego dnia.
- Posiłki da się przenosić między slotami metodą przeciągnij i upuść.

### Książka przepisów
- Przepisy można wyszukiwać po nazwie i tagach.
- Filtry pozwalają zawężać listę według diety, czasu przygotowania i dopasowania do zapasów.
- Wybrane przepisy da się zapisać jako ulubione.
- Aplikacja proponuje rekomendacje w kategoriach: idealne dopasowanie, zero waste, szybkie posiłki oraz małe co nieco.
- Karta przepisu pokazuje czas przygotowania, poziom trudności oraz podział składników na te, które użytkownik ma w spiżarni, i te, które musi kupić.

### Spiżarnia
- Produkty można dodawać, edytować i usuwać.
- Listę da się wyszukiwać, sortować i filtrować według kategorii i stanu produktu.
- Ilość produktu można zmienić jednym ruchem, a produkt oznaczyć jako zużyty.
- Produkty kończące się lub bliskie terminu ważności są wyraźnie wyróżnione.

### Lista zakupów
- Lista generuje się automatycznie na podstawie planu posiłków albo można dodawać produkty ręcznie.
- Produkty na liście są podzielone na kategorie.
- Listę da się wyszukiwać i filtrować.
- Kupione produkty można oznaczyć jako zrobione.
- Oznaczone produkty przechodzą bezpośrednio do spiżarni.

### Profil użytkownika
- Użytkownik ustawia swoją kaloryczność i preferencje żywieniowe.
- Doświadczenie w aplikacji można personalizować pod te ustawienia.

## Design

Kierunek wizualny oparty na prostych, miękkich formach i kolorystyce nawiązującej do świeżości i produktów spożywczych. Dominująca zieleń jest uzupełniona ciemnym granatem i jasnym tłem, co zapewnia kontrast dla najważniejszych treści.

| Kolor | Hex |
|---|---|
| Granat | `#101828` |
| Akcent | `#91D399` |
| Akcent ciemny | `#6FBF7B` |
| Tło | `#F0F2F5` |

Interfejs opiera się na spójnym zestawie komponentów, typografii i zasad odstępów. Miękkie zaokrąglenia i subtelne cienie zachowują przy tym czytelną strukturę informacji.

## Stack technologiczny

- Vue 3
- Vite
- Pinia
- Vue Router
- SCSS
- Cypress (testy E2E)

## Stan projektu i roadmapa

- [x] **Discovery & UX** — zdefiniowanie problemu, analiza istniejących rozwiązań, projektowanie przepływów, kompletny interfejs i design system.
- [ ] **Implementacja frontendu** *(w toku)* — główne widoki i funkcje zaimplementowane w Vue 3 (Pinia, Vue Router, SCSS, Local Storage); pozostało dopracowanie widoków oraz dodanie onboardingu i logowania.
- [ ] **Backend i synchronizacja danych** — przejście z Local Storage na rozwiązanie wspierające konta użytkowników i synchronizację danych.
- [ ] **Testy i przygotowanie do publikacji.**