import type { Skill, SkillId } from "./types";

export const SKILLS: Skill[] = [
  {
    id: "articles",
    title: "Artikkelit",
    eyebrow: "a / an / the",
    summary: "Milloin yksikkö tarvitsee a tai an, milloin the, ja milloin artikkelia ei ole.",
    levels: "A1–B2",
    trap: "Suomessa ei ole artikkeleita. Siksi a, an ja the jäävät pois tai vaihtuvat keskenään.",
    rules: [
      "a ja an tarkoittavat yhtä uutta, ei vielä tuttua asiaa. an, jos sana alkaa vokaaliäänteellä (an apple, an hour). a, jos se alkaa konsonanttiäänteellä (a dog, a university).",
      "the tarkoittaa, että kuulija tietää mistä on kyse, tai että asia on ainutlaatuinen: the sun, the door we talked about.",
      "Ei artikkelia, kun puhutaan asioista yleisesti monikossa tai aineena (Dogs bark. Water is cold.) eikä monissa paikoissa, kun ollaan niiden käyttäjinä (to school, at home).",
    ],
    contrasts: [
      { en: "I saw a dog.", fi: "Joku koira, mainitaan ensimmäistä kertaa." },
      { en: "I saw the dog.", fi: "Se tietty koira, jonka molemmat tuntevat." },
      { en: "Dogs are loyal.", fi: "Koirat yleensä. Artikkelia ei käytetä." },
    ],
    watch: [
      "an hour ja an honest person, koska h ei äänny",
      "a university ja a European city, koska alku on /j/-äänne",
      "soittimet: play the piano, play the guitar",
      "maat: in Finland, mutta the Netherlands, the United States",
    ],
    mistakes: [
      { wrong: "I have dog.", right: "I have a dog." },
      { wrong: "She is best player.", right: "She is the best player." },
      { wrong: "I live in the Finland.", right: "I live in Finland." },
    ],
  },
  {
    id: "present",
    title: "Preesens ja -ing",
    eyebrow: "work / is working",
    summary: "Present simple toistuu ja on totta. Present continuous on käynnissä nyt.",
    levels: "A1–B1",
    trap: "Suomen preesens kattaa sekä I work että I am working. Englannissa ne erotetaan.",
    rules: [
      "Tottumus, aikataulu ja fakta: present simple. She works in a bank. Water boils at 100 °C. The train leaves at 8.",
      "Juuri nyt tai tilapäisesti käynnissä: present continuous. Look, she is working.",
      "He, she ja it saavat -s-päätteen vain simple-muodossa. Kielto ja kysymys: doesn't / does, ja pääverbi ilman -s:tä.",
    ],
    contrasts: [
      { en: "I live in Helsinki.", fi: "Pysyvä tilanne." },
      { en: "I am living with my aunt this month.", fi: "Tilapäinen järjestely." },
      { en: "She is always losing her keys.", fi: "Ärsyttävä toistuva tapa, ei pelkkä fakta." },
    ],
    watch: [
      "taajuusadverbia: usually, often, never tulevat pääverbin eteen",
      "be-verbin kanssa adverbi tulee perään: She is often late.",
      "aikataulu on simple, vaikka se tapahtuu tulevaisuudessa",
    ],
    mistakes: [
      { wrong: "She work in a bank.", right: "She works in a bank." },
      { wrong: "Does she works here?", right: "Does she work here?" },
      { wrong: "I am knowing the answer.", right: "I know the answer." },
    ],
  },
  {
    id: "past",
    title: "Imperfekti ja perfekti",
    eyebrow: "lived / have lived",
    summary: "Päättynyt aika on past simple. Yhteys nykyhetkeen on present perfect.",
    levels: "A2–B2",
    trap: "Suomen perfekti ei vastaa englannin present perfectiä. Yesterday ja in 2019 vaativat imperfektin.",
    rules: [
      "Jos ajanjakso on päättynyt, käytä past simpleä: I saw her yesterday. I lived in Oulu in 2019.",
      "Jos asia alkoi menneisyydessä ja jatkuu, tai tulos näkyy nyt: present perfect. I have lived here since 2020. I have lost my keys.",
      "since kertoo aloituspisteen, for keston. Menneisyyden menneisyys on past perfect: The film had already started.",
    ],
    contrasts: [
      { en: "I lived in Turku for three years.", fi: "En asu siellä enää. Jakso on ohi." },
      { en: "I have lived in Turku for three years.", fi: "Asuminen jatkuu yhä." },
      { en: "I have never been to Japan.", fi: "Elämä jatkuu, kokemus puuttuu yhä." },
    ],
    watch: [
      "just, already ja yet esiintyvät usein present perfectin kanssa",
      "know, have ja be eivät yleensä saa -ing-muotoa perfectissä: I have known, en I have been knowing",
      "when-lauseessa past perfect kertoo, kumpi tapahtui ensin",
    ],
    mistakes: [
      { wrong: "I have seen that film yesterday.", right: "I saw that film yesterday." },
      { wrong: "I live here since 2020.", right: "I have lived here since 2020." },
      { wrong: "She has went home.", right: "She has gone home." },
    ],
  },
  {
    id: "future",
    title: "Tulevaisuus",
    eyebrow: "will / going to / -ing",
    summary: "Englannissa ei ole yhtä futuuria. Muoto kertoo, onko kyse päätöksestä, suunnitelmasta vai aikataulusta.",
    levels: "A2–B2",
    trap: "Will ei ole automaattinen käännös sanalle tulen. Valinta riippuu siitä, milloin päätös syntyi.",
    rules: [
      "Päätös puhehetkellä ja arvaus: will. The phone is ringing. I'll get it. I think it will rain.",
      "Aiempi suunnitelma tai näkyvä merkki: be going to. I'm going to study medicine. Look at those clouds. It's going to rain.",
      "Sovittu tapaaminen on present continuous. Aikataulu on present simple: We're meeting at six. The lesson starts at nine.",
    ],
    contrasts: [
      { en: "I'll help you.", fi: "Tarjous tai päätös juuri nyt." },
      { en: "I'm going to help you tomorrow.", fi: "Olen jo päättänyt näin." },
      { en: "I'm helping you tomorrow.", fi: "Aika on sovittu." },
    ],
    watch: [
      "if-lauseessa ei käytetä will-muotoa: If it rains, I will stay.",
      "shall esiintyy tarjouksissa: Shall I open the window?",
      "future continuous kertoo, mitä on kesken tiettynä hetkenä: This time tomorrow I will be sitting on a train.",
    ],
    mistakes: [
      { wrong: "When I will arrive, I call you.", right: "When I arrive, I will call you." },
      { wrong: "I will to go home.", right: "I will go home." },
      { wrong: "She going to leave.", right: "She is going to leave." },
    ],
  },
  {
    id: "agreement",
    title: "Yksikkö ja monikko",
    eyebrow: "is / are, -s",
    summary: "Verbi taipuu subjektin mukaan. Kolmas persoona ja erikoissubstantiivit kompastuttavat.",
    levels: "A1–B2",
    trap: "Suomen verbi ei merkitse persoonaa samalla päätteellä. Englannissa he, she ja it vaativat -s:n tai is/has.",
    rules: [
      "I am, you are, he/she/it is, we/they are. Monikko: are, have, do.",
      "Everyone, each ja neither of ottavat yksikön: Everyone has a pen. Neither of the answers is right.",
      "Jotkin sanat näyttävät monikolta mutta ovat yksikköä: news, mathematics, information. The news is good.",
    ],
    contrasts: [
      { en: "There is a book on the desk.", fi: "Yksi asia." },
      { en: "There are two books on the desk.", fi: "Verbi seuraa todellista määrää, ei sanaa there." },
      { en: "The number of students is rising.", fi: "The number on yksikkö. A number of olisi monikko." },
    ],
    watch: [
      "there-lauseessa verbi katsoo seuraavaa substantiivia",
      "people on monikko: people are",
      "kieltomuodossa -s siirtyy apuverbiin: she doesn't like, ei she doesn't likes",
    ],
    mistakes: [
      { wrong: "She don't like coffee.", right: "She doesn't like coffee." },
      { wrong: "There is two mistakes.", right: "There are two mistakes." },
      { wrong: "The news are bad.", right: "The news is bad." },
    ],
  },
  {
    id: "pronouns",
    title: "Pronominit",
    eyebrow: "he / she / its / mine",
    summary: "Sukupuoli, omistus ja its-muodot. Suomen hän ei tee näitä eroja.",
    levels: "A1–B2",
    trap: "Suomen hän käy kaikista ihmisistä. Englannissa he, she ja it valitaan, ja its ei ole it's.",
    rules: [
      "he = mies tai poika, she = nainen tai tyttö, it = asia tai eläin, kun sukupuolta ei korosteta. They käy monikosta ja myös yhdestä ihmisestä, kun sukupuolta ei haluta sanoa.",
      "Omistus adjektiivina: my, your, his, her, its, our, their. Yksinään: mine, yours, his, hers, ours, theirs. A friend of mine.",
      "It's = it is. Its = sen. Refleksiivi, kun subjekti tekee teon itselleen: She taught herself. The children enjoyed themselves.",
    ],
    contrasts: [
      { en: "Anna lost her bag.", fi: "Laukku on Annan." },
      { en: "The bag is hers.", fi: "Hers seisoo yksin, ilman substantiivia." },
      { en: "The dog wagged its tail.", fi: "Its = sen. It's olisi it is." },
    ],
    watch: [
      "prepositionin jälkeen tulee objektimuoto: between you and me, ei between you and I",
      "its ei saa heittomerkkiä",
      "enjoy, hurt ja teach itseensä viitattaessa tarvitsevat refleksiivin",
    ],
    mistakes: [
      { wrong: "My sister said he is tired.", right: "My sister said she is tired." },
      { wrong: "The cat licked it's paw.", right: "The cat licked its paw." },
      { wrong: "This book is my.", right: "This book is mine." },
    ],
  },
  {
    id: "quantifiers",
    title: "Määräsanat",
    eyebrow: "much / many / some / any",
    summary: "Laskettavat ja ei-laskettavat sanat käyttävät eri määräilmaisuja.",
    levels: "A2–B2",
    trap: "Much ja many, little ja few sekä a few ja few riippuvat siitä, voiko asian laskea ja onko sävy myönteinen.",
    rules: [
      "Laskettava monikko: many, a few, few, fewer. Ei-laskettava: much, a little, little, less. How many apples? How much water?",
      "Some myönteisissä lauseissa ja tarjouksissa. Any kieltolauseissa ja useimmissa kysymyksissä: Would you like some tea? I don't have any milk.",
      "A few ja a little tarkoittavat pientä mutta riittävää määrää. Few ja little tarkoittavat, että määrä on harmillisen pieni.",
    ],
    contrasts: [
      { en: "I have a few friends here.", fi: "Minulla on joitakin ystäviä. Myönteinen." },
      { en: "I have few friends here.", fi: "Minulla ei juuri ole ystäviä. Kielteinen." },
      { en: "She gave me some advice.", fi: "Advice on ei-laskettava. Ei an advice eikä advices." },
    ],
    watch: [
      "advice, information, homework ja luggage ovat ei-laskettavia",
      "fewer people, ei less people, kun kyse on lukumäärästä",
      "too much työtä, too many tehtäviä",
    ],
    mistakes: [
      { wrong: "How many money do you have?", right: "How much money do you have?" },
      { wrong: "I need an advice.", right: "I need some advice." },
      { wrong: "There were less students today.", right: "There were fewer students today." },
    ],
  },
  {
    id: "comparison",
    title: "Vertailu",
    eyebrow: "-er / more / the best",
    summary: "Lyhyt adjektiivi taipuu. Pitkä saa more ja most. Good ja bad ovat epäsäännöllisiä.",
    levels: "A1–B2",
    trap: "Suomessa vertailu on säännöllisempi. Englannissa pitää tietää, tuleeko -er vai more, ja muistaa better, worse ja best.",
    rules: [
      "Yhden tavun adjektiivit: -er ja -est. Tall, taller, the tallest. Yksi vokaali ja yksi konsonantti kahdentuvat: big, bigger.",
      "Y-loppuiset: happy, happier, the happiest. Pitkät adjektiivit: more interesting, the most interesting.",
      "Epäsäännölliset: good, better, the best. Bad, worse, the worst. Vertailussa than. Yhtä suuri: as tall as.",
    ],
    contrasts: [
      { en: "This book is cheaper than that one.", fi: "Lyhyt adjektiivi, -er." },
      { en: "This book is more expensive than that one.", fi: "Pitkä adjektiivi, more." },
      { en: "She is as tall as her brother.", fi: "Yhtä pitkä, ei taller as." },
    ],
    watch: [
      "the kuuluu superlatiiviin: the best player, ei best player",
      "more better on liikaa. Pelkkä better riittää",
      "the sooner, the better on oma rakenteensa",
    ],
    mistakes: [
      { wrong: "He is more tall than me.", right: "He is taller than me." },
      { wrong: "This is the most cheap.", right: "This is the cheapest." },
      { wrong: "She is as taller as Anna.", right: "She is as tall as Anna." },
    ],
  },
  {
    id: "prepositions",
    title: "Prepositiot",
    eyebrow: "in / on / at",
    summary: "Aika, paikka ja verbin omat prepositiot opitaan pareina, ei sanakirjakäännöksinä.",
    levels: "A1–B2",
    trap: "Prepositiota ei voi päätellä suomesta. In, on ja at sekä verbin vaatima prepositio pitää muistaa yhdessä sanan kanssa.",
    rules: [
      "Aika: at kellonaika ja night, on viikonpäivä, in kuu, vuosi ja morning/afternoon/evening. At the weekend on brittienglantia.",
      "Paikka: at piste tai tapahtuma, on pinta, in suljettu tila tai maa ja kaupunki. Arrive in a city, arrive at a building.",
      "Verbit ja adjektiivit kuljettavat oman prepositionsa: good at, interested in, depend on, afraid of, married to.",
    ],
    contrasts: [
      { en: "The meeting is at 8 on Monday in May.", fi: "Kello at, päivä on, kuukausi in." },
      { en: "She goes to work by bus.", fi: "Kulkuneuvo: by bus, by car." },
      { en: "She goes to work on foot.", fi: "Kävely on poikkeus: on foot." },
    ],
    watch: [
      "at night, mutta in the morning",
      "amerikanenglannissa usein on the weekend",
      "listen to, look at, wait for",
    ],
    mistakes: [
      { wrong: "I am good in maths.", right: "I am good at maths." },
      { wrong: "We arrived to Paris.", right: "We arrived in Paris." },
      { wrong: "She is married with a doctor.", right: "She is married to a doctor." },
    ],
  },
  {
    id: "conditionals",
    title: "If-lauseet",
    eyebrow: "0 / 1 / 2 / 3",
    summary: "If-lauseen aikamuoto kertoo, onko asia fakta, tuleva mahdollisuus vai kuvitelma.",
    levels: "A2–B2",
    trap: "If-lauseeseen ei laiteta will-muotoa. Kuvitelma käyttää mennyttä muotoa, vaikka puhutaan nykyhetkestä.",
    rules: [
      "Nollakonditionaali on fakta: If you heat ice, it melts. Molemmat puolet present.",
      "Ykkönen on todellinen tulevaisuus: If it rains, I will stay home. If + present, päälause will.",
      "Kakkonen on epätodennäköinen tai kuvitteellinen nykyhetki: If I were you, I would take the bus. Kolmonen on mennyttä, jota ei voi muuttaa: If I had known, I would have called.",
    ],
    contrasts: [
      { en: "If she studies, she will pass.", fi: "Mahdollinen tulevaisuus." },
      { en: "If she studied, she would pass.", fi: "Hän ei opiskele. Tämä on kuvitelma." },
      { en: "Unless you hurry, you will be late.", fi: "Unless = if not." },
    ],
    watch: [
      "huolellisessa kielessä kuvitelman be on were: If I were rich",
      "I wish käyttäytyy kuin kakkonen: I wish I knew",
      "would ei tule if-lauseen sisään",
    ],
    mistakes: [
      { wrong: "If it will rain, I stay home.", right: "If it rains, I will stay home." },
      { wrong: "If I would be you, I would wait.", right: "If I were you, I would wait." },
      { wrong: "I wish I know the answer.", right: "I wish I knew the answer." },
    ],
  },
  {
    id: "modals",
    title: "Modaalit",
    eyebrow: "can / must / should",
    summary: "Kyky, pakko, kielto ja neuvo. Kielteiset muodot eivät ole toistensa peilikuvia.",
    levels: "A1–B2",
    trap: "Mustn't ja don't have to menevät helposti ristiin. Toinen kieltää, toinen sanoo ettei ole pakko.",
    rules: [
      "Can on taito tai mahdollisuus. Could on menneisyyden taito tai kohtelias pyyntö. Should on neuvo.",
      "Must ja have to ovat pakkoja. Mustn't on kielto. Don't have to tarkoittaa, että velvollisuutta ei ole.",
      "Päättely nykyhetkestä: must be (varmaankin on) ja can't be (ei voi olla). Katumus: should have + partisiippi.",
    ],
    contrasts: [
      { en: "You mustn't park here.", fi: "Pysäköinti on kielletty." },
      { en: "You don't have to park here.", fi: "Saat pysäköidä, mutta sinun ei ole pakko." },
      { en: "You should have revised.", fi: "Olisi pitänyt kerrata. Tilaisuutta ei enää ole." },
    ],
    watch: [
      "modaalinen verbi ei saa -s:ää: she can, ei she cans",
      "modaalisen jälkeen perusmuoto ilman to: can swim, ei can to swim. Have to on poikkeus, koska to kuuluu ilmaisuun",
      "must-päättely koskee nykyhetkeä. Mennyttä päättelyä ei tässä vielä sekoiteta siihen",
    ],
    mistakes: [
      { wrong: "She can to drive.", right: "She can drive." },
      { wrong: "You mustn't to shout.", right: "You mustn't shout." },
      { wrong: "He musts be at home.", right: "He must be at home." },
    ],
  },
  {
    id: "word-order",
    title: "Sanajärjestys",
    eyebrow: "kysymys ja adverbi",
    summary: "Kysymyksessä apuverbi tulee eteen. Epäsuorassa kysymyksessä järjestys palautuu väitelauseeksi.",
    levels: "A1–B2",
    trap: "Suomessa sanajärjestys joustaa. Englannissa kysymys tarvitsee apuverbin, ja adverbi istuu tiettyyn kohtaan.",
    rules: [
      "Yes/no-kysymys: apuverbi + subjekti + pääverbi. Does she live here? Did you see him? Pääverbi pysyy perusmuodossa.",
      "Kysymyssana tulee eteen: Where do you live? How long have you lived here?",
      "Epäsuora kysymys on väitelauseen järjestyksessä: Do you know where she lives? Ei where does she live. Taajuusadverbi asettuu pääverbin eteen: I never eat meat.",
    ],
    contrasts: [
      { en: "Where does he work?", fi: "Suora kysymys, apuverbi ennen subjektia." },
      { en: "I know where he works.", fi: "Epäsuora kysymys, ei does." },
      { en: "She speaks English very well.", fi: "Tapa ja aste tulevat usein lauseen loppuun, objektin jälkeen." },
    ],
    watch: [
      "never, often ja usually eivät tule suomen malliin minne tahansa",
      "be-verbin kanssa taajuusadverbi tulee perään: She is always late.",
      "kieltosana ei korvaa apuverbiä: I don't know, ei I not know",
    ],
    mistakes: [
      { wrong: "Where you live?", right: "Where do you live?" },
      { wrong: "Can you tell me where is the station?", right: "Can you tell me where the station is?" },
      { wrong: "She speaks very well English.", right: "She speaks English very well." },
    ],
  },
];

const byId = new Map(SKILLS.map((skill) => [skill.id, skill]));

export function getSkill(id: string): Skill | undefined {
  return byId.get(id as SkillId);
}

export function isSkillId(id: string): id is SkillId {
  return byId.has(id as SkillId);
}
