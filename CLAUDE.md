# Moje lieky – poznámky pre Clauda

Najprv si prečítaj tento súbor. **Nečítaj celý `index.html`** (má viac než 3 300 riadkov). Hľadaj v ňom cez grep podľa názvov funkcií nižšie.

## Čo to je
- PWA na Android, hostená na GitHub Pages (repo `Rumlik707/moje-lieky`).
- Hlavný účel: odškrtávanie mojich liekov, zásoby a upozornenia.
- Vedľajší účel: nákupný zoznam pre domácnosť.
- Celá appka je v jednom súbore `index.html` (CSS aj JS sú vo vnútri, JS je v jednej IIFE). Ďalej sú tu `sw.js` (service worker) a `manifest.json`.
- Dáta sú v localStorage pod kľúčom `lieky-v1` vo formáte `{meds, months, extra}`. `extra` normalizuje funkcia `normExtra` a obsahuje `prn, fx, visits, sw, shop, shopRecent`.

## Ako pracovať (dodržiavať!)
- **Pri dizajne alebo väčšej zmene najprv ukáž 3 návrhy** (mockup ako obrázok, pozri aj konkurenciu). Nič nerob bez môjho súhlasu. Drobné opravy, o ktoré požiadam, sprav rovno.
- Píš po slovensky, stručne a jasne.
- Jednoduchosť a čo najmenej ťuknutí. Žiadne skryté gestá, akcia musí byť jasná z nápisu (napr. „✓ Uložiť“ namiesto ×).
- Rovnaký štýl všade: všetky bubliny v ponuke Rýchlo vyzerajú aj sa hýbu rovnako (animácia aj strieborný lesk). V tmavom režime nepoužívaj krikľavé farby.
- Pri každom vydaní:
  - zvýš `const VERSION = 'vNN'` v `sw.js`;
  - zvýš text `Verzia appky: vNN` v `index.html`.
- Pred pushom otestuj v Playwright (`file:///…/index.html`, v localStorage nastav `lieky-intro`=`1`), vo svetlom aj tmavom režime, a pošli mi screenshoty.
- Kontrola screenshotov pred vydaním (každý bod, nielen „funguje“):
  - horný a spodný okraj: nič nesmie presvitať ani trčať spoza panelu (stránka pod ním, lišty, tiene);
  - nič nie je orezané (tlačidlo Dnes v lište, texty, okraje polí);
  - okraje a zarovnanie sedia s ostatnými obrazovkami;
  - prejdi celú cestu tam aj späť (otvoriť, prepnúť záložku, systémové Späť, Uložiť) a over, že sa dáta nestratili.
- Keď si nie som istý, čo myslíš, opýtam sa jednou vetou pred robením, nie po vydaní.
- Commit podpisuj `-c user.name="Rumlik707" -c user.email="rumlik@gmail.com"`. Potom spusti `git fetch origin main && git rebase origin/main && git push origin HEAD:main`.
- Pri úpravách cez Python skripty použi zámenu presného reťazca a kontrolu počtu výskytov (assert).

## Rozloženie appky
- Spodná lišta: Kalendár · Zásoby · **Dnes** (v strede, domček) · **Rýchlo ⚡** · Viac.
- Rýchlo otvorí vejár bublín (pole `QG`, funkcia `quickOpen`): Liek, Kvapky, Kozmetika, Výmena, Nákup.
- Skupiny položiek: `med` (Lieky), `care` (Kvapky a ošetrenie), `cosm` (Kozmetika), `swap` (Výmena, napr. hlavice zubnej kefky). Skupinu vracia funkcia `grpOf(m)`.
- Ikonky sú realistické a animované 3D (`pillSvg`, `picM`, `iconState`, `goIcon`). Animácie sa spúšťajú triedou `.go`. Spoločné gradienty sú v globálnom svg H3D.
- Jedna karta položky sa otvára cez `showInfo`/`openCard`.
- Zásoby a stav zásob počítajú funkcie `stockInfo`, `supplyInfo`, `needsOrder`, `itemState`, `refill`.

## Nákup (stav pri v41)
- Nákup je cez celú obrazovku (trieda `shop-on` na body) a dole je vidieť spodnú lištu. Ťuknutie na záložku alebo Rýchlo nákup uloží a zavrie (`shopLeave`).
- Systémové Späť na Androide: zavrie detail veci, potom nákup; ak bol nákup otvorený z Rýchlo, vráti do Rýchlo (`history.pushState({ml:'shop'})`, `popstate`, `shopPop`, `shopFromQ`).
- Rozloženie je variant B: obchody ako karty pod sebou.
  - Obchody si pomenúvam sám (`extra.stores` = `[{id,n,closed}]`). Vec patrí do obchodu cez pole `s`.
  - Veci bez obchodu sú v karte „Kdekoľvek“. Keď nemám žiadny obchod, karta sa volá „Nákup“.
- Každá karta má „+ pridať do X“: nastaví `shopTarget` a vyhľadávanie potom pridáva do toho obchodu. Výber sa zruší chipom „X ×“ vo vyhľadávaní.
- Karta sa dá zbaliť. Kváčka (`CHEV`, ako v Zásobách) ukazuje ˄ pri otvorenom a ˅ pri zbalenom obchode, nikdy nie doprava na ceruzku.
- Ceruzka (návrh A, v41): modrá SVG ceruzka v jemnom modrom krúžku (`.scedit`). Ňou sa obchod premenuje alebo odstráni; veci z odstráneného obchodu ostanú, len bez obchodu.
- Na konci zoznamu je „+ Nový obchod“.
- V karte sa veci radia automaticky podľa oddelení (`AISLES`, `AIDX`, `CAT`, `guessAisle`).
- Košík (návrh C, v40): zaškrtnutá vec sa presunie do zeleného pásu „🛒 V košíku · N“ hore v karte svojho obchodu ako okrúhla ikonka s fajočkou (`kosHtml`, trieda `.kchip`, `data-kb`). Hlavička obchodu ukazuje „3 z 7 v košíku“.
  - Ťuknutie na ikonku v košíku vráti vec do zoznamu (toast so Späť).
  - Kúpené veci sa po 24 h presunú do `shopRecent` („Kúpiť znova“). Globálna sekcia „Kúpené“ už nie je.
- Odobrať (bez kúpenia, napr. rozmyslel som si to): pri každej veci tlačidlo „Odobrať“ (`.srm`, `data-rm`), toast „X odobraté · Späť“. V detaile je „Odobrať zo zoznamu“. Používať slovo **Odobrať**, nie „Nekúpim“ ani „Vyhodiť“.
- Staré `p:'trh'` sa pri načítaní samo prevedie na obchod „Trh“.
- Funkcie: `renderShop`, `rowHtml`, `shopPut`, `showShopDet` (Koľko / Kde kúpiť / Poznámka), `openStoreDet`, `openShop`, `shopAuto`, `food()`.
- Súkromie: tlačidlo Poslať posiela domácnosti nákup po obchodoch. Moje lieky a kozmetika idú iba vtedy, keď zaškrtnem „pridať aj moje lieky a kozmetiku“.

## Moje rozhodnutia (nemeniť bez opýtania)
- Pri ikonkách nepoužívať pozadie dlaždice (vyzeralo ako zaváraninový pohár). Jamky blistra sú svetlé.
- Ráno/Obed/Večer majú jemný rámik, aktuálna časť dňa má hrubší.
- Ikonky sa pri nečinnosti hýbu každých 6 s, striedavo. Po rozbalení sekcie s 4 s oneskorením. Pokojne, aby to nerušilo.
- Pri zmene času sa tlačidlo zmení na „Potvrdiť“.
- Čas sa zadáva s dvojbodkou (1232 nie je čas).
- Odznaky s číslami sa po ťuknutí skryjú a ukážu sa znova po 24 h.
