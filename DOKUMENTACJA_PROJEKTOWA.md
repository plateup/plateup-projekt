# Kompleksowa Dokumentacja Projektowa - PlateUp 🏋️‍♂️

## 1. Metryka Projektu
- **Nazwa aplikacji:** PlateUp
- **Rodzaj projektu:** Zaawansowana aplikacja webowa typu SPA (Single Page Application)
- **Zespół projektowy:** Langier, Mietła, Jadwiszczok, Bogdański
- **Cel projektu:** Zaprojektowanie i wdrożenie minimalistycznego, wysoce zoptymalizowanego asystenta treningowego w przeglądarce, łączącego funkcjonalności śledzenia treningów z bogatym systemem społecznościowym (live chat, rankingi, znajomi).

---

## 2. Architektura Systemu i Wykorzystane Technologie

Nasz projekt został stworzony w oparciu o najnowsze standardy branżowe, co zapewnia jego skalowalność, bezpieczeństwo oraz błyskawiczne działanie.

### 2.1. Warstwa Prezentacji (Frontend)
*   **React.js (v18):** Szkielet całej aplikacji. Pozwala na budowanie modularnego interfejsu z wykorzystaniem nowoczesnych hooków (np. `useState`, `useEffect`, `useMemo`, `useRef`).
*   **Vite:** Superszybki bundler, który zapewnia natychmiastowe ładowanie modułów podczas developmentu (HMR) i zoptymalizowany, lekki kod wynikowy na produkcję.
*   **Tailwind CSS:** System stylowania oparty na klasach narzędziowych (utility-first). Został przez nas rygorystycznie wykorzystany do stworzenia spójnego, ciemnego motywu (Dark Mode) inspirowanego estetyką iOS. Zapewnia pełną responsywność (Mobile-First).
*   **Framer Motion:** Zaawansowana biblioteka animacji w React. Odpowiada za płynne przejścia (`fade-in`, `slide-up`) ekranów oraz modali, dodając aplikacji "poloru" i uczucia płynności (fluidity).
*   **Lucide React:** Zbiór pięknych i skalowalnych ikon wektorowych.
*   **Date-fns:** Niezwykle lekka biblioteka do operacji na datach, krytyczna przy formatowaniu historii treningów i powiadomień w czasie rzeczywistym.
*   **Canvas Confetti:** Biblioteka do efektów wizualnych (konfetti), uaktywniająca się w momencie pomyślnego zakończenia treningu (mechanizm gamifikacji i nagradzania użytkownika).

### 2.2. Warstwa Logiki i Danych (Backend & Database)
Zdecydowaliśmy się na rozwiązanie typu BaaS (Backend-as-a-Service), aby skupić się na logice i szybkości dostarczenia aplikacji.
*   **Supabase:** Nasz główny silnik backendowy działający na zaawansowanej relacyjnej bazie PostgreSQL.
*   **Supabase Auth:** Zabezpieczony moduł do rejestracji i logowania (JWT Tokens, Session Management).
*   **PostgreSQL RLS (Row Level Security):** Zaawansowany mechanizm bezpieczeństwa bezpośrednio na poziomie tabel w bazie danych. Gwarantuje, że zapytanie o wiadomości i treningi filtruje wyniki bezpośrednio po identyfikatorze `auth.uid()`, uniemożliwiając kradzież danych lub dostęp nieautoryzowany.
*   **Supabase Realtime (WebSockets):** Nasłuchiwanie zmian (INSERT, UPDATE) na tabelach w bazie z milisekundowym opóźnieniem. Odpowiada za bezprzeładowaniowy system czatów "jak na Instagramie".

---

## 3. Szczegółowy Opis Modułów i Funkcji Aplikacji

Aplikacja oparta jest na nowoczesnym wzorcu architektury folderów "Feature-Based". Poniżej znajduje się dekonstrukcja każdego z modułów, wraz z opisem logiki pod spodem.

### 3.1 Moduł Wejściowy (App & Auth)
Plik `App.jsx` pełni rolę głównego routera. Posiada mechanizm, który sprawdza stan sesji za pomocą `supabase.auth.getSession()` podczas pierwszego renderowania.
*   **Funkcja `handleSessionData`:** Zarządza sesją i synchronizacją danych między lokalną przeglądarką (`localStorage`) a kontem użytkownika w chmurze. Posiada system archiwizacji lokalnych danych - zapobiega nadpisywaniu treningów, jeśli na jednym urządzeniu zaloguje się inna osoba.
*   **Widoki `Landing.jsx` oraz `Auth.jsx`:** Ekrany powitalne z płynnymi przejściami. Posiadają walidację pól e-mail i hasła oraz automatyczne przechwytywanie błędów po stronie serwera (np. e-mail już zajęty).
*   **Widok `UsernameSetup.jsx`:** Proces Onboardingu - wymusza na nowo zarejestrowanym użytkowniku utworzenie unikalnego identyfikatora (`username`), który jest krytyczny do działania funkcji wyszukiwania znajomych.

### 3.2 Moduł Głównego Panelu (Dashboard - `Dashboard.jsx`)
Miejsce pierwszego kontaktu użytkownika po zalogowaniu.
*   **Logika Pobierania (Data Fetching):** `fetchProfileAndWorkouts` pobiera z Supabase dane personalne i listę postów/treningów (`posts`).
*   **System "Offline-First" (Fallback):** Jeżeli sieć jest niedostępna, system odwołuje się do pamięci `localStorage` (`plateup_posts`), pozwalając użytkownikowi na wgląd w historię treningów nawet bez dostępu do Internetu.
*   **Funkcja `generateDates`:** Tworzy horyzontalny kalendarz pokazujący 14 dni wstecz, służący jako nawigacja i wskaźnik regularności.
*   **Funkcja `executeDeleteWorkout`:** Wyposażona w mechanizm Optimistic UI. Po kliknięciu "Usuń", trening znika natychmiast z interfejsu (szybka reakcja), a w tle asynchronicznie uruchamiane jest polecenie `delete().eq('id', ...)` na bazie PostgreSQL.

### 3.3 Moduł Społecznościowy (SocialFeed - `SocialFeed.jsx`)
Najbardziej zaawansowany technicznie plik w całej aplikacji. Obsługuje logikę relacji i komunikacji na żywo. Zawiera 4 sub-karty nawigacyjne.

#### A. Wyszukiwanie i Zaproszenia do Znajomych
*   **Funkcja `handleSearch`:** Odpytuje bazę danych o nazwy użytkowników dopasowując ciąg znaków (klauzula `ilike`).
*   **Funkcja `fetchUserAndPosts`:** Pobiera zaproszenia wysłane (`sentData`) i otrzymane (`incData`). Zawiera niezwykle istotny mechanizm "Fallback" - jeśli brakuje tabel relacyjnych, aplikacja wchodzi w tryb ratunkowy i pobiera profile ręcznie na podstawie IDs (gwarantując stabilność).
*   **Funkcja `handleAddFriend`:** Przyciski wysyłają do Supabase obiekt `friend_requests`. Użytkownik celowy otrzymuje to natychmiast. Jeżeli obaj wyślą sobie zaproszenie (skrzyżowanie zapytań), funkcja uodparnia bazę, automatycznie "akceptując" zapytanie zamiast je dublować.

#### B. Globalny Ranking (Leaderboard)
*   Budowany dynamicznie na podstawie punktów doświadczenia (EXP) pobranych z tabeli `profiles`. Użytkownicy są sortowani (`lb.sort`), a 3 najlepszym przypisywane są specjalne kolory medali i poświaty CSS dla wzmocnienia elementu rywalizacji.

#### C. System Komunikacji (Realtime Chats)
*   **Realtime Subscription:** W bloku `useEffect` używamy `supabase.channel('global_chat_messages')`. Metoda `.on('postgres_changes')` nasłuchuje każdego nowego rekordu.
*   **Deduplikacja:** Aplikacja eliminuje zjawisko "migotania" wiadomości (double-render). Wysyłając wiadomość funkcja `handleSendMessage` wstrzykuje na ekranie fałszywe ID (`tempId`), a po pomyślnym odebraniu potwierdzenia z serwera, podmienia to ID na stałe (UUID). Mechanizm uodporniony jest na opóźnienia sieci rzędu do 5 sekund.
*   **Funkcja `scrollToBottom`:** Wykorzystująca referencję `useRef` na tagu elementu pustego na samym dole ekranu. Wymusza przewinięcie (`scrollIntoView`) w momencie nadejścia nowej wiadomości.
*   **Inteligentne znaczniki "Reply":** Interfejs rozróżnia ostatniego nadawcę z pomocą zmiennych. Jeśli wiadomość nie jest naszego autorstwa, obok daty doczepiany jest znacznik "Reply".

### 3.4 Moduł Modułu Treningowego (Live Workout - `LiveWorkout.jsx`)
Rdzeń aplikacji. Umożliwia rejestrowanie postępów.
*   **Stan (State Management):** Wykorzystuje złożone obiekty stanowe do przetrzymywania zestawów (`sets`), powtórzeń (`reps`) i kilogramów (`kg`).
*   **Funkcje `handleUpdateSet` / `handleAddSet` / `handleRemoveSet`:** Zapewniają wysoką interaktywność i dynamikę formularzy.
*   **Funkcja `handleFinish`:** Agreguje wszystkie dane wejściowe. Wylicza łączny tonaż (Volume), przypisuje tagi, zlicza czas z milisekund. Dodatkowo działa tu skrypt obliczający ilość punktów EXP przyznanych za sesję (dodatkowy mnożnik za np. trening nóg - element nagrody).
*   Zapis danych działa w dwóch wektorach - modyfikuje `localStorage` oraz wywołuje `supabase.from('profiles').update({ exp: newExp })` w celu synchronizacji bazy profilowej, dzięki czemu ranking (leaderboard) w module `SocialFeed` jest na bieżąco odświeżany.

### 3.5 Moduł Profilu Użytkownika (`Profile.jsx`)
Służy do personalizacji. Obrazuje osiągnięcia.
*   **Funkcja `fetchProfile`:** Pobiera dane upewniając się, że poziom punktowy (`exp`) pokrywa się z najwyższą dotychczasową wartością zapisaną na dowolnym z urządzeń użytkownika. 
*   **Logika Poziomów (`getLevelInfo`):** Przypisuje rangi, tj. "Beginner", "Iron Lifter", "Titan" w oparciu o sztywne przedziały matematyczne doświadczenia. Dynamicznie kalkuluje procentowy przyrost paska postępu.
*   Przechwytuje akcje `signOut`, niszcząc sesję z Supabase i przywracając użytkownika do ekranu logowania, w pełni czyszcząc dostęp z widoków.

---

## 4. Wyzwania Napotkane podczas Implementacji i Rozwiązania

1.  **Synchronizacja Stanu Offline i Online:** 
    Użytkownicy na siłowni nie zawsze mają dostęp do stabilnej sieci.
    **Rozwiązanie:** Zbudowaliśmy aplikację "Offline-First". Wszelkie rekordy (treningi, czaty) zapisują się jako pierwsza warstwa do `localStorage` z tymczasowym identyfikatorem. Dopiero w drugiej fazie (w asynchronicznym promise) synchronizują się z PostgreSQL. Gdy baza zawodzi, użyty zostaje wbudowany mechanizm "Fallback", zapewniając bezprzerwowe działanie aplikacji.
2.  **Optymalizacja odpytywania bazy (N+1 queries problem):** 
    Wyszukiwanie kilkudziesięciu znajomych z bazy byłoby nieefektywne.
    **Rozwiązanie:** Skonstruowaliśmy zapytania oparte o łączenie tabel klauzulami `.in('id', array)`. Załadowanie wszystkich znajomych sprowadza się do 1 ustrukturyzowanego zapytania, skracając czas ładowania z paru sekund do zaledwie ms.
3.  **Animacje a zwalnianie pamięci:** 
    Szybkie przeklikiwanie ekranów generowało błędy odmontowania (unmounted component update).
    **Rozwiązanie:** Wdrożenie biblioteki Framer Motion z otoczką `AnimatePresence (mode="wait")` – rozwiązanie uniemożliwiające narysowanie komponentu, zanim poprzedni całkowicie zniknie. Gwarantuje to absolutną spójność drzewa DOM i brak wycieków pamięci.

## 5. Zakończenie
Aplikacja PlateUp nie ustępuje na polu technicznym współczesnym nowoczesnym platformom społecznościowym. Wykorzystuje potężną moc Reacta do budowy responsywnego, reaktorowego (reaktywnego) frontendu i nowoczesną architekturę backendową bazującą na subskrypcjach WebSocket (Supabase). Projekt w pełni uosabia możliwości, jakie niosą współczesne standardy inżynierii oprogramowania webowego.