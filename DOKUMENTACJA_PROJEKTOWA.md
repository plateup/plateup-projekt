# Dokumentacja Projektowa - PlateUp 🏋️‍♂️

## 1. Metryka Projektu
- **Nazwa aplikacji:** PlateUp
- **Rodzaj projektu:** Aplikacja webowa typu SPA (Single Page Application)
- **Zespół projektowy:** Langier, Mietła, Jadwiszczok, Bogdański
- **Cel projektu:** Stworzenie minimalistycznego, wydajnego i społecznościowego asystenta treningowego, który pozwala na śledzenie postępów na siłowni, rywalizację ze znajomymi oraz komunikację w czasie rzeczywistym.

---

## 2. Architektura i Wykorzystane Technologie

Aby zapewnić najwyższą wydajność, nowoczesny wygląd i łatwość utrzymania kodu, projekt został zbudowany w oparciu o następujący stos technologiczny:

### Frontend (Warstwa Wizualna i Logika Klienta)
*   **React.js (v18):** Główna biblioteka do budowania interfejsu użytkownika w oparciu o komponenty. Wykorzystaliśmy nowoczesne hooki (`useState`, `useEffect`, `useRef`) do zarządzania stanem.
*   **Vite:** Ultraszybkie narzędzie budujące (bundler), które zastąpiło wysłużonego Create React App, znacząco przyspieszając proces developmentu.
*   **Tailwind CSS:** Biblioteka do stylowania aplikacji z wykorzystaniem klas narzędziowych (utility-first). Pozwoliła nam na stworzenie spójnego, ciemnego motywu inspirowanego designem Apple (duże zaokrąglenia, głębokie kontrasty, responsywność).
*   **Lucide React:** Zestaw nowoczesnych, minimalistycznych ikon wektorowych.
*   **Date-fns:** Lekka biblioteka do formatowania i manipulacji datami (wykorzystana m.in. w kalendarzu na głównym panelu oraz przy formatowaniu czasu wiadomości).
*   **Framer Motion:** Biblioteka do płynnych i naturalnych animacji interfejsu (przejścia ekranów, modale).

### Backend (Baza Danych i Autoryzacja)
*   **Supabase:** Nowoczesna alternatywa dla Firebase, oparta na otwartoźródłowej relacyjnej bazie danych PostgreSQL.
*   **Supabase Auth:** Zintegrowany moduł do zarządzania rejestracją, logowaniem i bezpiecznymi sesjami użytkowników.
*   **PostgreSQL (RLS):** Główna baza danych. Wykorzystaliśmy Row Level Security (RLS) do zabezpieczenia danych – dzięki temu użytkownik ma dostęp tylko do swoich własnych treningów i wiadomości.
*   **Supabase Realtime (WebSockets):** Mechanizm nasłuchiwania na zmiany w bazie danych w czasie rzeczywistym. Wykorzystany do implementacji komunikatora (Live Chat), który odświeża wiadomości bez potrzeby przeładowywania strony.

---

## 3. Struktura Projektu (Feature-Based)

Aplikacja nie używa standardowego podziału na "widoki" i "komponenty". Zastosowaliśmy nowoczesną architekturę **Feature-Based**, co oznacza, że kod podzielony jest ze względu na funkcjonalności. Ułatwia to pracę w zespole i unikanie konfliktów (tzw. merge conflicts) w systemie kontroli wersji Git.

*   `/src/features/auth` - Logowanie, rejestracja, ustawianie nazwy użytkownika.
*   `/src/features/feed` - Główny panel (Dashboard), tablica aktywności (Social Feed), Czat oraz Rankingi.
*   `/src/features/workout` - System dodawania treningów na żywo, podsumowania, kalkulator obciążeń i biblioteka ćwiczeń.
*   `/src/features/profile` - Statystyki użytkownika, poziomy (EXP) i personalizacja.
*   `/src/components/ui` - Współdzielone, uniwersalne komponenty interfejsu (np. Przyciski, Modale).

---

## 4. Opis Działania Głównych Modułów

### A. Autoryzacja i Zarządzanie Użytkownikami
Aplikacja wymaga od użytkownika utworzenia konta (E-mail + Hasło). Po rejestracji użytkownik zmuszony jest do wybrania unikalnej nazwy (`username`), która posłuży do identyfikacji przez innych znajomych. Sesja jest utrzymywana w bezpiecznych ciasteczkach (Local Storage / Supabase Auth).

### B. Live Workout (Trening na żywo)
Moduł ten to serce aplikacji. Użytkownik może dodawać ćwiczenia z wbudowanej biblioteki. Podczas treningu:
*   Aplikacja na bieżąco zlicza podniesiony tonaż (Volume) oraz czas trwania.
*   Zaimplementowano inteligentny `RestTimer` (stoper), który pozwala kontrolować czas odpoczynku między seriami.
*   Po kliknięciu "Finish", aplikacja wylicza zdobyte punkty doświadczenia (EXP) i zapisuje trening do bazy danych.

### C. System Społecznościowy i Rankingi (Social & Leaderboard)
Zbudowaliśmy zaawansowany system znajomych.
*   **Dodawanie znajomych:** Wyszukiwarka wysyła asynchroniczne zapytania do bazy profilów. Użytkownik może wysłać zaproszenie, które druga osoba musi zaakceptować.
*   **Ochrona przed duplikatami:** Jeżeli dwaj użytkownicy wyślą zaproszenie do siebie nawzajem w tym samym czasie, system inteligentnie to wykryje i scali w jedną relację "Friends".
*   **Ranking (EXP):** Za każdy udokumentowany trening gracz otrzymuje punkty doświadczenia. Na ekranie Ranks widnieje posortowana tabela wyników znajomych z przypisanymi miejscami i medalami.

### D. Komunikator (Realtime DMs)
Inspirowany wiadomościami prywatnymi z popularnych sieci społecznościowych.
*   Wykorzystuje kanały WebSockets z bazy Supabase (`postgres_changes`).
*   Wysłanie wiadomości do znajomego następuje natychmiastowo na froncie (tzw. Optimistic UI Update), a w tle weryfikowane jest z bazą danych.
*   Jeśli serwer wykryje, że druga strona wysłała wiadomość, okno czatu natychmiast zjedzie na sam dół (Smooth Auto-Scroll), pokazując nowy dymek z odpowiedzią.
*   W przypadku awarii sieci lub braku połączenia z Supabase, aplikacja posiada wbudowany **Fallback (Plan Awaryjny)** oparty na pamięci lokalnej przeglądarki (`localStorage`), więc historia nie ginie.

---

## 5. Przepływ Danych i Bezpieczeństwo
Aplikacja została zaprojektowana w taki sposób, aby maksymalnie odciążyć serwer:
1. Podczas ładowania głównego widoku pobierana jest jednorazowo historia treningów.
2. Historia czatów i postów jest kasowana w pamięci lokalnej i nadpisywana najświeższą wersją z serwera, co pozwala na bardzo płynne działanie.
3. Bezpieczeństwo zapewnia system RLS w PostgreSQL – każde zapytanie do bazy z automatu dokleja identyfikator użytkownika (`auth.uid()`). Nie ma fizycznej możliwości, aby jakikolwiek skrypt z zewnątrz pobrał wiadomości czatu należące do kogoś innego.

## 6. Podsumowanie
Projekt PlateUp łączy w sobie rygorystyczne podejście do inżynierii oprogramowania ze zrozumieniem potrzeb końcowego użytkownika (UI/UX). Wykorzystanie nowoczesnych technologii (React 18 + Supabase) pozwoliło naszemu zespołowi na dostarczenie produktu przypominającego profesjonalne aplikacje produkcyjne ze sklepów z aplikacjami.