export interface BirthDetails {
  name: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  lat: number;
  lon: number;
  isSriLanka: boolean;
}

export interface PratyantarDasha {
  lord: string;
  start: string;
  end: string;
}

export interface AntarDasha {
  lord: string;
  start: string;
  end: string;
  pratyantardashas: PratyantarDasha[];
}

export interface MahaDasha {
  lord: string;
  years: number;
  start: string;
  end: string;
  antardashas: AntarDasha[];
}

export interface CharaKaraka {
  planet: string;
  degree: number;
  karaka: string;
  short: string;
}

export interface PlanetData {
  name: string;
  longitude: number;
  sign: number;
  degree: number;
  nakshatra: string;
  pada: number;
  nak_lord: string;
  dignity: string;
  house: number;
  is_retrograde: boolean;
  combust: boolean;
  combust_orb: number;
  avastha: string;
  d1: number;
  d2: number;
  d3: number;
  d4: number;
  d6: number;
  d7: number;
  d8: number;
  d9: number;
  d10: number;
  d11: number;
  d12: number;
  d16: number;
  d20: number;
  d24: number;
  d27: number;
  d30: number;
  d40: number;
  d45: number;
  d60: number;
}

export interface TransitPlanet {
  sign: number;
  degree: number;
  longitude: number;
  house: number;
  is_retrograde: boolean;
  nakshatra: string;
}

export interface Panchanga {
  tithi: { number: number; name: string; paksha: string; completion: number };
  nakshatra: { name: string; pada: number; lord: string };
  yoga: { number: number; name: string; completion: number };
  karana: { number: number; name: string; completion: number };
  vara: { number: number; name: string };
}

export interface YogaResult {
  name: string;
  planets: string[];
  effect: string;
  strength: number;
}

export interface ArudhaLagna {
  sign: number;
  sign_name: string;
  lagna_lord: string;
  exception_applied: string | null;
}

export interface SarvashtakavargaData {
  planets: Record<string, number[]>;
  sarva: number[];
}

export interface ChartResult {
  birth_info: BirthDetails & { time_offset: number };
  ayanamsa: number;
  ascendant: {
    sign: number;
    sign_name: string;
    longitude: number;
    degree: number;
    nakshatra: string;
    pada: number;
    nak_lord: string;
  };
  planets: Record<string, PlanetData>;
  panchanga: Panchanga;
  arudha_lagna: ArudhaLagna;
  yogas: YogaResult[];
  dashas: MahaDasha[];
  chara_karakas: CharaKaraka[];
  aspects: Record<string, number[]>;
  graha_yuddha: Array<{ p1: string; p2: string; winner: string; loser: string }>;
  sarvashtakavarga: SarvashtakavargaData;
  lagna: {
    d1: number;
    d2: number;
    d3: number;
    d4: number;
    d6: number;
    d7: number;
    d8: number;
    d9: number;
    d10: number;
    d11: number;
    d12: number;
    d16: number;
    d20: number;
    d24: number;
    d27: number;
    d30: number;
    d40: number;
    d45: number;
    d60: number;
    al: number;
  };
}
