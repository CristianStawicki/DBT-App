export type DBTModule = 'Uważność' | 'Tolerancja na stres' | 'Regulacja emocji' | 'Skuteczność interpersonalna';

export interface AIResponse {
  analysis: string;
  identifiedEmotions: string[];
  suggestedSkills: string[]; // IDs of skills from DBT_SKILLS
  advice: string;
}

export interface Skill {
  id: string;
  name: string;
  module: DBTModule;
  description: string;
  steps?: string[];
  tips?: string[];
}

export interface DailyLog {
  id: string;
  date: string;
  mood: number; // 1-5
  anxiety: number; // 1-5
  skillsUsed: string[];
  notes: string;
  aiFeedback?: AIResponse;
}

export const DBT_SKILLS: Skill[] = [
  {
    id: 'wise-mind',
    name: 'Mądry Umysł (Wise Mind)',
    module: 'Uważność',
    description: 'Równowaga między umysłem racjonalnym a emocjonalnym.',
    steps: [
      'Rozpoznaj swój umysł emocjonalny (uczucia, impulsy).',
      'Rozpoznaj swój umysł racjonalny (fakty, logika).',
      'Szukaj punktu środkowego, w którym oba się spotykają.',
      'Oddychaj głęboko i zapytaj siebie: „Czy to jest mądry umysł?”'
    ]
  },
  {
    id: 'tipp',
    name: 'Umiejętności TIPP',
    module: 'Tolerancja na stres',
    description: 'Szybka zmiana chemii ciała w celu zmniejszenia ekstremalnego stresu.',
    steps: [
      'Temperatura: Zimna woda na twarz.',
      'Intensywne ćwiczenia: 20 minut aktywności fizycznej.',
      'Paced Breathing: Spokojne oddychanie (5s wdech, 7s wydech).',
      'Paired Muscle Relaxation: Progresywna relaksacja mięśni.'
    ]
  },
  {
    id: 'stop',
    name: 'Umiejętność STOP',
    module: 'Tolerancja na stres',
    description: 'Unikaj impulsywnego działania pod wpływem silnych emocji.',
    steps: [
      'S - Stop (Zatrzymaj się): Nie ruszaj się, nie reaguj.',
      'T - Take a step back (Zrób krok w tył): Odsuń się od sytuacji.',
      'O - Observe (Obserwuj): Zauważ, co dzieje się w Tobie i wokół Ciebie.',
      'P - Proceed mindfully (Postępuj uważnie): Działaj z poziomu mądrego umysłu.'
    ]
  },
  {
    id: 'check-facts',
    name: 'Sprawdzanie faktów',
    module: 'Regulacja emocji',
    description: 'Sprawdź, czy Twoja emocja i jej intensywność pasują do rzeczywistych faktów.',
    steps: [
      'Jaką emocję czuję?',
      'Jakie wydarzenie ją wywołało?',
      'Czy poprawnie interpretuję to wydarzenie?',
      'Czy istnieje realne zagrożenie?'
    ]
  },
  {
    id: 'dear-man',
    name: 'DEAR MAN',
    module: 'Skuteczność interpersonalna',
    description: 'Umiejętność skutecznego proszenia o coś lub odmawiania.',
    steps: [
      'D - Describe (Opisz): Opisz sytuację obiektywnie.',
      'E - Express (Wyraź): Wyraź jasno swoje uczucia.',
      'A - Assert (Asertywność): Jasno poproś o to, czego potrzebujesz, lub powiedz „nie”.',
      'R - Reinforce (Wzmocnij): Wyjaśnij pozytywne konsekwencje.',
      'M - Mindful (Uważność): Skup się na swoim celu.',
      'A - Appear confident (Wyglądaj na pewnego siebie): Działaj pewnie.',
      'N - Negotiate (Negocjuj): Bądź gotów dać, aby otrzymać.'
    ]
  },
  {
    id: 'observe-describe-participate',
    name: 'Obserwuj, Opisz, Uczestnicz',
    module: 'Uważność',
    description: 'Podstawowe umiejętności „Co” w uważności.',
    steps: [
      'Obserwuj: Zauważaj doznania, myśli i uczucia bez ich nazywania.',
      'Opisz: Nazwij to, co zaobserwowałeś (np. „czuję ucisk w klatce piersiowej”).',
      'Uczestnicz: Całkowicie zaangażuj się w bieżącą czynność.'
    ]
  },
  {
    id: 'accepts',
    name: 'ACCEPTS',
    module: 'Tolerancja na stres',
    description: 'Odwracanie uwagi od bolesnych emocji.',
    steps: [
      'A - Activities (Aktywności): Zrób coś konstruktywnego.',
      'C - Contributing (Pomaganie): Zrób coś miłego dla kogoś innego.',
      'C - Comparisons (Porównania): Porównaj swoją sytuację z gorszą (ostrożnie!).',
      'E - Emotions (Emocje): Wywołaj inną emocję (np. obejrzyj komedię).',
      'P - Pushing away (Odpychanie): Odłóż problem na bok na chwilę.',
      'T - Thoughts (Myśli): Zajmij umysł czymś innym (np. licz od 100 w dół).',
      'S - Sensations (Doznania): Wywołaj silne doznania (np. trzymaj lód).'
    ]
  },
  {
    id: 'opposite-action',
    name: 'Działanie Przeciwne',
    module: 'Regulacja emocji',
    description: 'Działaj przeciwnie do impulsu emocjonalnego, gdy emocja nie pasuje do faktów.',
    steps: [
      'Zidentyfikuj emocję i impuls do działania.',
      'Sprawdź, czy impuls jest uzasadniony faktami.',
      'Jeśli nie, wykonaj działanie całkowicie przeciwne do impulsu.',
      'Kontynuuj działanie przeciwne, aż emocja osłabnie.'
    ]
  },
  {
    id: 'give',
    name: 'GIVE',
    module: 'Skuteczność interpersonalna',
    description: 'Utrzymywanie relacji i sprawianie, by inni nas lubili.',
    steps: [
      'G - Gentle (Bądź łagodny): Bez ataków, gróźb i oceniania.',
      'I - Interested (Okaż zainteresowanie): Słuchaj i nie przerywaj.',
      'V - Validate (Uprawomocnij): Pokaż, że rozumiesz uczucia drugiej osoby.',
      'E - Easy manner (Lekki styl): Uśmiechaj się, bądź swobodny.'
    ]
  },
  {
    id: 'fast',
    name: 'FAST',
    module: 'Skuteczność interpersonalna',
    description: 'Zachowanie szacunku do samego siebie w relacjach.',
    steps: [
      'F - Fair (Bądź sprawiedliwy): Dla siebie i dla innych.',
      'A - Apologies (Bez zbędnych przeprosin): Nie przepraszaj za to, że żyjesz lub masz zdanie.',
      'S - Stick to values (Trzymaj się wartości): Nie rezygnuj ze swoich zasad.',
      'T - Truthful (Bądź szczery): Nie kłam i nie wyolbrzymiaj.'
    ]
  }
];
