# 👑 LANDZI - Main Dev & UI Architect (Lider Projektu)

Twoim zadaniem jest stworzenie fundamentów aplikacji, dbanie o jej wygląd (Design System) oraz główny ekran "Social Feed". Jako główny dev, ty spinasz wszystko w całość.

### 🏗️ TWOJE ZADANIA (Moduły):
1.  **Konfiguracja Projektu:** Setup Vite + React + TypeScript + Tailwind CSS (polecane dla szybkości i braku konfliktów).
2.  **App Shell:** Dolny pasek nawigacji (Tab Bar) i główny layout.
3.  **Design System:** Konfiguracja Dark/Light mode (Context API) oraz wspólne komponenty (Button, Card, Input).
4.  **Tab 1: Social Feed:** Tablica aktywności znajomych, karty treningów (Workout Cards).
5.  **Integracja:** Łączenie modułów od innych devów w folderze `src/features/`.

### 🛡️ ARCHITEKTURA (Brak konfliktów):
- Pracuj w folderze `src/features/feed/`.
- Globalne style trzymaj w `src/styles/`.
- Wspólne komponenty in `src/components/ui/`.
- **ZASADA:** Każdy dev ma swój folder w `features/`. Nie edytujemy nawzajem swoich plików bez konsultacji.

### 🚀 GOTOWY PROMPT DO AI (Wklej to do Claude/ChatGPT):
> "Jesteś ekspertem React i Tailwind CSS. Pomóż mi stworzyć fundamenty projektu 'PlateUp' (aplikacja fitness). 
> 1. Skonfiguruj projekt Vite + React + TS + Tailwind. 
> 2. Stwórz 'ThemeProvider' obsługujący Dark Mode i Light Mode.
> 3. Zbuduj 'AppShell' z dolnym paskiem nawigacji (Feed, Workout, Profile).
> 4. Zaimplementuj ekran 'Social Feed' (Tab 1) z kartami treningów. Karta musi zawierać: Avatar użytkownika, nazwę treningu, statystyki (Czas, Objętość, Serie, PR - na złoto) oraz listę ćwiczeń w formie 'Compact List View'.
> 5. Dodaj przycisk 'Save Routine' w stopce karty.
> Użyj czystego kodu, nowoczesnego UI z zaokrągleniami 12px i dużym spacingiem (Padding 16px)."

### 🛠️ JAK SPRAWDZIĆ I ULEPSZYĆ:
- **Jak sprawdzić:** Uruchom `npm run dev`. Sprawdź czy przełączanie Dark/Light mode nie psuje czytelności tekstu (używaj kolorów semantycznych).
- **Działanie:** Feed powinien być scrollowalny, a nawigacja powinna płynnie zmieniać widoki bez przeładowania strony.
- **Pole do popisu:** Dodaj mikro-interakcje (np. serduszko pulsujące przy kliknięciu "Like") lub szkielety (Skeleton Screens) podczas ładowania danych.

---
*Pamiętaj: Ty rządzisz architekturą. Jeśli ktoś potrzebuje nowej ikony lub koloru, musi przejść przez Twój Design System.*
