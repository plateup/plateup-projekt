# 🏋️ PlateUp - Project Workflow

Witamy w projekcie! Aby wszystko działało sprawnie i bez konfliktów, trzymajcie się poniższych zasad.

## 🚀 Pierwsze kroki (Po Git Pull)

1. **Zainstaluj zależności:**
   ```bash
   npm install
   ```
2. **Uruchom projekt lokalnie:**
   ```bash
   npm run dev
   ```

## 🛠 Workflow "No-Conflict"

Pracujemy w architekturze **Feature-Based**. Każdy z Was ma przypisany swój folder.

### Gdzie pisać kod?
- **Wojtow:** `src/features/workout/`
- **Jadwisczok:** `src/features/exercises/` oraz `src/features/stats/`
- **Olgierd:** `src/features/profile/` oraz `src/features/social/`
- **Landzi (Lider):** `src/features/feed/` oraz `src/components/ui/` (wspólne komponenty)

### Zasady GITA:
1. **Zawsze robisz pull przed pracą:** `git pull origin main`.
2. **Nowa funkcja = nowa gałąź (branch):** `git checkout -b feature/twoja-nazwa`.
3. **Commituj często:** Małe zmiany są łatwiejsze do naprawienia.
4. **Push:** `git push origin feature/twoja-nazwa`, a potem robimy Pull Request do `main`.

## 🎨 Stylistyka (Tailwind)
Używamy wyłącznie Tailwind CSS. Nie twórzcie nowych plików `.css`.
- Korzystajcie z kolorów semantycznych (Dark/Light mode wspierany przez `dark:` prefix w Tailwind).
- Marginesy i paddingi: starajcie się używać wielokrotności 4 (np. `p-4`, `m-2`, `gap-8`).

## 🤖 Korzystanie z AI
W plikach dokumentacji (które dostaliście wcześniej) macie gotowe prompty. Pamiętajcie, żeby po wygenerowaniu kodu przez AI:
1. Sprawdzić czy typy TypeScript się zgadzają.
2. Dostosować importy do naszej struktury folderów.

## 🤖 Współpraca z AI
W projekcie znajduje się plik `AI_CONTEXT.md`. Jeśli używasz ChatGPT, Claude lub innego modelu AI do pisania kodu, **zawsze wklejaj mu zawartość tego pliku**. Dzięki temu AI będzie wiedziało, na jakim etapie jest projekt i jakich standardów wizualnych (styl Apple/Lift) musi przestrzegać.

---
*W razie problemów uderzajcie do Landziego (Main Dev).*
