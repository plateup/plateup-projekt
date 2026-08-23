<div align="center">
  <h1>🏋️‍♂️ PlateUp</h1>
  <p><strong>Minimalistyczny asystent treningowy z wbudowanym systemem społecznościowym.</strong></p>
</div>

---

## O projekcie

PlateUp to nowoczesna aplikacja internetowa stworzona dla osób trenujących siłowo. Naszym celem było zaprojektowanie czegoś, co po prostu działa na siłowni – bez zbędnego szumu i skomplikowanych wykresów, z naciskiem na szybkość, wygodę i elegancki interfejs inspirowany estetyką Apple.

Od zapisywania ciężarów w ułamku sekundy, przez inteligentne timery przerw, aż po dzielenie się wynikami ze znajomymi. Wszystko zsynchronizowane w czasie rzeczywistym, dostępne na każdym urządzeniu.

## Najważniejsze funkcje

- ⚡️ **Live Workout:** Śledzenie serii i powtórzeń na żywo bez lagów.
- 💬 **Społeczność & Live DM:** Wbudowany czat na żywo z powiadomieniami oraz tablica (Feed) z osiągnięciami znajomych.
- 🏆 **Globalny Ranking:** Za każdy udany trening otrzymujesz EXP. Zdobywaj kolejne levele i rywalizuj o czołówkę na Leaderboardzie.
- 🌓 **Design System:** Płynne animacje i wysoki kontrast idealnie sprawdzające się na hali treningowej.

## Stack Technologiczny

Projekt został zbudowany z myślą o maksymalnej wydajności w przeglądarce:
- **Frontend:** React + Vite + Tailwind CSS
- **Backend & Auth:** Supabase (PostgreSQL)
- **Komunikacja Live:** Supabase WebSockets (Realtime)

## Jak uruchomić?

Aplikacja jest bardzo prosta w konfiguracji lokalnej:

```bash
# 1. Zainstaluj zależności
npm install

# 2. Uruchom serwer deweloperski
npm run dev
```

> **Ważne:** Pełne działanie funkcji społecznościowych, autentykacji i bazy danych wymaga podpięcia własnego projektu Supabase. Zmienne `VITE_SUPABASE_URL` oraz `VITE_SUPABASE_ANON_KEY` należy umieścić w pliku `.env.local`.

---

<div align="center">
  <p><i>Budowane z pasją do czystego kodu i ciężarów.</i></p>
</div>