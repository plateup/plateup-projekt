# 🧠 AI Context - Project Memory

Ten plik służy jako źródło prawdy dla modeli AI (ChatGPT, Claude, Gemini), które pomagają w tworzeniu projektu PlateUp.

## 📌 Status Projektu
- **Technologia:** React + JavaScript (JSX) + Tailwind CSS + Vite.
- **Backend:** Supabase (Auth + DB).
- **Stylistyka:** Apple Human Interface Guidelines / Lift App style.
- **Architektura:** Feature-Based (każdy moduł w osobnym folderze `src/features/`).

## 🎨 Wytyczne Wizualne (Design System)
- **Kolory:** Czysta czerń (#000000) i czysta biel (#FFFFFF). Akcent: Electric Blue (opcjonalnie) lub Monochrome.
- **Kształty:** Bardzo duże zaokrąglenia (np. `rounded-3xl` w Tailwind), imitujące "Apple Squircle".
- **Typografia:** Inter lub systemowy sans-serif. Duże nagłówki (font-bold).
- **Layout:** Dużo "white space", brak zbędnych linii, separacja za pomocą koloru tła (jasny szary / ciemny szary). System responsywny: max-w-md (Mobile), max-w-2xl (Tablet), max-w-4xl (Desktop).
- **Animacje:** Subtelne przejścia Framer Motion, scale-95 na kliknięciach, fade-in na nowych ekranach.

## 🛠 Wykonane Prace
1. Inicjalizacja projektu React (JS) i Tailwind.
2. Integracja z Supabase (Auth Client).
3. System Autentykacji: Landing Page, Login, Rejestracja.
4. UI: AppShell, Social Feed (Responsive), Design System.

## 🚀 Kolejne Kroki
- [ ] Implementacja Workout Hub (Tab 2).
- [ ] Integracja bazy danych dla treningów.
- [ ] System gamifikacji i profilu.
