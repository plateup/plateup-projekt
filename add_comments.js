import fs from 'fs';
import path from 'path';

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else {
      if (filepath.endsWith('.js') || filepath.endsWith('.jsx')) {
        filelist.push(filepath);
      }
    }
  }
  return filelist;
};

const files = walkSync('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Jeśli plik już ma taki komentarz, pomijamy
  if (content.startsWith('/**\n * Plik:')) return;

  const fileName = path.basename(file);
  const dirName = path.dirname(file).split('/').pop();
  
  let description = `Moduł odpowiedzialny za logikę powiązaną z ${dirName}/${fileName}.`;
  
  if (fileName.includes('Auth')) description = 'Odpowiada za logowanie, autoryzację i zarządzanie sesją użytkownika.';
  if (fileName.includes('SocialFeed')) description = 'Główny komponent społecznościowy. Odpowiada za tablicę postów, system znajomych, rankingi (leaderboard) oraz czat na żywo (WebSockets).';
  if (fileName.includes('LiveWorkout')) description = 'Silnik treningowy. Rejestruje wykonywane ćwiczenia, serie, powtórzenia, czas przerw oraz przydziela EXP po zakończeniu.';
  if (fileName.includes('Dashboard')) description = 'Panel główny użytkownika. Wyświetla historię treningów pobraną z bazy Supabase oraz kalendarz aktywności.';
  if (fileName.includes('Profile')) description = 'Zarządzanie profilem użytkownika. Oblicza poziom (Level) na podstawie EXP, pozwala na zmianę avatara i nazwy.';
  if (fileName.includes('App.jsx')) description = 'Główny plik wejściowy (Router). Definiuje ścieżki i renderuje odpowiednie widoki na podstawie stanu autoryzacji.';
  if (fileName.includes('supabaseClient')) description = 'Konfiguracja i inicjalizacja połączenia z bazą danych Supabase. Exportuje instancję klienta używaną w całej aplikacji.';

  const comment = `/**
 * Plik: ${fileName}
 * Autorzy: Langier, Mietła, Jadwiszczok, Bogdański
 * Opis: ${description}
 * Technologia: React / JSX / Tailwind CSS
 */\n\n`;

  fs.writeFileSync(file, comment + content);
});

console.log('Zakończono dodawanie komentarzy nagłówkowych do ' + files.length + ' plików.');
