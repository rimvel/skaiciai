# Skaičiukų sodas

Lietuviškas mokomasis žaidimas vaikams, skirtas lavinti sudėtį ir atimtį žaismingoje aplinkoje.

Gyvas puslapis: `https://skaiciai.fvcloud.eu`

## Kas tai

`Skaičiukų sodas` yra React + Vite projektas, sukurtas 7 metų vaikams mokytis ir treniruoti:

- sudėtį
- atimtį
- skaičiavimą stulpeliu
- trūkstamo skaičiaus radimą
- veiksmų ir ženklų atpažinimą

Žaidime yra užuominos, žingsniai, apdovanojimai, skirtingi režimai ir mokantis grįžtamasis ryšys po klaidų.

## Pagrindinės funkcijos

- keli žaidimo režimai: `Klasika`, `Pasakojimų kelias`, `Skaičių detektyvas`, `Žaibo raundas`, `Stulpeliu`
- keli sunkumo lygiai: `Lengvas`, `Vidutinis`, `Iššūkis`
- įvairūs užduočių tipai:
  - pasirink atsakymą
  - rask trūkstamą skaičių
  - pasakyk, ar tiesa
  - parink ženklą
  - rask tinkamą veiksmą
  - užduotys iš pasakojimų
  - sudėtis ir atimtis stulpeliu
- aiškios užuominos ir žingsniai stulpelio užduotims
- mokantis klaidų paaiškinimas: rodomas neteisingas atsakymas, teisingas atsakymas ir paaiškinimas
- sesijos pabaigos suvestinė su tikslumu ir pagrindinėmis klaidomis
- vietinis progreso saugojimas naršyklėje (`localStorage`)
- mobiliai pritaikytas sprendimo ekranas

## Technologijos

- `React`
- `TypeScript`
- `Vite`
- `Vitest`
- `Azure Static Web Apps`

## Paleidimas lokaliai

Reikalavimai:

- `Node.js`
- `npm`

Įdiegti priklausomybes:

```bash
npm install
```

Paleisti vystymo režimu:

```bash
npm run dev
```

Sukurti produkcinį buildą:

```bash
npm run build
```

Paleisti testus:

```bash
npm test
```

## Projekto struktūra

Svarbiausi failai:

- `src/App.tsx` - pagrindinis žaidimo ekranas ir sąsaja
- `src/game.ts` - užduočių generavimas, progreso logika, sesijos analizė
- `src/styles.css` - visas žaidimo dizainas ir responsive išdėstymas
- `src/game.test.ts` - logikos testai
- `index.html` - SEO, pavadinimas, social metadata
- `staticwebapp.config.json` - Azure Static Web Apps konfigūracija

## Diegimas

Projektas diegiamas automatiškai per GitHub Actions į Azure Static Web Apps.

Diegimo schema:

- šaltinio repozitorija: `https://github.com/rimvel/skaiciai`
- pagrindinė šaka: `main`
- hostinimas: `Azure Static Web Apps`
- viešas adresas: `https://skaiciai.fvcloud.eu`

Kiekvienas `push` į `main` automatiškai paleidžia diegimą.

## Tikslas

Pagrindinis šio projekto tikslas - sukurti vaikui draugišką, aiškią ir motyvuojančią aplinką, kurioje matematika būtų ne tik pratimas, bet ir žaidimas.
