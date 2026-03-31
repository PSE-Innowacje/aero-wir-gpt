# AERO — System ewidencji operacji lotniczych

---

## 1. Opis ogolny

Aplikacja webowa do **ewidencji planowanych operacji lotniczych** oraz **przygotowania zlecenia na lot helikopterem**.

System wspiera pelny cykl zycia operacji lotniczej — od zgłoszenia przez osobę planująca, przez zatwierdzenie przez osobę nadzorujaca, az po realizację i raportowanie przez pilota.

---

## 2. Problem

- Potrzeba aplikacji www do ewidencji i planowania operacji lotniczych.
- Potrzeba logiki pokazujacej na mapie miejsce wykonania lotu.
- Potrzeba logiki sprawdzajacej procedury podczas tworzenia / potwierdzenia zlecenia na lot.

---

## 3. Cel

Wsparcie procesu zbierania planowanych operacji oraz bezpośredniego przygotowania zlecenia na lot.

---

## 4. Uzytkownicy docelowi

| Rola | Opis |
|------|------|
| **Osoba planujaca** (DE / CJI) | Wprowadza i monitoruje status planowanych operacji lotniczych |
| **Osoba nadzorujaca** (DB) | Nadzoruje i zmienia status planowanych operacji lotniczych oraz akceptuje / odrzuca zlecenie na lot |
| **Pilot** | Planuje zlecenie na lot i raportuje stopien realizacji operacji |
| **Administrator systemu** | Wprowadza konfiguracje (helikoptery, załoga, ladowiska, uzytkownicy) |

---

## 5. User Stories

- **a)** Jako **osoba planujaca**, chce wprowadzic planowana operacje lotnicza, aby lot wskazanego odcinka linii zostal zaplanowany.
- **b)** Jako **osoba planujaca**, chce odczytywac aktualny stan planowanych operacji lotniczych, ktore wprowadziłem, aby sledzic kiedy jest planowana operacja lotnicza i jakie sa szanse na ten lot.
- **c)** Jako **osoba planujaca**, chce zrezygnowac z planowanej operacji lotniczej, ktore wprowadziłem, aby nie wykonywac lotu jesli jest juz zbedny.
- **d)** Jako **osoba nadzorujaca**, chce ustawiac status i daty planowanych operacji lotniczych, aby potwierdzac / odrzucac planowane operacje i wstepne planowac loty w kontekscie posiadanych srodkow.
- **e)** Jako **pilot**, chce wprowadzic zlecenie na lot do realizacji jednego lub wiecej planowanych operacji lotniczych z wybranym lotniskiem startu i ladowania z wyliczeniem dlugosci planowanego lotu i uproszczonym pokazaniem na mapie trasy przelotu, aby dobrac odpowiednie operacje lotnicze do zlecenia.
- **f)** Jako **pilot**, chce uzupelnic zlecenie na lot o wybor helikoptera i czlonkow załogi ze sprawdzeniem niezbednych warunkow, aby zlecenie na lot spelniało procedury.
- **g)** Jako **osoba nadzorujaca**, chce ustawiac status zlecenia na lot, aby potwierdzac / odrzucac zlecenie na lot.
- **h)** Jako **pilot**, chce wprowadzic co z planowanej operacji lotniczej zostalo zrealizowane, ile czasu i km trwał lot, aby zaraportowac stan wykonania zadania.
- **i)** Jako **administrator systemu**, chce edytowac aktualne informacje dotyczace floty helikopterow, czlonkow załogi oraz lotnisk, aby system działal w sposob planowany i aktualny.

---

## 6. Stos technologiczny

### 6.1. Architektura

```
Przegladarka (SPA)             Spring Boot              Couchbase
React + TypeScript + MUI  <--HTTPS-->  REST API :8080  <--SDK-->  :8091-8096
```

Aplikacja to **samodzielny system** — brak integracji z zewnetrznymi API, kolejkami komunikatow ani usługami trzecich stron. Jeden backend Spring Boot serwuje REST API, a frontend to SPA (Single Page Application) serwowana z osobnego serwera deweloperskiego (Vite).

### 6.2. Warstwa backendowa

| Technologia | Wersja | Uzasadnienie |
|-------------|--------|--------------|
| **Java** | 21 (LTS) | Najnowsza wersja LTS z virtual threads i pattern matching; wymagana przez Spring Boot 3.x |
| **Spring Boot** | 3.x | Standard przemysłowy dla aplikacji Java — automatyczna konfiguracja, wbudowany serwer, bogaty ekosystem |
| **Spring Security** | (w Spring Boot) | Uwierzytelnianie sesyjne (JSESSIONID cookie), kontrola dostepu na poziomie URL i pol |
| **Spring Data Couchbase** | (w Spring Boot) | Mapowanie dokumentow Couchbase na obiekty Java, repozytoria z automatycznymi zapytaniami |
| **Couchbase Server** | 7.6 | Dokumentowa baza NoSQL — elastyczny schemat pozwala na osadzanie komentarzy, historii zmian i punktow KML bezposrednio w dokumencie operacji. Brak potrzeby migracji schematu |
| **Testcontainers** | (via Gradle) | Automatyczne uruchamianie kontenera Couchbase na potrzeby testow integracyjnych — zero konfiguracji recznej |
| **Spock Framework** | (via Gradle) | Framework testowy (Groovy) — czytelna składnia BDD (`given`/`when`/`then`), wbudowane mockowanie |
| **SpringDoc OpenAPI** | (via Gradle) | Automatyczna generacja dokumentacji API (Swagger UI) na podstawie adnotacji kontrolerow |
| **Gradle** | Kotlin DSL | System budowania — szybszy niz Maven, deklaratywna konfiguracja w Kotlin |

### 6.3. Warstwa frontendowa

| Technologia | Wersja | Uzasadnienie |
|-------------|--------|--------------|
| **React** | 18 | Biblioteka UI — komponentowy model, wirtualny DOM, ogromny ekosystem |
| **TypeScript** | 5.6 | Typowanie statyczne — eliminuje cala klase bledow w czasie kompilacji, lepsza nawigacja po kodzie |
| **Vite** | 5.x | Serwer deweloperski z HMR (Hot Module Replacement) — natychmiastowe przeładowanie po zmianie kodu. Proxy `/api/**` do backendu |
| **MUI (Material UI)** | 7.x | Biblioteka komponentow — gotowe DataGrid, Dialog, TextField, Select z dostepnoscia i ciemnym motywem |
| **react-router-dom** | 7.x | Routing SPA — deklaratywne trasy, chronione sciezki, przekierowania |
| **Axios** | 1.x | Klient HTTP — interceptory, automatyczne `withCredentials` dla ciasteczek sesji |
| **react-leaflet** + **Leaflet** | 4.x / 1.9 | Mapa interaktywna — wyswietlanie tras (polylines) z plikow KML i markerow ladowisk. Kafelki OpenStreetMap |
| **Zod** | 4.x | Walidacja schematow danych — bezpieczne parsowanie odpowiedzi API |

### 6.4. Warstwa testow E2E

| Technologia | Wersja | Uzasadnienie |
|-------------|--------|--------------|
| **Playwright** | 1.x | Framework E2E — szybki, niezawodny, wbudowane API do testowania zarowno UI jak i endpointow REST |

### 6.5. Struktura repozytorium (monorepo)

```
aero-wir-gpt/
├── backend/                          # Spring Boot (Java 21)
│   ├── build.gradle.kts
│   └── src/main/java/pl/pse/aero/
│       ├── AeroApplication.java
│       ├── config/                   # SecurityConfig, CORS, DataInitializer
│       ├── controller/               # Kontrolery REST (cienkie)
│       ├── dto/                      # Obiekty Request / Response
│       ├── domain/                   # Dokumenty Couchbase (@Document) + enumy
│       ├── repository/               # Interfejsy Spring Data Couchbase
│       └── service/                  # Logika biznesowa, maszyny stanow, parsowanie KML
├── frontend/                         # Vite + React 18 + TypeScript
│   ├── package.json
│   └── src/
│       ├── api/                      # Instancja Axios + typowane funkcje API
│       ├── components/               # DataTable, MapView, StatusBadge, Layout
│       ├── contexts/                 # AuthContext
│       ├── pages/                    # Strony (lista + formularz na encje)
│       ├── types/                    # Interfejsy TypeScript (lustro DTO)
│       └── App.tsx                   # Router + sidebar + chronione trasy
├── e2e/                              # Testy E2E (Playwright)
│   ├── playwright.config.ts
│   ├── helpers/                      # Helpery (auth, API, stale)
│   └── tests/                        # Pliki testowe (*.spec.ts)
├── sc-docs/                          # Architektura, PRD, plan, zadania
├── build.gradle.kts                  # Glowny Gradle (allprojects)
├── settings.gradle.kts
├── CLAUDE.md                         # Kontekst dla agentow AI
└── README.md                         # <-- jestes tutaj
```

> **Decyzja projektowa**: Frontend **nie jest** zarzadzany przez Gradle. Działa niezaleznie przez `npm run dev` z proxy Vite: `/api/**` → `http://localhost:8080`. Upraszcza to pipeline budowania.

---

## 7. Funkcje obowiazkowe

### 7.1. Helikopter

#### a) Wprowadzanie i edycja danych helikopterow

| Pole | Typ | Wymagalnosc | Ograniczenia |
|------|-----|-------------|--------------|
| Numer rejestracyjny | tekst | obowiazkowe | do 30 znakow |
| Typ helikoptera | tekst | obowiazkowe | do 100 znakow |
| Opis | tekst | opcjonalne | do 100 znakow |
| Maks. liczba czlonkow załogi | liczba calkowita | obowiazkowe | 1–10 |
| Maks. udzwig czlonkow załogi | liczba calkowita | obowiazkowe | 1–1000 kg |
| Status | wybor | obowiazkowe | aktywny / nieaktywny |
| Data waznosci przegladu | data | obowiazkowe dla statusu *aktywny* | — |
| Zasieg bez ladowania | liczba calkowita | obowiazkowe | 1–1000 km |

#### b) Widok listy

> **Menu → Helikoptery**
> Lista rekordow z numerem rejestracyjnym, typem helikoptera i statusem, sortowanie domyslne po statusie i nr rejestracyjnym.

---

### 7.2. Czlonkowie załogi

#### a) Wprowadzanie i edycja danych czlonkow załogi

| Pole | Typ | Wymagalnosc | Ograniczenia |
|------|-----|-------------|--------------|
| Imie | tekst | obowiazkowe | do 100 znakow |
| Nazwisko | tekst | obowiazkowe | do 100 znakow |
| Email / login | tekst | obowiazkowe | do 100 znakow, walidacja email |
| Waga | liczba calkowita | obowiazkowe | 30–200 kg |
| Rola | wybor jednokrotny | obowiazkowe | ze słownika (*Pilot*, *Obserwator*) |
| Nr licencji pilota | tekst | obowiazkowe dla roli *Pilot* | do 30 znakow |
| Data waznosci licencji | data | obowiazkowe dla roli *Pilot* | — |
| Data waznosci szkolenia | data | obowiazkowe | — |

#### b) Widok listy

> **Menu → Czlonkowie załogi**
> Lista rekordow z Email, rola, data waznosci licencji i data waznosci szkolenia, sortowanie domyslne po email.

---

### 7.3. Ladowiska planowe

#### a) Wprowadzanie i edycja danych ladowiska

| Pole | Typ | Wymagalnosc |
|------|-----|-------------|
| Nazwa | tekst | obowiazkowe |
| Wspolrzedne | wspolrzedne | obowiazkowe |

#### b) Widok listy

> **Menu → Ladowiska planowe**
> Lista rekordow z Nazwa, domyslne sortowanie po Nazwa.

---

### 7.4. Uzytkownicy

#### a) Wprowadzanie i edycja danych uzytkownikow

| Pole | Typ | Wymagalnosc | Ograniczenia |
|------|-----|-------------|--------------|
| Imie | tekst | obowiazkowe | do 100 znakow |
| Nazwisko | tekst | obowiazkowe | do 100 znakow |
| Email / login | tekst | obowiazkowe | do 100 znakow, walidacja email |
| Rola | wybor jednokrotny | obowiazkowe | ze słownika (*Administrator*, *Osoba planujaca*, *Osoba nadzorujaca*, *Pilot*) |

#### b) Widok listy

> **Menu → Uzytkownicy**
> Lista rekordow z Email, rola, sortowanie domyslne po email.

---

### 7.5. Planowana operacja lotnicza

#### a) Wprowadzanie i edycja danych operacji lotniczej

| Pole | Typ | Wymagalnosc | Ograniczenia / Uwagi |
|------|-----|-------------|----------------------|
| Nr planowanej operacji | autonumer | automatyczne | kolejny numer |
| Nr zlecenia / projektu | tekst | obowiazkowe | do 30 znakow, np. `DE-25-12020`, `CJI-3203` |
| Opis skrocony | tekst | obowiazkowe | do 100 znakow |
| Zbior punktow / slad trasy | plik KML | obowiazkowe | 1 plik, do 5000 punktow, teren Polski |
| Proponowane daty — najwczesniej | data | opcjonalne | np. `01-05-2026` |
| Proponowane daty — najpozniej | data | opcjonalne | np. `30-09-2026` |
| Rodzaj czynnosci | wielokrotny wybor | obowiazkowe | min. 1 wartosc ze słownika (*ogledziny wizualne*, *skan 3D*, *lokalizacja awarii*, *zdjecia*, *patrolowanie*) |
| Dodatkowe informacje (termin/priorytet) | tekst | opcjonalne | do 500 znakow |
| Liczba km trasy | liczba calkowita | obowiazkowe | obliczana — patrz 7.5.b |
| Planowane daty — najwczesniej | data | opcjonalne | — |
| Planowane daty — najpozniej | data | opcjonalne | — |
| Komentarz | tekst | opcjonalne | do 500 znakow, lista kolejnych wpisow |
| Historia zmian | automatyczne | — | stara/nowa wartosc, data zmiany, osoba |
| Status | wybor jednokrotny | obowiazkowe | patrz tabela statusow ponizej |
| Osoba wprowadzajaca | email | automatyczne | biezacy uzytkownik |
| Osoby kontaktowe | zbior email | opcjonalne | — |
| Uwagi po realizacji | tekst | opcjonalne | do 500 znakow |
| Lista powiazanych zlecen | automatyczne | — | przez powiazanie w zleceniu |

**Tabela statusow operacji:**

| Kod | Status |
|-----|--------|
| 1 | Wprowadzone |
| 2 | Odrzucone |
| 3 | Potwierdzone do planu |
| 4 | Zaplanowane do zlecenia |
| 5 | Czesciowo zrealizowane |
| 6 | Zrealizowane |
| 7 | Rezygnacja |

#### b) Obliczanie km trasy

Liczba km jest obliczana w przyblizony sposob na podstawie sumy odcinkow miedzy kolejnymi punktami ze zbioru punktow (wzor Haversine).

#### c) Uprawnienia do edycji

Wprowadzanie i edycja mozliwe przez **osobe planujaca** i **osobe nadzorujaca**.

#### d) Zakresy edycji wg roli

- **Osoba planujaca** — edycja w statusach: `1`, `2`, `3`, `4`, `5`
- **Osoba nadzorujaca** — edycja we wszystkich statusach

#### e) Pola zablokowane dla osoby planujacej

> Osoba planujaca **nie moze edytowac:**
> - pol wyliczanych automatycznie
> - planowanych dat (najwczesniej / najpozniej)
> - statusu (domyslnie `1 — Wprowadzone`)
> - uwag po realizacji

#### f) Przyciski dla osoby nadzorujcej (status = 1)

| Przycisk | Zmiana statusu | Warunek |
|----------|---------------|---------|
| **Odrzuc** | 1 → 2 | — |
| **Potwierdz do planu** | 1 → 3 | wymagane wypelnienie planowanych dat |

#### g) Przyciski dla osoby planujacej (statusy 1, 3, 4)

| Przycisk | Zmiana statusu |
|----------|---------------|
| **Rezygnuj** | 1, 3, 4 → 7 |

#### h) Automatyczne zmiany statusow

| Zmiana | Kiedy? |
|--------|--------|
| 3 → 4 | Po wybraniu rekordu przez pilota do otwartego zlecenia na lot |
| 4 → 5 | Po wybraniu przez pilota *„Zrealizowane w czesci"* |
| 4 → 6 | Po wybraniu przez pilota *„Zrealizowane w calosci"* |
| 4 → 3 | Po wybraniu przez pilota *„Nie zrealizowane"* |

#### i) Mapa

> Wyswietlanie na mapie zalaaczonego zbioru punktow.

#### j) Widok listy

> **Menu → Lista operacji**
> Lista rekordow z Nr planowanej operacji, Nr zlecenia, rodzaj czynnosci, proponowane daty - najwczesniej i najpozniej, planowane daty - najwczesniej i najpozniej, status.
> Mozliwosc własnego filtrowania, domyslne filtrowanie — status 3.
> Sortowanie domyslne po planowane daty - najwczesniej rosnaco.

---

### 7.6. Zlecenia na lot

#### a) Wprowadzanie i edycja danych zlecen na lot

| Pole | Typ | Wymagalnosc | Ograniczenia / Uwagi |
|------|-----|-------------|----------------------|
| Nr zlecenia na lot | autonumer | automatyczne | kolejny numer |
| Data i godzina planowanego startu | data + czas | obowiazkowe | — |
| Data i godzina planowanego ladowania | data + czas | obowiazkowe | — |
| Pilot | wybor jednokrotny | obowiazkowe | ze słownika czlonkow załogi z rola *Pilot* |
| Status | wybor jednokrotny | obowiazkowe | patrz tabela statusow ponizej |
| Helikopter | wybor jednokrotny | obowiazkowe | tylko helikoptery ze statusem *aktywny* |
| Czlonkowie załogi | wielokrotny wybor | opcjonalne | ze słownika czlonkow załogi (dowolna rola) |
| Waga załogi | liczba calkowita (kg) | automatyczne | suma: pilot + wszyscy wybrani czlonkowie |
| Ladowisko startowe | wybor jednokrotny | obowiazkowe | ze słownika ladowisk |
| Ladowisko koncowe | wybor jednokrotny | obowiazkowe | ze słownika ladowisk |
| Wybrane planowane operacje | wielokrotny wybor | obowiazkowe | operacje ze statusem `3`, sort. po najwczesniejszej planowanej dacie |
| Szacowana dlugosc trasy | liczba calkowita | obowiazkowe | — |
| Data i godzina rzeczywistego startu | data + czas | obowiazkowe przed statusem 5 / 6 | — |
| Data i godzina rzeczywistego ladowania | data + czas | obowiazkowe przed statusem 5 / 6 | — |

**Tabela statusow zlecenia:**

| Kod | Status |
|-----|--------|
| 1 | Wprowadzone |
| 2 | Przekazane do akceptacji |
| 3 | Odrzucone |
| 4 | Zaakceptowane |
| 5 | Zrealizowane w czesci |
| 6 | Zrealizowane w calosci |
| 7 | Nie zrealizowane |

#### b) Autouzupelnianie pilota

> Pole **pilot** jest wypelniane automatycznie danymi aktualnie zalogowanej osoby.

#### c) Walidacje przy zapisie

> **Blokada zapisu** nastepuje w przypadku:
>
> - Helikopter bez waznego przegladu na dzien lotu
> - Pilot bez waznej licencji na dzien lotu
> - Czlonek załogi bez waznego szkolenia na dzien lotu
> - Waga załogi przekraczajaca maksymalny udzwig helikoptera
> - Szacowana dlugosc trasy wieksza niz zasieg helikoptera
>
> W kazdym przypadku wyswietlane jest stosowne **ostrzezenie**.

#### d) Mapa

> Wyswietlane na mapie:
> - Ladowisko startowe
> - Zbior punktow ze wszystkich wybranych operacji
> - Ladowisko koncowe

#### e) Przyciski dla osoby nadzorujacej (status = 2)

| Przycisk | Zmiana statusu | Warunek |
|----------|---------------|---------|
| **Odrzuc** | 2 → 3 | — |
| **Zaakceptuj** | 2 → 4 | wymagane wypelnienie planowanych dat |

#### f) Przyciski dla pilota — rozliczanie (status = 4)

| Przycisk | Zmiana statusu zlecenia | Zmiana statusu powiazanych operacji |
|----------|------------------------|-------------------------------------|
| **Zrealizowane w czesci** | 4 → 5 | wszystkie → 5 |
| **Zrealizowane w calosci** | 4 → 6 | wszystkie → 6 |
| **Nie zrealizowane** | 4 → 7 | wszystkie → 3 |

#### g) Widok listy

> **Menu → Lista zlecen**
> Lista rekordow z Nr zlecenia na lot, data i godzina planowanego startu, helikopter, pilot, status.
> Mozliwosc własnego filtrowania, domyslne filtrowanie — status 2.
> Sortowanie domyslne po dacie i godzinie — rosnaco.

---

## 8. Wymagania niefunkcjonalne

### 8.1. Menu aplikacji

```
Administracja
├── Helikoptery
├── Czlonkowie załogi
├── Ladowiska planowe
└── Uzytkownicy

Planowanie operacji
└── Lista operacji

Zlecenia na lot
└── Lista zlecen
```

### 8.2. Uprawnienia do menu

| Rola | Administracja | Planowanie operacji | Zlecenia na lot |
|------|:-------------:|:-------------------:|:---------------:|
| Administrator systemu | tworzenie / edycja / podglad | podglad | podglad |
| Osoba planujaca | brak | tworzenie / edycja / podglad | brak |
| Osoba nadzorujaca | podglad | tworzenie / edycja / podglad | edycja / podglad |
| Pilot | podglad | podglad | tworzenie / edycja / podglad |

### 8.3. Uprawnienia do danych

Jak w uprawnieniach do menu (pkt 8.2).

### 8.4. Bezpieczenstwo

- **Uwierzytelnianie** — login + hasło (sesja JSESSIONID)
- **Kontrola dostepu** — zgodnie z uprawnieniami do menu (pkt 8.2)

### 8.5. Wydajnosc

> Brak formalnych wymagan. Testy wydajnosciowe E2E monitoruja czasy odpowiedzi API i ładowania stron.

---

## 9. Ograniczenia / Zaleznosci

> Brak wymagan dotyczacych czasu, narzedzi, systemow, API ani dostepnosci danych.

---

## 10. Poza zakresem

- Automatyczne wyliczanie szacowanej dlugosci przelotu
- Automatyczne pokazywanie optymalnej trasy
- Inne walidacje

---

## 11. Demo i kryteria sukcesu

### Poziom I — Minimum Viable Demo

Pokazanie działajacej aplikacji www z:

- Co najmniej **2 rodzajami uzytkownikow** — osoba planujaca i nadzorujaca
- Co najmniej **lista zlecen** z mozliwoscia edycji przez osobe planujaca i zmiany statusu przez osobe nadzorujaca

---

## 12. Uruchamianie lokalne (Windows / macOS)

### Wymagania wstepne

- **Java 21** (JDK)
- **Docker Desktop** (uruchomiony)
- **Node.js 18+** (dla frontendu)

### 12.1. Uruchomienie Couchbase (jednorazowo)

Skrypt tworzy skonfigurowany kontener Couchbase:

```bash
bash backend/setup-couchbase.sh
```

Tworzy kontener `aero-couchbase` z:
- **Couchbase Server 7.6.1** na `localhost:8091`
- Administrator klastra: `admin` / `admin1`
- Uzytkownik aplikacji: `aero` / `aeropass`
- Bucket: `aero`

Zarzadzanie kontenerem:

```bash
docker start aero-couchbase   # uruchomienie
docker stop aero-couchbase    # zatrzymanie
docker rm aero-couchbase      # usuniecie (uruchom skrypt ponownie)
```

Konsola webowa Couchbase: http://localhost:8091

### 12.2. Uruchomienie backendu

```bash
./gradlew :backend:bootRun
```

Backend działa na http://localhost:8080. Przy pierwszym uruchomieniu tworzy 4 domyslnych uzytkownikow, 3 helikoptery i 4 czlonkow załogi.

### 12.3. Uruchomienie frontendu

```bash
cd frontend && npm install && npm run dev
```

Frontend działa na http://localhost:5173 i przekierowuje `/api/**` do backendu.

### 12.4. Domyslne konta logowania

| Email | Haslo | Rola |
|-------|-------|------|
| `admin@aero.pl` | `admin` | Administrator |
| `planista@aero.pl` | `planista` | Osoba planujaca |
| `nadzor@aero.pl` | `nadzor` | Osoba nadzorujaca |
| `pilot@aero.pl` | `pilot` | Pilot |

### 12.5. Testy backendowe

Testy integracyjne uzywaja **Testcontainers** (automatycznie uruchamiaja tymczasowy kontener Couchbase):

```bash
./gradlew :backend:test
```

> **Uwaga dla uzytkownikow Windows**: Jesli Testcontainers zgłasza "Could not find a valid Docker environment", jest to znana niekompatybilnosc miedzy `docker-java` a Docker Desktop 4.67+. Testy jednostkowe (Spock z mockami) nadal beda działac.

---

## 13. Testy E2E (Playwright)

Testy end-to-end znajduja sie w katalogu `e2e/` i wykorzystuja [Playwright](https://playwright.dev/).

### 13.1. Wymagania wstepne

1. **Backend uruchomiony** na `http://localhost:8080` (z Couchbase)
2. **Frontend uruchomiony** na `http://localhost:5173`

```bash
# Terminal 1 — Backend
./gradlew :backend:bootRun

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### 13.2. Instalacja (jednorazowo)

```bash
cd e2e
npm install
npx playwright install chromium
```

### 13.3. Uruchamianie testow

```bashCan y
cd e2e
npm test                     # wszystkie testy
npm run test:headed          # z widoczna przegladarka
npm run test:ui              # Playwright UI
```

### 13.4. Poszczegolne zestawy testow

```bash
npm run test:auth            # Uwierzytelnianie
npm run test:nav             # Nawigacja i layout
npm run test:helicopters     # CRUD helikopterow
npm run test:operations      # Workflow operacji
npm run test:crew            # Czlonkowie załogi
npm run test:landing-sites   # Ladowiska
npm run test:users           # Zarzadzanie uzytkownikami
npm run test:dictionaries    # Endpointy słownikowe
npm run test:performance     # Testy wydajnosciowe
npm run test:api             # Wszystkie testy API
```

### 13.5. Raport z testow

```bash
npm run report
```

### 13.6. Struktura testow

```
e2e/
├── playwright.config.ts      # Konfiguracja Playwright
├── helpers/
│   ├── constants.ts          # Uzytkownicy seed, trasy, URL API
│   ├── auth.ts               # Helpery logowania (UI i API)
│   └── api.ts                # Klasa ApiHelper, narzedzia tworzenia encji
├── tests/
│   ├── auth.spec.ts          # Login/logout, sesja, wszystkie 4 role
│   ├── navigation.spec.ts    # Nawigacja sidebar, routing stron, layout
│   ├── helicopters.spec.ts   # CRUD helikopterow (UI + API), wyszukiwanie, modal
│   ├── operations.spec.ts    # Cykl zycia operacji, przejscia statusow, komentarze
│   ├── crew-members.spec.ts  # CRUD załogi, walidacja licencji pilota
│   ├── landing-sites.spec.ts # CRUD ladowisk
│   ├── users.spec.ts         # Zarzadzanie uzytkownikami, dostep wg rol
│   ├── dictionaries.spec.ts  # Publiczne endpointy słownikowe
│   └── performance.spec.ts   # Czasy ładowania stron, odpowiedzi API, wspolbieznosc
└── package.json
```
