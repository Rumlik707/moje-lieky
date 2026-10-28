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
- Návrhy (mockupy) ukladaj do priečinka `navrhy/` – podpriečinok s číslom a témou, obrázky zmenšené na polovicu ako JPG (kvalita ~82), svetlý aj tmavý. Do `navrhy/README.md` dopíš popis a označ vybraný návrh ✅. Priečinok nie je v `FILES` v `sw.js`, do telefónu sa nesťahuje.
- Commit podpisuj `-c user.name="Rumlik707" -c user.email="rumlik@gmail.com"`. Potom spusti `git fetch origin main && git rebase origin/main && git push origin HEAD:main`.
- Pri úpravách cez Python skripty použi zámenu presného reťazca a kontrolu počtu výskytov (assert).

## Rozloženie appky
- Spodná lišta: Kalendár · Zásoby · **Dnes** (v strede, domček) · **Rýchlo ⚡** · Viac.
- Rýchlo otvorí vejár 4 bublín (pole `QG`, funkcia `quickOpen`, v52, návrh A): **Pridať** (nový liek/kozmetika – skupina sa vyberie vo formulári, `openAdd`) vľavo dole · **Vedľajší účinok** (`openFx`) · **Poslať nákup** (v53: otvorí nákup a hneď okno Poslať, `openSend`) · **Nákup** vpravo dole (zvyk, nemeniť pozíciu). Malé odznaky `+`/`!` (`.qbd`). Systémové Späť pri otvorenom Rýchlo len zavrie bubliny a ostane sa na poslednej obrazovke (v54: `history.pushState({ml:'quick'})`, `qIgnorePop`; pri otvorení Nákupu/Poslať z Rýchlo sa záznam `quick` nahradí `shop` cez `replaceState`). „Užil som“ v Rýchlo nechcem.
- Prehliadka priamo v appke (v56, zjednodušená po spätnej väzbe – „v55 bola neprehľadná, nového používateľa by odradila“): **len 6 krokov, každý jedna krátka veta**: Dnes · Odklikni · Zásoby · Rýchlo · Nákup (bublina v Rýchlo) · Viac. Žiadne ďalšie časti samy nevyskakujú. Kód: `TP.base.steps`, `TIPS`, `tourStart`, `tourShow`, `tourPlace`, `tourEnd`, `tourMaybe` (len base), `openHelp`; stav `lieky-tour` (`{base:1}`).
  - Vzhľad (návrh 3): tmavé pozadie, žltý rámik okolo tlačidla, poskakujúci prst 👆/👇, veľká bublina (ikonka v žltom krúžku, nadpis 22 px, veta 18 px, bodky, „✕ Zavrieť“, „Ďalej“/„Hotovo“). Svetlý režim: krémová bublina, tmavé tlačidlo Ďalej. Tmavý režim: tmavá bublina so žltými prvkami (nie krikľavá).
  - Pri prvom spustení nový používateľ (bez `lieky-intro`). Viac → „Ako appka funguje“: „▶ Prehliadka“ (6 krokov) + krátky zoznam Tipy (košík, ukončiť, odobrať, leták, poslať, história, ceruzka, hodinky). Systémové Späť = krok späť.
  - Rámik (v57): pri okrúhlych tlačidlách (domček `.tab.home .hb`, fajka `#hero .hall`, bublina Nákup `[data-qg=shop] .o`) je kruh (`r:1` v kroku), pri tlačidlách v lište tesný obdĺžnik (pad 3, radius 18).
  - Nepridávať do prehliadky ďalšie kroky ani dlhé texty bez opýtania – menej je viac.
  - V testoch nastav `lieky-tour` na hotové, inak prehliadka prekryje obrazovku.
- Skupiny položiek: `med` (Lieky), `care` (Kvapky a ošetrenie), `cosm` (Kozmetika), `swap` (Výmena, napr. hlavice zubnej kefky). Skupinu vracia funkcia `grpOf(m)`.
- Ikonky sú realistické a animované 3D (`pillSvg`, `picM`, `iconState`, `goIcon`). Animácie sa spúšťajú triedou `.go`. Spoločné gradienty sú v globálnom svg H3D.
- Jedna karta položky sa otvára cez `showInfo`/`openCard`.
- Zásoby a stav zásob počítajú funkcie `stockInfo`, `supplyInfo`, `needsOrder`, `itemState`, `refill`.

## Nákup (stav pri v53)
- Poslať (v53, návrh A): tlačidlo Poslať v hlavičke aj bublina v Rýchlo otvorí okno „Poslať nákup“ (`openSend`, `sendGroups`, `sendText`) v `shDet`: zaškrtnuté obchody (len tie, kde niečo treba kúpiť; odškrtnutie si appka pamätá počas behu – `sendOff`), čip „🔒 Moje lieky a kozmetika“ (vypnutý, `sendMine`), náhľad „Takto to príde“ a tlačidlo „Poslať · N vecí“ → systémové zdieľanie. Veci v košíku sa neposielajú. Spodná lišta „Pri posielaní pridať aj moje lieky…“ je zrušená (presunutá do okna).
- Hlavička obchodu (v51): názov na celý riadok (neskracuje sa), pod ním počet vecí (`.nmw`). Vpravo okrúhle tlačidlo **Leták** (`.slf`, návrh A) → kváčka (samostatné tlačidlo `.scchev`, tiež `data-stog`) → ceruzka.
- Leták (v51): otvorí web reťazca v prehliadači (`lfUrl`, `chainUrl`, `CHAINS`): Lidl, Kaufland, Billa, Tesco, Coop Jednota, Terno, dm – rozpozná sa podľa slova v názve (Billa 2, Billa Bajkalská → Billa). Vlastný presný odkaz sa dá zadať pri ceruzke v políčku „Odkaz na leták“ (`st.lf`); prázdne = späť na web reťazca. Obchod bez známeho reťazca a bez odkazu tlačidlo nemá. Appka leták nečíta, len otvára.
- Po otvorení nákupu (aj z Rýchlo) sa klávesnica sama neotvorí; až po ťuknutí na riadok „Čo treba kúpiť?“ alebo na „+ pridať do X“ (v49).
- Hlavička (v48): pod nadpisom dve rovnaké tlačidlá **Poslať · História** (`.shtri`, `.shtb`, `#shopShare`, `#shopHist`). Tlačidlo Uložiť je zrušené – každá zmena sa ukladá hneď sama, nákup sa zavrie spodnou lištou alebo systémovým Späť.
- Nákup je cez celú obrazovku (trieda `shop-on` na body) a dole je vidieť spodnú lištu. Ťuknutie na záložku alebo Rýchlo nákup uloží a zavrie (`shopLeave`).
- Systémové Späť na Androide: zavrie detail veci, potom nákup; ak bol nákup otvorený z Rýchlo, vráti do Rýchlo (`history.pushState({ml:'shop'})`, `popstate`, `shopPop`, `shopFromQ`).
- Rozloženie je variant B: obchody ako karty pod sebou.
  - Obchody si pomenúvam sám (`extra.stores` = `[{id,n,closed}]`). Vec patrí do obchodu cez pole `s`.
  - Veci bez obchodu sú v karte „Kdekoľvek“. Keď nemám žiadny obchod, karta sa volá „Nákup“.
  - Kdekoľvek sa dá zbaliť kváčkou ako ostatné obchody (`extra.freeClosed`, v46); pri Kdekoľvek je ceruzka (`data-sfree`, `openFreeDet`, v47, voľba 2b): napíšem názov (napr. „Billa 2“) a všetky veci bez obchodu sa presunú do nového obchodu s týmto názvom; ak taký obchod už mám, pridajú sa k nemu. Toast so Späť. Karta „Nákup“ (bez obchodov) sa nezbaľuje.
  - Presun veci do iného obchodu: ťuknúť na názov veci → „Kde kúpiť“ → Uložiť. Cieľový obchod sa rozbalí a ukáže sa toast „X presunuté do Y“ (v46).
- Každá karta má „+ pridať do X“: nastaví `shopTarget` a vyhľadávanie potom pridáva do toho obchodu. Výber sa zruší chipom „X ×“ vo vyhľadávaní.
- Karta sa dá zbaliť. Kváčka (`CHEV`, ako v Zásobách) ukazuje ˄ pri otvorenom a ˅ pri zbalenom obchode, nikdy nie doprava na ceruzku.
- Ceruzka (návrh A, v41): modrá SVG ceruzka v jemnom modrom krúžku (`.scedit`). Ňou sa obchod premenuje alebo odstráni; veci z odstráneného obchodu ostanú, len bez obchodu.
- Na konci zoznamu je „+ Nový obchod“.
- V karte sa veci radia automaticky podľa oddelení (`AISLES`, `AIDX`, `CAT`, `guessAisle`).
- Košík (návrh C, v40): zaškrtnutá vec sa presunie do zeleného pásu „🛒 V košíku · N“ hore v karte svojho obchodu ako okrúhla ikonka s fajočkou (`kosHtml`, trieda `.kchip`, `data-kb`). Hlavička obchodu ukazuje „3 z 7 v košíku“.
  - Ťuknutie na ikonku v košíku vráti vec do zoznamu (toast so Späť).
  - Kúpené veci sa po 24 h samé presunú do histórie a do `shopRecent` („Naposledy kúpené“, v50). Globálna sekcia „Kúpené“ už nie je.
- Ukončenie nákupu po obchodoch (v42): keď je v karte aspoň 1 vec v košíku, ukáže sa zelené „✓ Ukončiť nákup v X“ (`.sfin`, `data-fin`, `finishStore`). Kúpené veci idú do histórie a „Naposledy kúpené“, nekúpené ostanú na zozname, karta sa zbalí. Toast so Späť. Keď sa do zbaleného obchodu niečo pridá, sám sa rozbalí (`shopPut`).
- História: `extra.shopHist` = `[{id,s,at,items:[{t,a,q,note,i,c}]}]`, drží sa 31 dní (`HIST_DAYS`). Otvára sa tlačidlom História v hlavičke (v43; riadky „Naposledy…“ v kartách obchodov sú zrušené). Okno „História nákupov“ v `shDet` (`openHist`, filter `histF`): filtre Všetky · obchody v ich poradí · Kdekoľvek (`_`), nákupy podľa dátumu s názvom obchodu, ťuknutie na vec ju pridá späť do zoznamu toho obchodu. Prázdny stav má vysvetľujúci text. História je len pre mňa, k domácnosti cez Poslať nejde.
- Okná v nákupe (detail veci, obchod, história, všetko v `shDet`) sa dajú zavrieť potiahnutím čiarky dole (návrh A, v44, ako karta lieku): okno ide za prstom, pozadie sa zosvetľuje, nad 90 px sa zavrie, inak sa vráti. Bez nápisov. Dotyková plocha čiarky je cez celú šírku a ~45 px vysoká (`.shdet .grab`, v45). V histórii je dole tlačidlo „Zavrieť“ (nie Hotovo) a nie je tam podnadpis „Ťukni na vec…“.
- Odobrať (bez kúpenia, napr. rozmyslel som si to): pri každej veci tlačidlo „Odobrať“ (`.srm`, `data-rm`), toast „X odobraté · Späť“. V detaile je „Odobrať zo zoznamu“. Používať slovo **Odobrať**, nie „Nekúpim“ ani „Vyhodiť“.
- Staré `p:'trh'` sa pri načítaní samo prevedie na obchod „Trh“.
- Funkcie: `renderShop`, `rowHtml`, `shopPut`, `showShopDet` (Koľko / Kde kúpiť / Poznámka), `openStoreDet`, `openShop`, `shopAuto`, `food()`.
- Súkromie: Poslať posiela domácnosti nákup po obchodoch. Moje lieky a kozmetika idú iba vtedy, keď v okne Poslať zapnem čip „🔒 Moje lieky a kozmetika“.

## Otvorené veci (stav 28. 10. 2026, v51)
- **Chýbajúci čas užitia:** druhému používateľovi sa pri niektorých liekoch v Kalendári zobrazil čas užitia len pri jednom lieku. V testoch (veľká fajka naraz, po jednom, oznámenie „Užil som“, dodatočne) som to nezopakoval – všetky cesty čas zapisujú. Čakám od používateľa: screenshot z Kalendára (rozbalené Ráno), verziu appky z Viac a ako bol liek odkliknutý. Nič neopravovať naslepo.
- **Presné odkazy na letáky:** `CHAINS` zatiaľ otvára úvodné stránky reťazcov (nevedel som overiť presné adresy letákov). Keď mi používateľ pošle presné odkazy (napr. leták Kauflandu), nastaviť ich v `CHAINS`.
- Možné ďalšie kroky, o ktorých sme hovorili, ale neboli schválené: „je v akcii?“ pri jednotlivej veci (odkaz na vyhľadávanie akcií), ručné označenie akcie s termínom, rýchly presun všetkých vecí z jedného obchodu do druhého.

## Moje rozhodnutia (nemeniť bez opýtania)
- Pri ikonkách nepoužívať pozadie dlaždice (vyzeralo ako zaváraninový pohár). Jamky blistra sú svetlé.
- Ráno/Obed/Večer majú jemný rámik, aktuálna časť dňa má hrubší.
- Ikonky sa pri nečinnosti hýbu každých 6 s, striedavo. Po rozbalení sekcie s 4 s oneskorením. Pokojne, aby to nerušilo.
- Pri zmene času sa tlačidlo zmení na „Potvrdiť“.
- Čas sa zadáva s dvojbodkou (1232 nie je čas).
- Odznaky s číslami sa po ťuknutí skryjú a ukážu sa znova po 24 h.
