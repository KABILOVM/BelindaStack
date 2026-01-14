
export interface User {
  id: string;
  name: string;
  city: string;
  phone: string;
  password?: string;
  registeredAt: string;
  claimedPrizes: string[]; // Array of Prize IDs (titles)
  deliveryRequested: boolean;
}

export interface GameResult {
  id: string;
  userId: string;
  score: number;
  prize: string | null; // This represents the potential prize tier reached in that specific game
  playedAt: string;
  codeUsed: string;
}

export interface PromoCode {
  code: string;
  isUsed: boolean;
  isIssued?: boolean; // Track if code has been given to a player
  assignedTo?: string; // userId
  generatedAt: string;
}

export interface Screen {
  type: 'register' | 'code_entry' | 'game' | 'result' | 'admin';
}

export const CITIES = ['Душанбе', 'Худжанд', 'Куляб', 'Бохтар'];

export const PRIZES = {
  TIER_1: 'Карта «Ёвар»',
  TIER_2: 'Беспроводные наушники',
  
  // Tier 3 (30 Points)
  TIER_3_TV: 'Телевизор',
  TIER_3_WATCH: 'Смарт часы',
  TIER_3_COFFEE: 'Кофемашина',
  TIER_3_SPEAKER: 'Беспроводные колонки',
  TIER_3_HUMIDIFIER: 'Увлажнитель воздуха',

  // Tier 4 (50 Points)
  TIER_4_PHONE: 'Смартфон',
  TIER_4_TABLET: 'Планшет',
  TIER_4_BIKE: 'Велосипед',
  TIER_4_AC: 'Кондиционер',
  TIER_4_VACUUM: 'Пылесос',
  TIER_4_OVEN: 'Духовая печь',

  // Tier 5 (100 Points)
  TIER_5: 'Поездка в Грузию'
};

export const PRIZE_DETAILS = {
  [PRIZES.TIER_1]: {
    title: 'Карта «Ёвар»',
    description: 'Обязательный базовый приз. Карта лояльности со скидками в сети «Ёвар».',
    icon: 'card',
    isValuable: false
  },
  [PRIZES.TIER_2]: {
    title: 'Беспроводные наушники',
    description: 'Удобные наушники с отличным звучанием и долгим зарядом.',
    icon: 'headphones',
    isValuable: true
  },
  // --- TIER 3 ---
  [PRIZES.TIER_3_TV]: {
    title: 'Телевизор',
    description: 'Современный Smart TV с ярким экраном для любимых фильмов.',
    icon: 'tv',
    isValuable: true
  },
  [PRIZES.TIER_3_WATCH]: {
    title: 'Смарт часы',
    description: 'Умный гаджет для отслеживания активности и уведомлений.',
    icon: 'watch',
    isValuable: true
  },
  [PRIZES.TIER_3_COFFEE]: {
    title: 'Кофемашина',
    description: 'Для приготовления ароматного кофе каждое утро.',
    icon: 'coffee',
    isValuable: true
  },
  [PRIZES.TIER_3_SPEAKER]: {
    title: 'Беспроводные колонки',
    description: 'Портативная аудиосистема с мощным басом.',
    icon: 'speaker',
    isValuable: true
  },
  [PRIZES.TIER_3_HUMIDIFIER]: {
    title: 'Увлажнитель воздуха',
    description: 'Поддерживает комфортный климат в вашем доме.',
    icon: 'air',
    isValuable: true
  },
  // --- TIER 4 ---
  [PRIZES.TIER_4_PHONE]: {
    title: 'Смартфон',
    description: 'Современный смартфон с отличной камерой и быстрым процессором.',
    icon: 'phone',
    isValuable: true
  },
  [PRIZES.TIER_4_TABLET]: {
    title: 'Планшет',
    description: 'Удобный планшет для работы, учебы и развлечений.',
    icon: 'tablet',
    isValuable: true
  },
  [PRIZES.TIER_4_BIKE]: {
    title: 'Велосипед',
    description: 'Надежный велосипед для прогулок и активного отдыха.',
    icon: 'bike',
    isValuable: true
  },
  [PRIZES.TIER_4_AC]: {
    title: 'Кондиционер',
    description: 'Мощный кондиционер для прохлады летом и тепла зимой.',
    icon: 'ac',
    isValuable: true
  },
  [PRIZES.TIER_4_VACUUM]: {
    title: 'Пылесос',
    description: 'Современный пылесос для идеальной чистоты в доме.',
    icon: 'vacuum',
    isValuable: true
  },
  [PRIZES.TIER_4_OVEN]: {
    title: 'Духовая печь',
    description: 'Электрическая печь для выпечки и запекания блюд.',
    icon: 'oven',
    isValuable: true
  },
  // --- TIER 5 ---
  [PRIZES.TIER_5]: {
    title: 'Поездка в Грузию',
    description: 'Главный приз. Незабываемое путешествие: горы, море и гостеприимство.',
    icon: 'trip',
    isValuable: true
  }
};

export const THRESHOLDS = {
  TIER_1: 10,
  TIER_2: 20,
  // Tier 3
  TIER_3_TV: 30,
  TIER_3_WATCH: 30,
  TIER_3_COFFEE: 30,
  TIER_3_SPEAKER: 30,
  TIER_3_HUMIDIFIER: 30,
  // Tier 4
  TIER_4_PHONE: 50,
  TIER_4_TABLET: 50,
  TIER_4_BIKE: 50,
  TIER_4_AC: 50,
  TIER_4_VACUUM: 50,
  TIER_4_OVEN: 50,
  // Tier 5
  TIER_5: 100
};

export type ScreenType = 'register' | 'code_entry' | 'game' | 'result' | 'admin' | 'profile';
