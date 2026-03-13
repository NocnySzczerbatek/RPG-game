// ============================================================
// DATABASE: CITIES & NPCs
// ============================================================

export const CITIES = {
  bastion: {
    id: 'bastion',
    name: 'Bastion',
    subtitle: 'Ostatnia Forteca Człowieka',
    description:
      'Bastion stoi na granicy między tym, co pozostało ze świata, a tym, co pochłonęła Pustka. Mury z czarnego granitu są pęknięte, ale wciąż stoją. Mieszkańcy wierzą, że tak będzie zawsze. Wierzą, bo nie mają wyjścia.',
    ambience: 'Smród zgnilizny i wosku ze świec. Dzwon na wieży wybija każdą godzinę — jedno uderzenie za każdego, który poległ poprzednie nocy.',
    bg: 'from-slate-950 via-stone-950 to-slate-900',
    icon: '🏰',
    enemies: ['skeleton_guard', 'corrupted_hound', 'ruin_crawler', 'fallen_knight'],
    bosses: ['the_undying_warden'],
    shop: true,
    forge: false,
    questBoard: true,
    npcs: ['merchant_goran', 'captain_lyra', 'old_seer', 'wounded_soldier'],
    requiredMainQuest: 0,
  },

  iglieze: {
    id: 'iglieze',
    name: 'Iglicze',
    subtitle: 'Miasto Zgasłych Wróżek',
    description:
      'Iglicze zbudowano na szczytach trzech wzgórz wydartych z dna nieba. Kiedyś śpiewały tu wróżki i tkały proroctwa. Teraz ich wieże są grobowcami, a proroctwa spełniły się zbyt dosłownie.',
    ambience: 'Chłodny wiatr niosący echa zamarłych pieśni. Niebo nad Igliczem jest zawsze fioletowe — jak zadawniony siniak.',
    bg: 'from-purple-950 via-slate-950 to-purple-900',
    icon: '🗼',
    enemies: ['wraith_archer', 'void_acolyte', 'stone_sentinel', 'prophet_revenant'],
    bosses: ['the_blind_oracle'],
    shop: true,
    forge: false,
    questBoard: true,
    npcs: ['alchemist_thessa', 'ghost_librarian', 'exiled_knight', 'child_prophet'],
    requiredMainQuest: 2,
  },

  cytadela: {
    id: 'cytadela',
    name: 'Cytadela',
    subtitle: 'Twierdza Upadłego Panteonu',
    description:
      'Cytadela była kiedyś siedzibą bogów na ziemi — pałac tak wysoki, że bogowie musieli się schylać, wchodząc. Teraz jest ruiną zamieszkałą przez ocalałych, złomiarzy bóstwa i jednego kowala, który rozumie jak przetopić jego kości.',
    ambience: 'Powietrze ma smak żelaza i deszczu. Fundamenty drżą raz dziennie — echo walki, która jeszcze się nie skończyła.',
    bg: 'from-red-950 via-slate-950 to-red-900',
    icon: '⛩️',
    enemies: ['divine_automaton', 'god_remnant', 'chaos_lich', 'fallen_seraph'],
    bosses: ['the_last_god', 'the_endless_void'],
    shop: true,
    forge: true,
    questBoard: true,
    npcs: ['blacksmith_valdris', 'fallen_goddess', 'void_herald', 'silent_oracle'],
    requiredMainQuest: 4,
  },
};

export const NPCS = {
  // ─── BASTION ──────────────────────────────────────────
  merchant_goran: {
    id: 'merchant_goran',
    name: 'Goran Kruczko',
    title: 'Kupiec Pozostałości',
    icon: '🧔',
    city: 'bastion',
    role: 'shop',
    dialogue: [
      {
        id: 'greeting',
        text: 'Hej, żywisz. Rzadki widok w te dni. Co ci potrzeba, bo mam jeszcze dziesięć minut zanim muszę uciec przed tym wszystkim.',
        options: [
          { text: 'Chcę kupić.', action: 'open_shop' },
          { text: 'Sprzedaj mi tu coś.', action: 'open_shop' },
          { text: 'Co tu robisz sam?', next: 'lore' },
          { text: 'Nic. Do widzenia.', action: 'close' },
        ],
      },
      {
        id: 'lore',
        text: 'Sam? Ha! Byłem tu z siedmioma braćmi. Trzech zjadła Pustka, dwóch poszło walczyć — wiadomo, gdzie skończyło. Dwóch... odeszło. Zostałem ja, bo mam co sprzedać i lubię ciepłe miejsca.',
        options: [
          { text: 'To smutne.', next: 'lore2' },
          { text: 'Wróćmy do handlu.', action: 'open_shop' },
        ],
      },
      {
        id: 'lore2',
        text: 'Smutne? Chłopie, smutek to luksus. Ja nie mam czasu na smutek. Mam towar, mam złoto i mam jeszcze trochę dni. To wystarczy. Teraz — kupujesz czy nie?',
        options: [
          { text: 'Kupuję.', action: 'open_shop' },
          { text: 'Nie tym razem.', action: 'close' },
        ],
      },
    ],
  },

  captain_lyra: {
    id: 'captain_lyra',
    name: 'Kapitan Lyra Vel',
    title: 'Ostatni Kapitan Bastionu',
    icon: '⚔️',
    city: 'bastion',
    role: 'quest',
    dialogue: [
      {
        id: 'greeting',
        text: 'Nowy? W Bastionie nowości to albo zwiastun śmierci, albo głupoty. Które z tego ty?',
        options: [
          { text: 'Szukam pracy.', next: 'quest_offer' },
          { text: 'Słyszałem o Odłamkach Słońca.', next: 'main_quest' },
          { text: 'Co tu się stało?', next: 'lore' },
          { text: 'Odejdę.', action: 'close' },
        ],
      },
      {
        id: 'quest_offer',
        text: 'Praca. Świetnie. Gadzina z Dolnych Ruin kradnie nasze zapasy od tygodnia. Przynieś mi dowód, że skończyłeś z tym problemem — w złocie nie skąpię.',
        options: [
          { text: 'Przyjmuję zadanie.', action: 'accept_quest_tutorial' },
          { text: 'Najpierw powiedz mi więcej.', next: 'quest_detail' },
        ],
      },
      {
        id: 'quest_detail',
        text: 'Ruiny pod Bastionem — schodziłeś kiedyś do piwnic? Tam żyje coś, co nie żyje. Rodzaj nieumarłego strażnika, który bronił tu skarbca bogów. Tylko że bogowie zniknęli, a strażnik wciąż broni — tylko już nie wiadomo, czego. Rozumiesz? To jest niebezpieczne.',
        options: [
          { text: 'Wchodzę.', action: 'accept_quest_tutorial' },
          { text: 'Za dużo ryzyko.', action: 'close' },
        ],
      },
      {
        id: 'main_quest',
        text: 'Odłamki Słońca... Słyszałeś o tym? To nie jest legenda. Bóg Słońca nie umarł. Rozsypał się na pięć odłamków ukrytych w każdym zakątku tych ruin. Jeśli ktokolwiek je zbierze... może bogowie nie muszą być martwi.',
        options: [
          { text: 'To brzmi niemożliwe.', next: 'main_quest2' },
          { text: 'Gdzie zacząć szukać?', action: 'start_main_quest' },
        ],
      },
      {
        id: 'main_quest2',
        text: 'Niemożliwe? Wszystko jest niemożliwe. Upadek bogów był niemożliwy. Pustka była niemożliwa. A tu jesteśmy. Może "niemożliwe" to słowo, które wymyślili ludzie, którzy się bali próbować.',
        options: [
          { text: 'Zacznę szukać.', action: 'start_main_quest' },
          { text: 'Jeszcze nie jestem gotowy.', action: 'close' },
        ],
      },
      {
        id: 'lore',
        text: 'To co tu się stało? Bogowie umarli. To proste. Niebo zgasło trzy lata temu i od tamtej pory każda noc jest trochę ciemniejsza. Strażnicy Bastionu utrzymują mury siłą woli i głupoty — bo na to nas stać.',
        options: [
          { text: 'Rozumiem.', action: 'close' },
          { text: 'Czy mogę pomóc?', next: 'quest_offer' },
        ],
      },
    ],
  },

  old_seer: {
    id: 'old_seer',
    name: 'Stary Jasnowidzący',
    title: 'Ten, Który Widział za Wiele',
    icon: '👁️',
    city: 'bastion',
    role: 'lore',
    dialogue: [
      {
        id: 'greeting',
        text: 'Och... przychodzisz. Widziałem cię. Nie tutaj — w wizji. Stoisz na stosie kości i trzymasz coś świetlistego. Tyle że stos kości... zdecydowanie rośnie, zanim dotrzesz do tego, co trzymasz.',
        options: [
          { text: 'Co widziałeś?', next: 'prophecy' },
          { text: 'To niepokojące.', next: 'lore' },
          { text: 'Do widzenia.', action: 'close' },
        ],
      },
      {
        id: 'prophecy',
        text: 'Widziałem koniec. Ale koniec to tylko inny rodzaj początku — przynajmniej tak mi się wydawało, zanim zrozumiałem, że bogowie nie zmartwychwstają. Oni się rozsypują. Na odłamki. Na wspomnienia. Na ból, który czujesz, gdy myślisz o tym, co straciłeś.',
        options: [
          { text: 'Co to znaczy?', next: 'prophecy2' },
          { text: 'Jesteś szalony.', action: 'close' },
        ],
      },
      {
        id: 'prophecy2',
        text: 'To znaczy, że Odłamki Słońca... tak, słyszałem. NIE zmartwychwstaną bogów. Ale mogą coś zrobić z Pustką. Mogą ją zszywać — albo rozerwać na zawsze. Ty decydujesz, co z nimi zrobisz. Pamiętaj o tym.',
        options: [
          { text: 'Będę pamiętał.', action: 'close' },
        ],
      },
      {
        id: 'lore',
        text: 'Niepokojące? Niepokojące to, że siedzę tu i mówię do kogoś, kto może naprawdę zmienić bieg historii, i muszę się zastanawiać — czy to dobra historia? Może to nie moja historia. Ale jesteś tu. Więc zacznij.',
        options: [
          { text: 'Zacznę.', action: 'close' },
        ],
      },
    ],
  },

  wounded_soldier: {
    id: 'wounded_soldier',
    name: 'Żołnierz Bart',
    title: 'Ocalały z Pola Ruin',
    icon: '🩹',
    city: 'bastion',
    role: 'lore',
    dialogue: [
      {
        id: 'greeting',
        text: '[Mężczyzna siedzi przy ścianie, trzymając ciasno obandażowane ramię. Patrzy na ciebie jednym okiem — drugie przykrywa przepaska.] Myślałem, że już nie żyję. Okazuje się, że żyję. Nie wiem, czy to dobrze.',
        options: [
          { text: 'Co ci się przydarzyło?', next: 'story' },
          { text: 'Potrzebujesz pomocy?', next: 'help' },
          { text: 'Przepraszam, że przeszkadzam.', action: 'close' },
        ],
      },
      {
        id: 'story',
        text: 'Wysłali nas do Ruin Panteonu, żeby zebrać artefakty. Dwudziestu wojowników. Wróciłem tylko ja. Nie dlatego, że byłem najlepszy. Dlatego, że uciekłem najszybciej. Żyję ze wstydem i raną, która nie chce się zagoić.',
        options: [
          { text: 'Nie wstydź się. Przeżyłeś.', next: 'comfort' },
          { text: 'Co tam widziałeś?', next: 'ruins_lore' },
        ],
      },
      {
        id: 'ruins_lore',
        text: 'W Ruinach... jest bóg. Albo coś, co było bogiem. Siedzi na złamanym tronie i płacze. Ale każda łza to fala siły, która rozrywa człowieka na strzępy. Nie wiem, czego chce. Wiem, że nie da się z nim rozmawiać.',
        options: [
          { text: 'Pójdę tam.', action: 'close' },
          { text: 'To samobójstwo.', action: 'close' },
        ],
      },
      {
        id: 'comfort',
        text: '[Patrzy na ciebie długo.] Może masz rację. Ale wiedz jedno — ci, którzy zginęli, wierzyli w coś. Umarli za coś. Jeśli idzie dalej i znajdziesz Odłamki... zrób to dla nich. Nie dla mnie.',
        options: [
          { text: 'Zrobię to.', action: 'close' },
        ],
      },
      {
        id: 'help',
        text: 'Pomocy? Nie. To co mam winno mi się zagoić samo. Albo nie. W każdym razie — mam radę: nie wchodź do Ruin Dolnych Bastionu sam. To żart. Wiesz przecież, że pójdziesz.',
        options: [
          { text: 'Tak, pójdę.', action: 'close' },
        ],
      },
    ],
  },

  // ─── IGLICZE ──────────────────────────────────────────
  alchemist_thessa: {
    id: 'alchemist_thessa',
    name: 'Thessa Czarna Mgiełka',
    title: 'Alchemistka Iglicza',
    icon: '⚗️',
    city: 'iglieze',
    role: 'shop',
    dialogue: [
      {
        id: 'greeting',
        text: 'Ach, podróżnik. Rzadkość tu, odkąd proroctwa przestały działać. Prorocze wróżki odeszły — ale eliksiry zostały. Mam co potrzeba.',
        options: [
          { text: 'Pokaż towar.', action: 'open_shop' },
          { text: 'Co to jest Iglicze?', next: 'lore' },
          { text: 'Do widzenia.', action: 'close' },
        ],
      },
      {
        id: 'lore',
        text: 'Iglicze? Kiedyś centrum proroctw. Każda wróżka, która tu żyła, widziała przyszłość. Ale kiedy bogowie padli... żadna z nich nie widziała własnej śmierci. Wszystkie zginęły z zaskoczenia. Ironia na poziomie kosmicznym.',
        options: [
          { text: 'To przerażające.', next: 'lore2' },
          { text: 'Handlujmy.', action: 'open_shop' },
        ],
      },
      {
        id: 'lore2',
        text: 'Przerażające? Mnie bardziej przeraża fakt, że ja, zwykła alchemistka bez daru wróżenia, przeżyłam. Na co mi to życie? Warię eliksiry i sprzedaję je ludziom walczącym o przetrwanie świata. To... coś.',
        options: [
          { text: 'To więcej niż "coś".', action: 'close' },
          { text: 'Kupię od ciebie.', action: 'open_shop' },
        ],
      },
    ],
  },

  ghost_librarian: {
    id: 'ghost_librarian',
    name: 'Duch Bibliotekarza',
    title: 'Strażnik Spalonej Wiedzy',
    icon: '👻',
    city: 'iglieze',
    role: 'lore',
    dialogue: [
      {
        id: 'greeting',
        text: '[Przed tobą nie-do-końca-widoczna postać w zakurzonej todze. Wygląda na zaskoczonego, że ktokolwiek go widzi.] Och. Żywy. Rzadkość. Szukasz wiedzy? Mam całość historii — tę, której nie zdążyli spalić.',
        options: [
          { text: 'Powiedz mi o Odłamkach Słońca.', next: 'sun_shards' },
          { text: 'Co wiesz o bogach?', next: 'gods_lore' },
          { text: 'Kim jesteś?', next: 'self' },
        ],
      },
      {
        id: 'sun_shards',
        text: 'Odłamki Słońca — tak, tak. Bóg Słońca, Aureon, nie umarł jak pozostałe bóstwa. Podzielił swoją esencję na pięć odłamków i ukrył je, zanim Pustka go dosięgła. Każdy odłamek jest w innym miejscu — Bastion, Iglicze, Cytadela, Ruiny Panteonu i... ostatni... tu jest niepewność w pergaminach.',
        options: [
          { text: 'Gdzie jest ten ostatni?', next: 'fifth_shard' },
          { text: 'Dziękuję.', action: 'close' },
        ],
      },
      {
        id: 'fifth_shard',
        text: 'Piszą "w sercu tego, kto nie szuka". Wróżki interpretowały to jako zagadkę. Jedna z nich powiedziała, że serce nie-szukającego to Pustka sama. Inna — że to serce boga, który wybrał śmierć. Nie wiem, która miała rację. Obie nie żyją.',
        options: [
          { text: 'To pomaga. Dziękuję.', action: 'close' },
        ],
      },
      {
        id: 'gods_lore',
        text: 'Było ich czternastu. Czternastu Wielkich Bogów i pięćdziesiąt siedem pomniejszych. Pustka pochłonęła ich wszystkich w jeden dzień — "Dzień Ciemności w Południe", jak to nazywamy. Aueron jeden się oparł, bo wiedział, że to nadejdzie. Reszta nie.',
        options: [
          { text: 'Skąd Aueron to wiedział?', next: 'aureon' },
          { text: 'Rozumiem.', action: 'close' },
        ],
      },
      {
        id: 'aureon',
        text: 'Aueron był starszy niż historia. Pamiętał poprzedni cykl — czas, gdy bogowie już raz umarli. Wiedział, że Pustka zawsze powraca i zawsze wygrywa... ale też że możliwe jest zmartwychwstanie. Dlatego podzielił siebie. To przygotowanie.',
        options: [
          { text: 'Zbiorę odłamki.', action: 'close' },
        ],
      },
      {
        id: 'self',
        text: 'Kim jestem? Kustoszem. Byłem żywy, gdy biblioteka w Igliczu płonęła — próbowałem ratować tomy. Nie zdążyłem. Umarłem razem z ostatnim pergaminem. Ale wiedza... wiedza zostaje i stąd mam tę formę. Jestem tym, co pozostało z wiedzy.',
        options: [
          { text: 'To tragiczne i piękne zarazem.', action: 'close' },
        ],
      },
    ],
  },

  exiled_knight: {
    id: 'exiled_knight',
    name: 'Rycerz Solen Ves',
    title: 'Wygnany ze Złotego Zakonu',
    icon: '🗡️',
    city: 'iglieze',
    role: 'quest',
    dialogue: [
      {
        id: 'greeting',
        text: 'Nie zbliżaj się. [Rycerz trzyma rękę na mieczu, ale po chwili opuszcza ją.] ...Przepraszam. Nawyk. Zbyt wiele razy ktoś zbliżał się, żeby mnie zabić. Kim jesteś i czego szukasz?',
        options: [
          { text: 'Szukam Odłamków Słońca.', next: 'sun_shards' },
          { text: 'Potrzebuję wygnańca na misję.', next: 'quest' },
          { text: 'Nic. Przepraszam za przeszkadzanie.', action: 'close' },
        ],
      },
      {
        id: 'sun_shards',
        text: 'Odłamki Słońca. Tak. Moja gildia szukała ich przez rok. Znaleźliśmy jeden — ten w Igliczu — ale kiedy go dotknęliśmy... coś się stało. Połowa rycerzy wariuje. Połowa jest martwa. Ja... wygnali mnie, zanim to powiedzieli otwarcie.',
        options: [
          { text: 'Gdzie jest odłamek z Iglicza?', next: 'shard_location' },
          { text: 'Przykro mi.', action: 'close' },
        ],
      },
      {
        id: 'shard_location',
        text: 'W Krypcie Snów pod miastem. Strzeże go Ślepa Wyroczynia — coś, co było prorokiem, zanim Pustka zabrała jej oczy i wyostrzyła wszystko inne. Jest potężna. I szalona. Ale odłamek jest tam.',
        options: [
          { text: 'Idę tam.', action: 'close' },
          { text: 'Pójdziesz ze mną?', next: 'join_party' },
        ],
      },
      {
        id: 'join_party',
        text: 'Ja? [Milczy chwilę.] Nie. Moje miejsce jest tu. Ale... weź to. [Wyciąga pergamin z mapą.] Mapa Krypty. I nie mów nikomu, że ci dałem. Mam wrogów w tym mieście.',
        options: [
          { text: 'Dziękuję, rycerzu.', action: 'close' },
        ],
      },
      {
        id: 'quest',
        text: 'Misja dla wygnańca? Masz tupet. Ale OK — mam dług do spłacenia. Jeśli pójdziesz do Krypty i przyniesiecie mi fragment mapy boga, który tam leży pochowany, zrobię coś dla ciebie. Moja rodzina jest w Bastionoe i potrzebuje ochrony.',
        options: [
          { text: 'Przyjmuję.', action: 'accept_quest_iglieze' },
          { text: 'Nie tym razem.', action: 'close' },
        ],
      },
    ],
  },

  child_prophet: {
    id: 'child_prophet',
    name: 'Dziecko bez Imienia',
    title: 'Ostatnia Wróżka Iglicza',
    icon: '👧',
    city: 'iglieze',
    role: 'lore',
    dialogue: [
      {
        id: 'greeting',
        text: '[Dziecko siedzi w kącie z zamkniętymi oczami. Gdy wchodzisz, mówi bez otwierania ich.] Wiedziałam, że przyjdziesz. Oczywiście wiedziałam. Zawsze wiedziałam. Teraz wiem mało — dar ginie z bogami. Ale ciebie widzę. Widzę to, co za tobą.',
        options: [
          { text: 'Co widzisz?', next: 'prophecy' },
          { text: 'Kim jesteś?', next: 'self' },
          { text: 'Przepraszam, że przeszkadzam.', action: 'close' },
        ],
      },
      {
        id: 'prophecy',
        text: 'Widzę śmierć. Widzę twoje ręce pełne śmierci — ale też pełne czegoś innego. Ogień? Nie. Coś jak ogień, ale nie ogień. Jak słońce, tylko... odłamane. To co zbierasz, będzie ciążyć. Ale jak to złożysz — zmienisz wszystko.',
        options: [
          { text: 'Boję się tego.', next: 'fear' },
          { text: 'Zrobię to.', action: 'close' },
        ],
      },
      {
        id: 'fear',
        text: 'Strach jest właściwy. Ci, którzy nie boją się — nie rozumieją, co robią. Ty rozumiesz. Dlatego boisz się. Dlatego możesz zwyciężyć.',
        options: [
          { text: 'Dziękuję ci.', action: 'close' },
        ],
      },
      {
        id: 'self',
        text: 'Kim jestem? Ostatnią. Wszystkie wróżki Iglicza umarły, gdy bogowie padli. Ja... zostałam. Nie wiem dlaczego. Może bo nie zdążyłam urodzić się wróżką naprawdę — za mała. Teraz moje proroctwa są małe. Ale prawdziwe.',
        options: [
          { text: 'Jesteś dzielna.', action: 'close' },
        ],
      },
    ],
  },

  // ─── CYTADELA ──────────────────────────────────────────
  blacksmith_valdris: {
    id: 'blacksmith_valdris',
    name: 'Valdris Kowal Nieśmiertelny',
    title: 'Boski Kowal Cytadeli',
    icon: '🔨',
    city: 'cytadela',
    role: 'forge',
    dialogue: [
      {
        id: 'greeting',
        text: 'Słyszę. Trzy uderzenia w sekunde — to jest rytm bogów. Baw się tym rytmem źle i stalnia ostrze. Baw się dobrze... i ostrze może teraz zabijać bogów. Czego potrzebujesz, wędrowcze?',
        options: [
          { text: 'Chcę wykuć boską broń.', action: 'open_forge' },
          { text: 'Skąd masz tę umiejętność?', next: 'lore' },
          { text: 'Co to ten Eter Bóstw?', next: 'ether_lore' },
          { text: 'Na razie nic.', action: 'close' },
        ],
      },
      {
        id: 'lore',
        text: 'Skąd? [Śmieje się głęboko.] Byłem bogiem. Małym bogiem, prawda — bogiem rzemiosła. Ale bogiem. Kiedy Pustka przyszła, ukryłem się w swojej własnej pracy. Wtopiłem się w metal i przetrwałem jako... coś między człowiekiem a narzędziem. Teraz wykuwam zamiast kraść boskie przywileje. Sprawiedliwsze.',
        options: [
          { text: 'Naprawdę byłeś bogiem?', next: 'lore2' },
          { text: 'Rozumiem. Wykuj mi broń.', action: 'open_forge' },
        ],
      },
      {
        id: 'lore2',
        text: 'Teraz jestem kowalem. Możesz mi wierzyć albo nie — nie zmienia to faktu, że wiem, jak kuć. I że jedyne rzeczy, które mogą skrzywdzić to, co nadchodzi, to te, które tworzę tu, w Cytadeli. Wybór należy do ciebie.',
        options: [
          { text: 'Zaufam ci.', action: 'open_forge' },
        ],
      },
      {
        id: 'ether_lore',
        text: 'Eter Bóstw to resztki duszy boga — to, co pozostaje, gdy bóg umiera lub rozsypuje się. Potwory z okolic Cytadeli karmią się tym eterem. Zabij je, zbierz eter, przynieś mi. Plus jedna legendarna broń jako baza. Ja robię resztę.',
        options: [
          { text: 'Zacznę zbierać.', action: 'close' },
          { text: 'Pokaż mi możliwości kucia.', action: 'open_forge' },
        ],
      },
    ],
  },

  fallen_goddess: {
    id: 'fallen_goddess',
    name: 'Astra, Upadła',
    title: 'Bogini Gwiazd bez Nieba',
    icon: '⭐',
    city: 'cytadela',
    role: 'lore',
    dialogue: [
      {
        id: 'greeting',
        text: '[Kobieta w rozerwanej szacie siedzi na schodach, patrząc w niebo. Jej oczy świecą słabym błękitem.] Śledziłam ciebie przez gwiazdozbiory — och, czekaj. Nie ma już gwiazd. Śledziłam cię przez... przez intuicję. Chodź tu.',
        options: [
          { text: 'Kim jesteś?', next: 'self' },
          { text: 'Czy to ty jesteś ostatnim boskim odłamkiem?', next: 'shard' },
          { text: 'Czego chcesz?', next: 'want' },
        ],
      },
      {
        id: 'self',
        text: 'Byłam Astrą. Boginiawą — jak mawiali. Bogini nawigacji, przeznaczenia i tęsknoty. Kiedy bogowie upadli, straciłam domenę — nie ma już gwiazd, którymi nawigujesz, nie ma przeznaczenia, jest tylko chaos, a tęsknota... tęsknota pozostała. To najsilniejsza ze wszystkich sił.',
        options: [
          { text: 'Co tęsknota może zrobić?', next: 'longing' },
          { text: 'Jak możesz mi pomóc?', next: 'help' },
        ],
      },
      {
        id: 'shard',
        text: '[Milczy długo.] Sprytne pytanie. I przerażające. Tak — czuję w sobie odłamek Aereona. On schował go we mnie, bo wiedział, że Pustka nie szuka zrozpaczonych bogów. Szuka siły. Ja byłam zbyt słaba, żeby mnie szukała. Smutna ironia.',
        options: [
          { text: 'Oddasz go mi dobrowolnie?', next: 'give_shard' },
          { text: 'To niesamowite.', action: 'close' },
        ],
      },
      {
        id: 'give_shard',
        text: 'Kiedy przyjdzie czas — oddam. Ale najpierw musisz udowodnić, że możesz go unieść. Pokonaj to, co straszy w murach Cytadeli. Ostatni Bóg wciąż tu krąży — jego złamana forma. Pokonaj go. Wtedy przyjdź do mnie.',
        options: [
          { text: 'Zrobię to.', action: 'close' },
          { text: 'Rozumiem.', action: 'close' },
        ],
      },
      {
        id: 'longing',
        text: 'Tęsknota potrafi wmawiać ci, że wróg jest przyjacielem. Potrafi sprawić, że idziesz dalej, niż ciało pozwala. Potrafi ogrzać cię w środku, gdy wszystko wokoło jest lodem. Ale też — potrafi cię zniszczyć, jeśli nie masz za czym tęsknić. Masz za czym tęsknić?',
        options: [
          { text: 'Tak.', action: 'close' },
          { text: 'Nie wiem.', action: 'close' },
        ],
      },
      {
        id: 'help',
        text: 'Mogę ci powiedzieć jedno: Ostatni Bóg w Cytadeli ma słaby punkt. Nie w ciele — w pamięci. Wzywa imię boga, który go zdradził. Kiedy to krzyknie — przez chwilę jest otwarty. To chwila, gdy uderz.',
        options: [
          { text: 'Dziękuję, Astro.', action: 'close' },
        ],
      },
      {
        id: 'want',
        text: 'Chcę? Chcę żeby niebo wróciło. I gwiazdy. I coś, co jest warte nawigowania. Chcę żeby bogowie przestali być legendą, a stali się znowu faktem. Czy to za dużo chcieć od kogoś z mieczem przy boku?',
        options: [
          { text: 'Postaram się.', action: 'close' },
        ],
      },
    ],
  },

  void_herald: {
    id: 'void_herald',
    name: 'Herold Pustki',
    title: 'Ten, Który Przyszedł Przed Zniszczeniem',
    icon: '🌑',
    city: 'cytadela',
    role: 'lore',
    dialogue: [
      {
        id: 'greeting',
        text: 'Idziesz do przodu. Widzę to. Zbierasz te odłamki jak dziecko zbiera kruszyny ze stołu bogów. Czy naprawdę wiesz, co zrobisz, gdy je złożysz?',
        options: [
          { text: 'Przywrócę bogów.', next: 'restore' },
          { text: 'Zniszczę Pustkę.', next: 'destroy' },
          { text: 'Kim jesteś?', next: 'self' },
          { text: 'To moja sprawa.', action: 'close' },
        ],
      },
      {
        id: 'restore',
        text: 'Przywrócić bogów. To jest... naiwne. Bogowie stworzyli Pustkę. Ich pragnienia, ich ambicje, ich konflikty — to jest Pustka. Czy naprawdę chcesz ich z powrotem? Zastanów się. Masz jeszcze czas.',
        options: [
          { text: 'Nie zmienię zdania.', action: 'close' },
          { text: 'Może masz rację...', next: 'doubt' },
        ],
      },
      {
        id: 'destroy',
        text: 'Zniszczyć Pustkę. Hmm. Możliwe. Ale Pustka to nie potwór — to brak. Jak zniszczyć coś, czego nie ma? Odłamki Słońca mogą wypełnić tę pustkę... ale wtedy ktoś lub coś musi stać się nową kotwicą dla tego wypełnienia. Czy jesteś gotów?',
        options: [
          { text: 'Jestem gotów.', action: 'close' },
          { text: 'Co to znaczy?', next: 'anchor' },
        ],
      },
      {
        id: 'anchor',
        text: 'To znaczy, że możesz przeżyć — ale zmieniasz się. Trwale. Część ciebie staje się kotwicą dla nowego ładu. Reszysz się czegoś, co jest sobą — i stajesz się czymś między człowiekiem a bogiem. To nie jest gorzej ani lepiej. Jest inaczej. Czy możesz to zaakceptować?',
        options: [
          { text: 'Tak.', action: 'close' },
          { text: 'Muszę to przemyśleć.', action: 'close' },
        ],
      },
      {
        id: 'self',
        text: 'Jestem tym, co przyszło przed zniszczeniem. Heroldem. Przybyłem do Cytadeli rok przed Dniem Ciemności i próbowałem ostrzec. Nikt nie słuchał. Teraz jestem świadkiem — obserwuję czy ktokolwiek powtórzy tego błędu. Ty nie.',
        options: [
          { text: 'Dlaczego ja nie?', next: 'why' },
        ],
      },
      {
        id: 'why',
        text: 'Bo słuchasz. Nawet gdy nie chcesz słyszeć. To rzadka cecha w czasach, gdy wszyscy krzyczą.',
        options: [
          { text: 'Dziękuję.', action: 'close' },
        ],
      },
      {
        id: 'doubt',
        text: 'Dobra odpowiedź. Ten, kto wątpi, myśli. Ten, kto myśli — wybiera świadomie. Nie odradzam ci zbierania odłamków. Odradzam ci robienia tego bez zastanowienia. Jaka jest twoja odpowiedź?',
        options: [
          { text: 'Zbiorę je świadomie.', action: 'close' },
        ],
      },
    ],
  },

  silent_oracle: {
    id: 'silent_oracle',
    name: 'Milcząca Wyrocznia',
    title: 'Głos Bez Słów',
    icon: '🔇',
    city: 'cytadela',
    role: 'lore',
    dialogue: [
      {
        id: 'greeting',
        text: '[Postać w pełni zasłoniętych szatach stoi nieruchomo. Gdy się zbliżasz, słyszysz w głowie — nie uszami — jeden głos:] "Wszystko już wiem. TY nie wiesz wszystkiego. To zmienić."',
        options: [
          { text: 'Powiedz mi, czego nie wiem.', next: 'revelation' },
          { text: 'Co to jest wyrocznia?', next: 'self' },
          { text: 'Odejdę.', action: 'close' },
        ],
      },
      {
        id: 'revelation',
        text: '[Głos w głowie:] "Piąty odłamek jest w tobie. Nie w twoim ciele — w tym, czego chcesz najbardziej. Aueron ukrył go w pragnieniu. Kiedy zbierzesz cztery i staniesz przed Ostatnim Bogiem — pragnąc zwycięstwa — odłamek się objawi. Nie szukaj go. On cię znajdzie."',
        options: [
          { text: 'Rozumiem.', action: 'close' },
          { text: 'To niemożliwe.', next: 'denial' },
        ],
      },
      {
        id: 'denial',
        text: '[Głos:] "Mówisz to samo co bogowie, gdy im powiedziałam, że Pustka nadejdzie. Rozmawialiśmy; nie posłuchali. Teraz nie żyją. Posłuchaj."',
        options: [
          { text: 'Słucham.', next: 'revelation' },
        ],
      },
      {
        id: 'self',
        text: '[Głos:] "Wyrocznia to funkcja — nie osoba. Byłam osobą. Teraz jestem tym, co zostało po tym, jak osoba przestała mieć znaczenie. Nie pytaj o to więcej."',
        options: [
          { text: 'Rozumiem. Dziękuję.', action: 'close' },
        ],
      },
    ],
  },
};

export const getCityById = (id) => CITIES[id] || null;
export const getNPCById = (id) => NPCS[id] || null;
export const getCityNPCs = (cityId) =>
  (CITIES[cityId]?.npcs || []).map((npcId) => NPCS[npcId]).filter(Boolean);
