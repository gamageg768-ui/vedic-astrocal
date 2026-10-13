import type { BirthDetails, PlanetData, Panchanga, YogaResult, ArudhaLagna, ChartResult } from './types';

const { julian, solar, moonposition, planetposition, nutation, deltat } = require('astronomia') as Record<string, unknown>;
const earthData = require('astronomia/data/vsop87Bearth').default as unknown;
const marsData = require('astronomia/data/vsop87Bmars').default as unknown;
const mercuryData = require('astronomia/data/vsop87Bmercury').default as unknown;
const jupiterData = require('astronomia/data/vsop87Bjupiter').default as unknown;
const venusData = require('astronomia/data/vsop87Bvenus').default as unknown;
const saturnData = require('astronomia/data/vsop87Bsaturn').default as unknown;

// ─── Sri Lanka historical timezone offsets ────────────────────────────────────
function getSriLankaOffset(year: number, month: number, day: number): number {
  const d = new Date(year, month - 1, day);
  if (year < 1880) return 5.323;
  if (d < new Date(1942, 0, 5)) return 5.5;
  if (d < new Date(1942, 8, 1)) return 6.0;
  if (d < new Date(1945, 9, 15)) return 6.5;
  if (d < new Date(1996, 4, 25)) return 5.5;
  if (d < new Date(1996, 9, 27)) return 6.5;
  if (d < new Date(2006, 3, 15)) return 6.0;
  return 5.5;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Moola', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

const NAKSHATRA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi',
  'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi',
  'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya',
];

const YOGA_NAMES = [
  'Vishkumbha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
  'Sukarma', 'Dhriti', 'Shoola', 'Ganda', 'Vriddhi', 'Dhruva',
  'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
  'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
  'Brahma', 'Indra', 'Vaidhriti',
];

const KARANA_MOVABLE = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti'];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SIGN_LORDS: Record<number, string> = {
  0: 'Mars', 1: 'Venus', 2: 'Mercury', 3: 'Moon', 4: 'Sun', 5: 'Mercury',
  6: 'Venus', 7: 'Mars', 8: 'Jupiter', 9: 'Saturn', 10: 'Saturn', 11: 'Jupiter',
};

const NATURAL_FRIENDS: Record<string, string[]> = {
  Sun: ['Moon', 'Mars', 'Jupiter'],
  Moon: ['Sun', 'Mercury'],
  Mars: ['Sun', 'Moon', 'Jupiter'],
  Mercury: ['Sun', 'Venus'],
  Jupiter: ['Sun', 'Moon', 'Mars'],
  Venus: ['Mercury', 'Saturn'],
  Saturn: ['Mercury', 'Venus'],
};

const NATURAL_ENEMIES: Record<string, string[]> = {
  Sun: ['Venus', 'Saturn'],
  Moon: ['None'],
  Mars: ['Mercury'],
  Mercury: ['Moon'],
  Jupiter: ['Mercury', 'Venus'],
  Venus: ['Sun', 'Moon'],
  Saturn: ['Sun', 'Moon', 'Mars'],
};

const DIGNITY_TABLE: Record<string, {
  exaltation: [number, number];
  debilitation: [number, number];
  moolatrikona: [number, number, number] | null;
  own_signs: number[];
}> = {
  Sun:     { exaltation: [0, 10],   debilitation: [6, 10],   moolatrikona: [4, 0, 20],   own_signs: [4] },
  Moon:    { exaltation: [1, 3],    debilitation: [7, 3],    moolatrikona: [1, 3, 30],   own_signs: [3] },
  Mars:    { exaltation: [9, 28],   debilitation: [3, 28],   moolatrikona: [0, 0, 12],   own_signs: [0, 7] },
  Mercury: { exaltation: [5, 15],   debilitation: [11, 15],  moolatrikona: [5, 16, 20],  own_signs: [2, 5] },
  Jupiter: { exaltation: [3, 5],    debilitation: [9, 5],    moolatrikona: [8, 0, 10],   own_signs: [8, 11] },
  Venus:   { exaltation: [11, 27],  debilitation: [5, 27],   moolatrikona: [6, 0, 15],   own_signs: [1, 6] },
  Saturn:  { exaltation: [6, 20],   debilitation: [0, 20],   moolatrikona: [10, 0, 20],  own_signs: [9, 10] },
  Rahu:    { exaltation: [1, 20],   debilitation: [7, 20],   moolatrikona: null,          own_signs: [10] },
  Ketu:    { exaltation: [7, 20],   debilitation: [1, 20],   moolatrikona: null,          own_signs: [7] },
};

const WATERY_SIGNS = [3, 7, 11];
const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

// ─── Ephemeris helpers ────────────────────────────────────────────────────────

function normalizeDeg(d: number): number {
  d = d % 360;
  return d < 0 ? d + 360 : d;
}

// Lahiri ayanamsa — At J1900 (JD 2415020.5) = 22°27'38" = 22.4606°, drift 50.2388475"/yr
function lahiriAyanamsa(jd: number): number {
  const t = (jd - 2415020.5) / 365.25;
  return normalizeDeg(22.4606 + 50.2388475 / 3600 * t);
}

// Geocentric ecliptic longitude of a planet using VSOP87B (ecliptic of date)
function planetGeocentricLon(
  pData: unknown, jde: number,
): { lon: number; lat: number; speed: number } {
  type PlanetCoord = { _ra: number; _dec: number; range: number };
  const PP = planetposition as { Planet: new (d: unknown) => { position: (jde: number) => PlanetCoord } };
  const earth = new PP.Planet(earthData);
  const planet = new PP.Planet(pData);

  const pPos = planet.position(jde);
  const ePos = earth.position(jde);

  const pL = pPos._ra, pB = pPos._dec, pR = pPos.range;
  const eL = ePos._ra, eB = ePos._dec, eR = ePos.range;

  const px = pR * Math.cos(pB) * Math.cos(pL);
  const py = pR * Math.cos(pB) * Math.sin(pL);
  const pz = pR * Math.sin(pB);

  const ex = eR * Math.cos(eB) * Math.cos(eL);
  const ey = eR * Math.cos(eB) * Math.sin(eL);
  const ez = eR * Math.sin(eB);

  const dx = px - ex, dy = py - ey, dz = pz - ez;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const [deltaPsi] = (nutation as { nutation: (jde: number) => [number, number] }).nutation(jde);
  const lon = normalizeDeg(Math.atan2(dy, dx) * DEG + deltaPsi * DEG);
  const lat = Math.asin(dz / dist) * DEG;

  // Speed via finite difference
  const dt = 0.005;
  const pPos2 = planet.position(jde + dt);
  const ePos2 = earth.position(jde + dt);
  const pL2 = pPos2._ra, pB2 = pPos2._dec, pR2 = pPos2.range;
  const eL2 = ePos2._ra, eB2 = ePos2._dec, eR2 = ePos2.range;
  const px2 = pR2 * Math.cos(pB2) * Math.cos(pL2);
  const py2 = pR2 * Math.cos(pB2) * Math.sin(pL2);
  const pz2 = pR2 * Math.sin(pB2);
  const ex2 = eR2 * Math.cos(eB2) * Math.cos(eL2);
  const ey2 = eR2 * Math.cos(eB2) * Math.sin(eL2);
  const ez2 = eR2 * Math.sin(eB2);
  const dx2 = px2 - ex2, dy2 = py2 - ey2;
  const [deltaPsi2] = (nutation as { nutation: (jde: number) => [number, number] }).nutation(jde + dt);
  const lon2 = normalizeDeg(Math.atan2(dy2, dx2) * DEG + deltaPsi2 * DEG);
  let speed = (lon2 - lon) / dt;
  if (speed > 180) speed -= 360;
  if (speed < -180) speed += 360;

  return { lon, lat, speed };
}

// Mean ascending node (Rahu) — from Meeus ch.22
function meanAscendingNode(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const omega = 125.0445479
    - 1934.1362608 * T
    + 0.0020754 * T * T
    + T * T * T / 467441.0
    - T * T * T * T / 60616000.0;
  return normalizeDeg(omega);
}

// Ascendant in tropical ecliptic degrees — Meeus Eq. 12.4 GMST + true obliquity
// jd  = Julian Day (UT): GMST is a UT quantity
// jde = Julian Ephemeris Day (TT): nutation coefficients need TT
function calcAscendant(jd: number, jde: number, lat: number, lon: number): number {
  // GMST (degrees) via Meeus Eq. 12.4 — valid for full JD including fractional day
  const D = jd - 2451545.0;
  const T = D / 36525.0;
  const gmst = normalizeDeg(
    280.46061837 + 360.98564736629 * D + 0.000387933 * T * T - T * T * T / 38710000
  );

  // Nutation at TT: [Δψ, Δε] in radians
  const [deltaPsi, deltaEps] = (nutation as { nutation: (jde: number) => [number, number] }).nutation(jde);

  // Mean obliquity (degrees), Meeus Eq. 22.2
  const meanObl = 23.439291111 - 0.013004167 * T - 0.0000001639 * T * T + 0.0000005036 * T * T * T;

  // True obliquity = mean + Δε (Δε in radians → degrees)
  const trueObl = meanObl + deltaEps * DEG;

  // Equation of equinoxes = Δψ·cos(ε): converts GMST → GAST
  const eqOfEq = deltaPsi * DEG * Math.cos(trueObl * RAD);

  const RAMC = normalizeDeg(gmst + eqOfEq + lon); // Local Apparent Sidereal Time

  const e = trueObl * RAD;
  const phi = lat * RAD;
  const ramcRad = RAMC * RAD;
  // tan(A) = -cos(θ) / (sin(ε)·tan(φ) + cos(ε)·sin(θ)), then rotate by 180°
  // The +180° shift maps the raw atan2 range to the correct ecliptic half:
  // verified at cardinal points: RAMC=0°→90°, 90°→180°, 180°→270°, 270°→0°
  const y = -Math.cos(ramcRad);
  const x = Math.sin(e) * Math.tan(phi) + Math.cos(e) * Math.sin(ramcRad);
  return normalizeDeg(Math.atan2(y, x) * DEG + 180);
}

// ─── Pure math helpers ───────────────────────────────────────────────────────

function normalizeLon(lon: number): number {
  lon = lon % 360;
  if (lon < 0) lon += 360;
  return lon;
}

function getSignAndDegree(lon: number): [number, number] {
  lon = normalizeLon(lon);
  return [Math.floor(lon / 30), lon % 30];
}

function calculateNakshatra(lon: number): [string, number, string] {
  lon = normalizeLon(lon);
  const NAK_SPAN = 40 / 3;
  let idx = Math.floor(lon / NAK_SPAN);
  if (idx > 26) idx = 26;
  const remainder = lon % NAK_SPAN;
  const pada = Math.floor(remainder / (NAK_SPAN / 4)) + 1;
  return [NAKSHATRAS[idx], pada, NAKSHATRA_LORDS[idx % 9]];
}

function calculateDignity(planet: string, signIdx: number, degree: number): string {
  const d = DIGNITY_TABLE[planet];
  if (!d) return 'Neutral';
  const [exSign, exDeg] = d.exaltation;
  if (signIdx === exSign) return Math.abs(degree - exDeg) < 1 ? 'Exalted (Deep)' : 'Exalted';
  const [debSign, debDeg] = d.debilitation;
  if (signIdx === debSign) return Math.abs(degree - debDeg) < 1 ? 'Debilitated (Deep)' : 'Debilitated';
  if (d.moolatrikona) {
    const [mtSign, mtStart, mtEnd] = d.moolatrikona;
    if (signIdx === mtSign && degree >= mtStart && degree <= mtEnd) return 'Moolatrikona';
  }
  if (d.own_signs.includes(signIdx)) return 'Own Sign';
  return 'Neutral';
}

function calculateDivisionalPosition(longitude: number, division: number): number {
  const [signIdx, degree] = getSignAndDegree(longitude);
  const isOdd = signIdx % 2 === 0;

  if (division === 1) return signIdx;

  if (division === 4) {
    // Each quarter advances 3 signs: own → 4th → 7th → 10th (cardinal cross)
    const part = Math.floor(degree / 7.5);
    return (signIdx + part * 3) % 12;
  }
  if (division === 7) {
    const part = Math.floor(degree / (30 / 7));
    const base = isOdd ? signIdx : (signIdx + 6) % 12;
    return (base + part) % 12;
  }
  if (division === 9) {
    const part = Math.floor(degree / (30 / 9));
    const MOVABLE = [0, 3, 6, 9];
    const FIXED   = [1, 4, 7, 10];
    const base = MOVABLE.includes(signIdx)
      ? signIdx
      : FIXED.includes(signIdx)
      ? (signIdx + 8) % 12
      : (signIdx + 4) % 12;
    return (base + part) % 12;
  }
  if (division === 10) {
    const part = Math.floor(degree / 3);
    const base = isOdd ? signIdx : (signIdx + 8) % 12;
    return (base + part) % 12;
  }
  if (division === 20) {
    // BPHS: Movable→Aries(0), Fixed→Sagittarius(8), Dual→Leo(4) — absolute bases
    const part = Math.floor(degree / 1.5);
    const MOVABLE = [0, 3, 6, 9];
    const FIXED   = [1, 4, 7, 10];
    const base = MOVABLE.includes(signIdx) ? 0 : FIXED.includes(signIdx) ? 8 : 4;
    return (base + part) % 12;
  }
  if (division === 27) {
    // Nakshatra-based: nak 1 (Ashwini)=Aries(0), nak 10 (Magha)=Leo(4), nak 19 (Moola)=Sagittarius(8)
    const part = Math.floor(degree / (30 / 27));
    const MOVABLE = [0, 3, 6, 9];
    const FIXED   = [1, 4, 7, 10];
    const base = MOVABLE.includes(signIdx) ? 0 : FIXED.includes(signIdx) ? 4 : 8;
    return (base + part) % 12;
  }
  if (division === 30) {
    // BPHS Trimshamsha: each planet uses its specific own-sign
    // Odd signs:  Mars→Aries(0), Saturn→Aquarius(10), Jupiter→Sagittarius(8), Mercury→Gemini(2), Venus→Libra(6)
    // Even signs: Venus→Taurus(1), Mercury→Virgo(5), Jupiter→Pisces(11), Saturn→Capricorn(9), Mars→Scorpio(7)
    if (isOdd) {
      if (degree < 5)  return 0;   // Mars → Aries
      if (degree < 10) return 10;  // Saturn → Aquarius
      if (degree < 18) return 8;   // Jupiter → Sagittarius
      if (degree < 25) return 2;   // Mercury → Gemini
      return 6;                    // Venus → Libra
    } else {
      if (degree < 5)  return 1;   // Venus → Taurus
      if (degree < 12) return 5;   // Mercury → Virgo
      if (degree < 20) return 11;  // Jupiter → Pisces
      if (degree < 25) return 9;   // Saturn → Capricorn
      return 7;                    // Mars → Scorpio
    }
  }

  // D2 — Hora: Varaha system — all signs Leo(4) for 0-15°, Cancer(3) for 15-30°
  if (division === 2) {
    return Math.floor(degree / 15) === 0 ? 4 : 3;
  }
  // D3 — Drekkana: absolute elemental — all signs in same element start from element's first sign
  if (division === 3) {
    const part = Math.floor(degree / 10);
    return (signIdx % 4 + part * 4) % 12;
  }
  // D6 — Shashthamsha: odd signs from Aries(0), even signs from Libra(6) — absolute per BPHS
  if (division === 6) {
    const part = Math.floor(degree / 5);
    const base = isOdd ? 0 : 6;
    return (base + part) % 12;
  }
  // D8 — Ashtamsha: Movable→Aries(0), Fixed→Sagittarius(8), Dual→Leo(4) — absolute per BPHS
  if (division === 8) {
    const part = Math.floor(degree / 3.75);
    const MOVABLE = [0, 3, 6, 9];
    const FIXED   = [1, 4, 7, 10];
    const base = MOVABLE.includes(signIdx) ? 0
      : FIXED.includes(signIdx) ? 8
      : 4;
    return (base + part) % 12;
  }
  // D11 — Ekadashamamsha: odd from sign, even from 3rd sign
  if (division === 11) {
    const part = Math.floor(degree / (30 / 11));
    const base = isOdd ? signIdx : (signIdx + 2) % 12;
    return (base + part) % 12;
  }
  // D12 — Dwadashamsha: uniform 2.5° segments starting from sign itself
  if (division === 12) {
    const part = Math.floor(degree / 2.5);
    return (signIdx + part) % 12;
  }
  // D16 — Shodashamsha: BPHS absolute bases — Movable→Aries(0), Fixed→Leo(4), Dual→Sagittarius(8)
  if (division === 16) {
    const part = Math.floor(degree / 1.875);
    const MOVABLE = [0, 3, 6, 9];
    const FIXED   = [1, 4, 7, 10];
    const base = MOVABLE.includes(signIdx) ? 0 : FIXED.includes(signIdx) ? 4 : 8;
    return (base + part) % 12;
  }
  // D24 — Siddhamsha: all signs from Leo(4)
  if (division === 24) {
    const part = Math.floor(degree / 1.25);
    return (4 + part) % 12;
  }
  // D40 — Khavedamsha: odd from sign, even from 4th sign
  if (division === 40) {
    const part = Math.floor(degree / 0.75);
    const base = isOdd ? signIdx : (signIdx + 3) % 12;
    return (base + part) % 12;
  }
  // D45 — Akshavedamsha: Movable→Aries(0), Fixed→Sagittarius(8), Dual→Leo(4) — absolute
  if (division === 45) {
    const part = Math.floor(degree / (30 / 45));
    const MOVABLE = [0, 3, 6, 9];
    const FIXED   = [1, 4, 7, 10];
    const base = MOVABLE.includes(signIdx) ? 0
      : FIXED.includes(signIdx) ? 8
      : 4;
    return (base + part) % 12;
  }
  // D60 — Shashtyamsha: odd signs from Aries(0), even signs from Libra(6) — absolute
  if (division === 60) {
    const part = Math.floor(degree / 0.5);
    const base = isOdd ? 0 : 6;
    return (base + part) % 12;
  }

  return signIdx;
}

function calculateTithi(sunLon: number, moonLon: number) {
  const elongation = ((moonLon - sunLon) % 360 + 360) % 360;
  let tithiNum = Math.floor(elongation / 12);
  if (tithiNum > 29) tithiNum = 29;
  const completion = ((elongation % 12) / 12) * 100;
  const paksha = tithiNum < 15 ? 'Shukla (Bright)' : 'Krishna (Dark)';
  let tithiName = TITHI_NAMES[Math.min(tithiNum % 15, 14)];
  if (tithiNum === 14) tithiName = 'Purnima (Full Moon)';
  if (tithiNum === 29) tithiName = 'Amavasya (New Moon)';
  return { number: tithiNum + 1, name: tithiName, paksha, completion: +completion.toFixed(2) };
}

function calculatePanchangaYoga(sunLon: number, moonLon: number) {
  const NAK_SPAN = 40 / 3;
  const total = ((sunLon + moonLon) % 360 + 360) % 360;
  let yogaNum = Math.floor(total / NAK_SPAN);
  if (yogaNum > 26) yogaNum = 26;
  const completion = ((total % NAK_SPAN) / NAK_SPAN) * 100;
  return { number: yogaNum + 1, name: YOGA_NAMES[yogaNum], completion: +completion.toFixed(2) };
}

function calculateKarana(sunLon: number, moonLon: number) {
  const elongation = ((moonLon - sunLon) % 360 + 360) % 360;
  const karanaNum = Math.floor(elongation / 6);
  const completion = ((elongation % 6) / 6) * 100;
  let karanaName: string;
  if (karanaNum === 0) karanaName = 'Kimstughna';
  else if (karanaNum <= 57) karanaName = KARANA_MOVABLE[(karanaNum - 1) % 7];
  else if (karanaNum === 58) karanaName = 'Shakuni';
  else if (karanaNum === 59) karanaName = 'Chatushpada';
  else karanaName = 'Naga';
  return { number: karanaNum + 1, name: karanaName, completion: +completion.toFixed(2) };
}

function calculateVara(jd: number) {
  const weekdayNum = Math.floor((jd + 1.5) % 7);
  return { number: weekdayNum + 1, name: WEEKDAYS[weekdayNum] };
}

function calculateArudhaLagna(
  ascSign: number,
  planets: Record<string, { sign: number }>
): ArudhaLagna {
  const lagnaLord = SIGN_LORDS[ascSign];
  const lordSign = planets[lagnaLord]?.sign ?? -1;
  if (lordSign < 0) {
    return { sign: -1, sign_name: 'Unknown', lagna_lord: lagnaLord, exception_applied: null };
  }
  const distance = ((lordSign - ascSign) % 12 + 12) % 12;
  const tentativeAL = (lordSign + distance) % 12;
  let finalAL = tentativeAL;
  let exception: string | null = null;
  if (tentativeAL === ascSign) {
    finalAL = (ascSign + 9) % 12;
    exception = 'AL in 1st -> moved to 10th';
  }
  const seventhHouse = (ascSign + 6) % 12;
  if (tentativeAL === seventhHouse) {
    finalAL = (ascSign + 3) % 12;
    exception = 'AL in 7th -> moved to 4th';
  }
  return {
    sign: finalAL,
    sign_name: SIGNS[finalAL],
    lagna_lord: lagnaLord,
    exception_applied: exception,
  };
}

function getConjunctions(
  planetName: string,
  planetSign: number,
  planets: Record<string, { sign: number }>
): string[] {
  return Object.entries(planets)
    .filter(([n, d]) => n !== planetName && d.sign === planetSign)
    .map(([n]) => n);
}

function getAspectingPlanets(
  targetSign: number,
  planets: Record<string, { sign: number }>
): string[] {
  const result = new Set<string>();
  for (const [name, data] of Object.entries(planets)) {
    const s = data.sign;
    if ((s + 6) % 12 === targetSign) result.add(name);
    if (name === 'Mars' && ((s + 3) % 12 === targetSign || (s + 7) % 12 === targetSign)) result.add(name);
    if (name === 'Jupiter' && ((s + 4) % 12 === targetSign || (s + 8) % 12 === targetSign)) result.add(name);
    if (name === 'Saturn' && ((s + 2) % 12 === targetSign || (s + 9) % 12 === targetSign)) result.add(name);
  }
  return Array.from(result);
}

function isFriend(p1: string, p2: string): boolean {
  return NATURAL_FRIENDS[p1]?.includes(p2) ?? false;
}

function isEnemy(p1: string, p2: string): boolean {
  return NATURAL_ENEMIES[p1]?.includes(p2) ?? false;
}

function calculateAvastha(
  planetName: string,
  planet: { sign: number; house: number; dignity: string },
  allPlanets: Record<string, { sign: number; house: number; dignity: string }>
): string {
  const conj = getConjunctions(planetName, planet.sign, allPlanets);
  const asp = getAspectingPlanets(planet.sign, allPlanets);
  const avasthas: string[] = [];
  const signLord = SIGN_LORDS[planet.sign];

  if (
    planet.house === 5 &&
    ['Rahu', 'Ketu', 'Sun', 'Saturn', 'Mars'].some((p) => conj.includes(p))
  )
    avasthas.push('Lajjita');

  if (planet.dignity.includes('Exalted') || planet.dignity.includes('Moolatrikona'))
    avasthas.push('Garvita');

  if (
    isEnemy(planetName, signLord) ||
    conj.some((p) => isEnemy(planetName, p)) ||
    asp.some((p) => isEnemy(planetName, p)) ||
    conj.includes('Saturn')
  )
    avasthas.push('Kshudhita');

  if (
    WATERY_SIGNS.includes(planet.sign) &&
    asp.some((p) => ['Mars', 'Saturn', 'Rahu', 'Ketu'].includes(p)) &&
    !asp.some((p) => ['Jupiter', 'Venus', 'Moon'].includes(p))
  )
    avasthas.push('Trushita');

  if (
    isFriend(planetName, signLord) ||
    conj.some((p) => isFriend(planetName, p)) ||
    asp.some((p) => isFriend(planetName, p)) ||
    conj.includes('Jupiter')
  )
    avasthas.push('Mudita');

  if (
    conj.includes('Sun') &&
    (asp.some((p) => ['Mars', 'Saturn', 'Rahu', 'Ketu'].includes(p)) ||
      asp.some((p) => isEnemy(planetName, p)))
  )
    avasthas.push('Kshobhita');

  const priority = ['Lajjita', 'Kshudhita', 'Kshobhita', 'Trushita', 'Garvita', 'Mudita'];
  return priority.find((a) => avasthas.includes(a)) ?? 'Neutral';
}

function dignityStrength(dignity: string): number {
  if (dignity.includes('Exalted')) return 5;
  if (dignity === 'Own Sign' || dignity === 'Moolatrikona') return 4;
  if (dignity === 'Neutral') return 2;
  if (dignity.includes('Debilitated')) return 1;
  return 2;
}

function yogaStrength(
  involvedPlanets: string[],
  planets: Record<string, { sign: number; house: number; dignity: string }>
): number {
  if (!involvedPlanets.length) return 3;
  const avg = involvedPlanets.reduce((s, p) => s + (planets[p] ? dignityStrength(planets[p].dignity) : 2), 0) / involvedPlanets.length;
  return Math.round(Math.max(1, Math.min(5, avg)));
}

function detectYogas(
  planets: Record<string, { sign: number; house: number; dignity: string }>,
  ascSign: number
): YogaResult[] {
  void ascSign;
  const yogas: YogaResult[] = [];
  const ph = (n: string) => planets[n]?.house;
  const ps = (n: string) => planets[n]?.sign;

  if (planets.Jupiter && planets.Moon) {
    const diff = Math.abs(ph('Jupiter')! - ph('Moon')!);
    if ([0, 3, 6, 9].includes(diff)) {
      const ps2 = ['Jupiter', 'Moon'];
      yogas.push({ name: 'Gajakesari Yoga', planets: ps2, effect: 'Intelligence, wealth, fame, virtuous character', strength: yogaStrength(ps2, planets) });
    }
  }

  if (planets.Sun && planets.Mercury && ps('Sun') === ps('Mercury')) {
    const ps2 = ['Sun', 'Mercury'];
    yogas.push({ name: 'Budhaditya Yoga', planets: ps2, effect: 'Sharp intellect, communication skills, academic success', strength: yogaStrength(ps2, planets) });
  }

  const pmTable: Record<string, [string, string]> = {
    Mars: ['Ruchaka Yoga', 'Courage, military prowess, leadership'],
    Mercury: ['Bhadra Yoga', 'Intelligence, business acumen, eloquence'],
    Jupiter: ['Hamsa Yoga', 'Righteousness, wisdom, prosperity'],
    Venus: ['Malavya Yoga', 'Beauty, luxury, artistic talents'],
    Saturn: ['Shasha Yoga', 'Discipline, authority, longevity'],
  };
  for (const [name, [yogaName, effect]] of Object.entries(pmTable)) {
    if (
      planets[name] &&
      [1, 4, 7, 10].includes(ph(name)!) &&
      (planets[name].dignity.includes('Exalted') || planets[name].dignity === 'Own Sign')
    )
      yogas.push({ name: `${yogaName} (Pancha Mahapurusha)`, planets: [name], effect, strength: yogaStrength([name], planets) });
  }

  if (planets.Moon && planets.Mars && ps('Moon') === ps('Mars')) {
    const ps2 = ['Moon', 'Mars'];
    yogas.push({ name: 'Chandra Mangala Yoga', planets: ps2, effect: 'Wealth through effort, business success', strength: yogaStrength(ps2, planets) });
  }

  if (planets.Jupiter && planets.Mars && ps('Jupiter') === ps('Mars')) {
    const ps2 = ['Jupiter', 'Mars'];
    yogas.push({ name: 'Guru Mangala Yoga', planets: ps2, effect: 'Technical skills, engineering abilities', strength: yogaStrength(ps2, planets) });
  }

  return yogas;
}

// ─── Combustion ───────────────────────────────────────────────────────────────

const COMBUST_ORBS: Record<string, number> = {
  Moon: 12, Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15,
};

function calcCombustion(planetLon: number, sunLon: number, name: string, isRetro: boolean): { combust: boolean; orb: number } {
  const baseOrb = COMBUST_ORBS[name];
  if (baseOrb === undefined) return { combust: false, orb: 0 };
  const effectiveOrb = isRetro && (name === 'Mercury' || name === 'Venus') ? baseOrb - 2 : baseOrb;
  const diff = Math.abs(((planetLon - sunLon + 540) % 360) - 180);
  return { combust: diff <= effectiveOrb, orb: +diff.toFixed(2) };
}

// ─── Graha Yuddha ─────────────────────────────────────────────────────────────

function detectGrahaYuddha(planets: Record<string, import('./types').PlanetData>): Array<{ p1: string; p2: string; winner: string; loser: string }> {
  const WAR_PLANETS = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const STRENGTH: Record<string, number> = { Venus: 5, Jupiter: 4, Mercury: 3, Mars: 2, Saturn: 1 };
  const results: Array<{ p1: string; p2: string; winner: string; loser: string }> = [];
  for (let i = 0; i < WAR_PLANETS.length; i++) {
    for (let j = i + 1; j < WAR_PLANETS.length; j++) {
      const n1 = WAR_PLANETS[i], n2 = WAR_PLANETS[j];
      const p1 = planets[n1], p2 = planets[n2];
      if (!p1 || !p2) continue;
      const diff = Math.abs(((p1.longitude - p2.longitude + 540) % 360) - 180);
      if (diff <= 1) {
        const winner = (STRENGTH[n1] ?? 0) >= (STRENGTH[n2] ?? 0) ? n1 : n2;
        results.push({ p1: n1, p2: n2, winner, loser: winner === n1 ? n2 : n1 });
      }
    }
  }
  return results;
}

// ─── Graha Drishti (Aspects) ──────────────────────────────────────────────────

function calculateAspects(planets: Record<string, import('./types').PlanetData>): Record<string, number[]> {
  const EXTRA_OFFSETS: Record<string, number[]> = {
    Mars: [3, 7], Jupiter: [4, 8], Saturn: [2, 9],
    Rahu: [4, 8], Ketu: [4, 8],
  };
  const result: Record<string, number[]> = {};
  for (const [name, p] of Object.entries(planets)) {
    const h = p.house;
    const houses = new Set<number>();
    houses.add(((h - 1 + 6) % 12) + 1);
    for (const off of (EXTRA_OFFSETS[name] ?? [])) houses.add(((h - 1 + off) % 12) + 1);
    result[name] = Array.from(houses).sort((a, b) => a - b);
  }
  return result;
}

// ─── Chara Karakas ────────────────────────────────────────────────────────────

const KARAKA_NAMES = ['Atmakaraka', 'Amatyakaraka', 'Bhratrukaraka', 'Matrukaraka', 'Putrakaraka', 'Gnatikaraka', 'Darakaraka'];
const KARAKA_SHORT = ['AK', 'AmK', 'BK', 'MK', 'PK', 'GK', 'DK'];

function calculateCharaKarakas(planets: Record<string, import('./types').PlanetData>): import('./types').CharaKaraka[] {
  return ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']
    .filter(n => planets[n])
    .map(n => ({ name: n, degree: planets[n].degree }))
    .sort((a, b) => b.degree - a.degree)
    .map((p, i) => ({ planet: p.name, degree: p.degree, karaka: KARAKA_NAMES[i] ?? '', short: KARAKA_SHORT[i] ?? '' }));
}

// ─── Sarvashtakavarga ─────────────────────────────────────────────────────────

const AVP: Record<string, Record<string, number[]>> = {
  Sun: {
    Sun:     [1,2,4,7,8,9,10,11],
    Moon:    [3,6,10,11],
    Mars:    [1,2,4,7,8,9,10,11],
    Mercury: [3,5,6,9,10,11,12],
    Jupiter: [5,6,9,11],
    Venus:   [6,7,12],
    Saturn:  [1,2,4,7,8,10,11],
    Lagna:   [3,4,6,10,11,12],
  },
  Moon: {
    Sun:     [3,6,7,8,10,11],
    Moon:    [1,3,6,7,10,11],
    Mars:    [2,3,5,6,9,10,11],
    Mercury: [1,3,4,5,7,8,10,11],
    Jupiter: [1,4,7,8,10,11,12],
    Venus:   [3,4,5,7,9,10,11],
    Saturn:  [3,5,6,11],
    Lagna:   [3,6,10,11],
  },
  Mars: {
    Sun:     [3,5,6,10,11],
    Moon:    [3,6,11],
    Mars:    [1,2,4,7,8,10,11],
    Mercury: [3,5,6,11],
    Jupiter: [6,10,11,12],
    Venus:   [6,8,11,12],
    Saturn:  [1,4,7,8,9,10,11],
    Lagna:   [1,4,6,8,10,11],
  },
  Mercury: {
    Sun:     [5,6,9,11,12],
    Moon:    [2,4,6,8,10,11],
    Mars:    [1,2,4,7,8,9,10,11],
    Mercury: [1,3,5,6,9,10,11,12],
    Jupiter: [6,8,11,12],
    Venus:   [1,2,3,4,5,8,9,11],
    Saturn:  [1,2,4,7,8,9,10,11],
    Lagna:   [1,2,4,6,8,10,11],
  },
  Jupiter: {
    Sun:     [1,2,3,4,7,8,9,10,11],
    Moon:    [2,5,7,9,11],
    Mars:    [1,2,4,7,8,10,11],
    Mercury: [1,2,4,5,6,9,10,11],
    Jupiter: [1,2,3,4,7,8,10,11],
    Venus:   [2,5,6,9,10,11],
    Saturn:  [3,5,6,12],
    Lagna:   [1,2,4,5,6,7,9,10,11],
  },
  Venus: {
    Sun:     [8,11,12],
    Moon:    [1,2,3,4,5,8,9,11,12],
    Mars:    [3,4,6,9,11,12],
    Mercury: [3,5,6,9,11],
    Jupiter: [5,8,9,10,11],
    Venus:   [1,2,3,4,5,8,9,10,11],
    Saturn:  [3,4,5,8,9,10,11],
    Lagna:   [1,2,3,4,5,8,9,11],
  },
  Saturn: {
    Sun:     [1,2,4,7,8,10,11],
    Moon:    [3,6,11],
    Mars:    [3,5,6,10,11,12],
    Mercury: [6,8,9,10,11,12],
    Jupiter: [5,6,11,12],
    Venus:   [6,11,12],
    Saturn:  [3,5,6,11],
    Lagna:   [1,3,4,6,10,11],
  },
};

function calculateSarvashtakavarga(
  planets: Record<string, { sign: number }>,
  lagnaSign: number
): import('./types').SarvashtakavargaData {
  const REFS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const SCORED = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const sarva = new Array(12).fill(0) as number[];
  const planetScores: Record<string, number[]> = {};

  for (const planet of SCORED) {
    const scores = new Array(12).fill(0) as number[];
    const table = AVP[planet];
    for (const ref of REFS) {
      const refSign = planets[ref]?.sign ?? 0;
      for (const pos of (table[ref] ?? [])) scores[(refSign + pos - 1) % 12]++;
    }
    for (const pos of (table['Lagna'] ?? [])) scores[(lagnaSign + pos - 1) % 12]++;
    planetScores[planet] = scores;
    for (let i = 0; i < 12; i++) sarva[i] += scores[i];
  }

  return { planets: planetScores, sarva };
}

// ─── Vimshottari Dasha ────────────────────────────────────────────────────────

const DASHA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const DASHA_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

function addYearsMs(date: Date, years: number): Date {
  return new Date(date.getTime() + years * 365.25 * 24 * 3600 * 1000);
}

function toDateStr(d: Date): string { return d.toISOString().split('T')[0]; }

function calculateVimshottariDasha(
  moonSiderealLon: number,
  year: number, month: number, day: number, hour: number, minute: number
): import('./types').MahaDasha[] {
  const NAK_SPAN = 360 / 27;
  const nakIdx = Math.floor(moonSiderealLon / NAK_SPAN);
  const frac = (moonSiderealLon - nakIdx * NAK_SPAN) / NAK_SPAN;
  const lordIdx = nakIdx % 9;
  const birthLord = DASHA_LORDS[lordIdx];
  const yearsElapsed = frac * DASHA_YEARS[birthLord];

  const birthDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  let cursor = new Date(birthDate.getTime() - yearsElapsed * 365.25 * 24 * 3600 * 1000);

  return Array.from({ length: 9 }, (_, i) => {
    const li = (lordIdx + i) % 9;
    const lord = DASHA_LORDS[li];
    const years = DASHA_YEARS[lord];
    const start = new Date(cursor);
    const end = addYearsMs(start, years);

    let adCursor = new Date(start);
    const antardashas = Array.from({ length: 9 }, (__, j) => {
      const adLord = DASHA_LORDS[(li + j) % 9];
      const adYears = (years * DASHA_YEARS[adLord]) / 120;
      const adStart = new Date(adCursor);
      const adEnd = addYearsMs(adStart, adYears);
      adCursor = adEnd;
      let pdCursor = new Date(adStart);
      const pratyantardashas = Array.from({ length: 9 }, (___, k) => {
        const pdLord = DASHA_LORDS[(li + j + k) % 9];
        const pdYears = (adYears * DASHA_YEARS[pdLord]) / 120;
        const pdStart = new Date(pdCursor);
        const pdEnd = addYearsMs(pdStart, pdYears);
        pdCursor = pdEnd;
        return { lord: pdLord, start: toDateStr(pdStart), end: toDateStr(pdEnd) };
      });
      return { lord: adLord, start: toDateStr(adStart), end: toDateStr(adEnd), pratyantardashas };
    });

    cursor = end;
    return { lord, years, start: toDateStr(start), end: toDateStr(end), antardashas };
  });
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function calculateChart(input: BirthDetails): ChartResult {
  const offset = input.isSriLanka
    ? getSriLankaOffset(input.year, input.month, input.day)
    : 0;

  const decimalHour = input.hour + input.minute / 60 - offset;

  // Julian Day (UT)
  const jd: number = (julian as { CalendarGregorianToJD: (y: number, m: number, d: number) => number })
    .CalendarGregorianToJD(input.year, input.month, input.day + decimalHour / 24);

  // Julian Ephemeris Day (TT = UT + ΔT) — required by all planetary functions
  const decimalYear = input.year + (input.month - 1) / 12 + (input.day - 1) / 365.25;
  const jde = jd + (deltat as { deltaT: (y: number) => number }).deltaT(decimalYear) / 86400;

  const ayanamsa = lahiriAyanamsa(jd);

  // Ascendant (jd=UT for GMST, jde=TT for nutation — both used correctly inside)
  const ascTropical = calcAscendant(jd, jde, input.lat, input.lon);
  const ascSidereal = normalizeLon(ascTropical - ayanamsa);
  const [ascSign, ascDegree] = getSignAndDegree(ascSidereal);
  const [ascNak, ascPada, ascNakLord] = calculateNakshatra(ascSidereal);

  // Sun — VSOP87 apparent geocentric ecliptic longitude (includes nutation + aberration)
  const PP_earth = planetposition as { Planet: new (d: unknown) => unknown };
  const earthPlanet = new PP_earth.Planet(earthData);
  const sunPos = (solar as { apparentVSOP87: (p: unknown, jde: number) => { lon: number } })
    .apparentVSOP87(earthPlanet, jde);
  const sunTrop = normalizeDeg(sunPos.lon * DEG);
  const sunSidereal = normalizeLon(sunTrop - ayanamsa);

  // Moon (geocentric ecliptic from ELP2000) — add nutation in longitude
  type MoonCoord = { _ra: number; _dec: number; range: number };
  const moonPos = (moonposition as { position: (jde: number) => MoonCoord }).position(jde);
  const [deltaPsiMoon] = (nutation as { nutation: (jde: number) => [number, number] }).nutation(jde);
  const moonTrop = normalizeDeg((moonPos._ra + deltaPsiMoon) * DEG);
  const moonSidereal = normalizeLon(moonTrop - ayanamsa);

  // Sun speed (finite diff using VSOP87)
  const sunPos2 = (solar as { apparentVSOP87: (p: unknown, jde: number) => { lon: number } })
    .apparentVSOP87(earthPlanet, jde + 0.005);
  let sunSpeed = (normalizeDeg(sunPos2.lon * DEG) - sunTrop) / 0.005;
  if (sunSpeed > 180) sunSpeed -= 360;

  // Moon speed (finite diff)
  const moonPos2 = (moonposition as { position: (jde: number) => MoonCoord }).position(jde + 0.005);
  const [deltaPsiMoon2] = (nutation as { nutation: (jde: number) => [number, number] }).nutation(jde + 0.005);
  const moonTrop2 = normalizeDeg((moonPos2._ra + deltaPsiMoon2) * DEG);
  let moonSpeed = (moonTrop2 - moonTrop) / 0.005;
  if (moonSpeed > 180) moonSpeed -= 360;
  if (moonSpeed < -180) moonSpeed += 360;

  // Other planets via VSOP87B
  const outerPlanets: Record<string, { data: unknown }> = {
    Mars: { data: marsData },
    Mercury: { data: mercuryData },
    Jupiter: { data: jupiterData },
    Venus: { data: venusData },
    Saturn: { data: saturnData },
  };

  const planetsData: Record<string, PlanetData> = {};

  // Sun
  {
    const siderealLon = sunSidereal;
    const [sign, degree] = getSignAndDegree(siderealLon);
    const [nak, pada, nakLord] = calculateNakshatra(siderealLon);
    const house = ((sign - ascSign + 12) % 12) + 1;
    planetsData['Sun'] = {
      name: 'Sun', longitude: siderealLon, sign, degree, nakshatra: nak, pada,
      nak_lord: nakLord, dignity: calculateDignity('Sun', sign, degree), house,
      is_retrograde: false, combust: false, combust_orb: 0, avastha: 'Neutral',
      d1: sign,
      d2: calculateDivisionalPosition(siderealLon, 2),
      d3: calculateDivisionalPosition(siderealLon, 3),
      d4: calculateDivisionalPosition(siderealLon, 4),
      d6: calculateDivisionalPosition(siderealLon, 6),
      d7: calculateDivisionalPosition(siderealLon, 7),
      d8: calculateDivisionalPosition(siderealLon, 8),
      d9: calculateDivisionalPosition(siderealLon, 9),
      d10: calculateDivisionalPosition(siderealLon, 10),
      d11: calculateDivisionalPosition(siderealLon, 11),
      d12: calculateDivisionalPosition(siderealLon, 12),
      d16: calculateDivisionalPosition(siderealLon, 16),
      d20: calculateDivisionalPosition(siderealLon, 20),
      d24: calculateDivisionalPosition(siderealLon, 24),
      d27: calculateDivisionalPosition(siderealLon, 27),
      d30: calculateDivisionalPosition(siderealLon, 30),
      d40: calculateDivisionalPosition(siderealLon, 40),
      d45: calculateDivisionalPosition(siderealLon, 45),
      d60: calculateDivisionalPosition(siderealLon, 60),
    };
    void sunSpeed;
  }

  // Moon
  {
    const siderealLon = moonSidereal;
    const [sign, degree] = getSignAndDegree(siderealLon);
    const [nak, pada, nakLord] = calculateNakshatra(siderealLon);
    const house = ((sign - ascSign + 12) % 12) + 1;
    planetsData['Moon'] = {
      name: 'Moon', longitude: siderealLon, sign, degree, nakshatra: nak, pada,
      nak_lord: nakLord, dignity: calculateDignity('Moon', sign, degree), house,
      is_retrograde: false, combust: false, combust_orb: 0, avastha: 'Neutral',
      d1: sign,
      d2: calculateDivisionalPosition(siderealLon, 2),
      d3: calculateDivisionalPosition(siderealLon, 3),
      d4: calculateDivisionalPosition(siderealLon, 4),
      d6: calculateDivisionalPosition(siderealLon, 6),
      d7: calculateDivisionalPosition(siderealLon, 7),
      d8: calculateDivisionalPosition(siderealLon, 8),
      d9: calculateDivisionalPosition(siderealLon, 9),
      d10: calculateDivisionalPosition(siderealLon, 10),
      d11: calculateDivisionalPosition(siderealLon, 11),
      d12: calculateDivisionalPosition(siderealLon, 12),
      d16: calculateDivisionalPosition(siderealLon, 16),
      d20: calculateDivisionalPosition(siderealLon, 20),
      d24: calculateDivisionalPosition(siderealLon, 24),
      d27: calculateDivisionalPosition(siderealLon, 27),
      d30: calculateDivisionalPosition(siderealLon, 30),
      d40: calculateDivisionalPosition(siderealLon, 40),
      d45: calculateDivisionalPosition(siderealLon, 45),
      d60: calculateDivisionalPosition(siderealLon, 60),
    };
    void moonSpeed;
  }

  // Outer/inner planets
  for (const [name, { data }] of Object.entries(outerPlanets)) {
    const { lon: tropLon, speed } = planetGeocentricLon(data, jde);
    const siderealLon = normalizeLon(tropLon - ayanamsa);
    const [sign, degree] = getSignAndDegree(siderealLon);
    const [nak, pada, nakLord] = calculateNakshatra(siderealLon);
    const house = ((sign - ascSign + 12) % 12) + 1;
    planetsData[name] = {
      name, longitude: siderealLon, sign, degree, nakshatra: nak, pada,
      nak_lord: nakLord, dignity: calculateDignity(name, sign, degree), house,
      is_retrograde: speed < 0, combust: false, combust_orb: 0, avastha: 'Neutral',
      d1: sign,
      d2: calculateDivisionalPosition(siderealLon, 2),
      d3: calculateDivisionalPosition(siderealLon, 3),
      d4: calculateDivisionalPosition(siderealLon, 4),
      d6: calculateDivisionalPosition(siderealLon, 6),
      d7: calculateDivisionalPosition(siderealLon, 7),
      d8: calculateDivisionalPosition(siderealLon, 8),
      d9: calculateDivisionalPosition(siderealLon, 9),
      d10: calculateDivisionalPosition(siderealLon, 10),
      d11: calculateDivisionalPosition(siderealLon, 11),
      d12: calculateDivisionalPosition(siderealLon, 12),
      d16: calculateDivisionalPosition(siderealLon, 16),
      d20: calculateDivisionalPosition(siderealLon, 20),
      d24: calculateDivisionalPosition(siderealLon, 24),
      d27: calculateDivisionalPosition(siderealLon, 27),
      d30: calculateDivisionalPosition(siderealLon, 30),
      d40: calculateDivisionalPosition(siderealLon, 40),
      d45: calculateDivisionalPosition(siderealLon, 45),
      d60: calculateDivisionalPosition(siderealLon, 60),
    };
  }

  // Rahu & Ketu (mean node — uses TT/JDE per Meeus)
  const rahuTrop = meanAscendingNode(jde);
  const rahuSidereal = normalizeLon(rahuTrop - ayanamsa);
  const ketuSidereal = normalizeLon(rahuSidereal + 180);

  for (const [name, lon] of [['Rahu', rahuSidereal], ['Ketu', ketuSidereal]] as [string, number][]) {
    const [sign, degree] = getSignAndDegree(lon);
    const [nak, pada, nakLord] = calculateNakshatra(lon);
    const house = ((sign - ascSign + 12) % 12) + 1;
    planetsData[name] = {
      name, longitude: lon, sign, degree, nakshatra: nak, pada,
      nak_lord: nakLord, dignity: calculateDignity(name, sign, degree), house,
      is_retrograde: true, combust: false, combust_orb: 0, avastha: 'Neutral',
      d1: sign,
      d2: calculateDivisionalPosition(lon, 2),
      d3: calculateDivisionalPosition(lon, 3),
      d4: calculateDivisionalPosition(lon, 4),
      d6: calculateDivisionalPosition(lon, 6),
      d7: calculateDivisionalPosition(lon, 7),
      d8: calculateDivisionalPosition(lon, 8),
      d9: calculateDivisionalPosition(lon, 9),
      d10: calculateDivisionalPosition(lon, 10),
      d11: calculateDivisionalPosition(lon, 11),
      d12: calculateDivisionalPosition(lon, 12),
      d16: calculateDivisionalPosition(lon, 16),
      d20: calculateDivisionalPosition(lon, 20),
      d24: calculateDivisionalPosition(lon, 24),
      d27: calculateDivisionalPosition(lon, 27),
      d30: calculateDivisionalPosition(lon, 30),
      d40: calculateDivisionalPosition(lon, 40),
      d45: calculateDivisionalPosition(lon, 45),
      d60: calculateDivisionalPosition(lon, 60),
    };
  }

  // Combustion (post-processing — Sun must be built first)
  const sunLon = planetsData.Sun.longitude;
  const moonLon = planetsData.Moon.longitude;
  for (const name of ['Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']) {
    const p = planetsData[name];
    if (!p) continue;
    const c = calcCombustion(p.longitude, sunLon, name, p.is_retrograde);
    p.combust = c.combust;
    p.combust_orb = c.orb;
  }

  // Panchanga
  const panchanga: Panchanga = {
    tithi: calculateTithi(sunLon, moonLon),
    nakshatra: {
      name: planetsData.Moon.nakshatra,
      pada: planetsData.Moon.pada,
      lord: planetsData.Moon.nak_lord,
    },
    yoga: calculatePanchangaYoga(sunLon, moonLon),
    karana: calculateKarana(sunLon, moonLon),
    vara: calculateVara(jd),
  };

  // Arudha Lagna
  const arudhaLagna = calculateArudhaLagna(ascSign, planetsData);

  // Avasthas
  for (const name of ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']) {
    if (planetsData[name]) {
      planetsData[name].avastha = calculateAvastha(
        name,
        planetsData[name] as { sign: number; house: number; dignity: string },
        planetsData as Record<string, { sign: number; house: number; dignity: string }>
      );
    }
  }

  // Yogas
  const yogas = detectYogas(
    planetsData as Record<string, { sign: number; house: number; dignity: string }>,
    ascSign
  );

  // Lagna divisional positions
  const lagna = {
    d1: ascSign,
    d2: calculateDivisionalPosition(ascSidereal, 2),
    d3: calculateDivisionalPosition(ascSidereal, 3),
    d4: calculateDivisionalPosition(ascSidereal, 4),
    d6: calculateDivisionalPosition(ascSidereal, 6),
    d7: calculateDivisionalPosition(ascSidereal, 7),
    d8: calculateDivisionalPosition(ascSidereal, 8),
    d9: calculateDivisionalPosition(ascSidereal, 9),
    d10: calculateDivisionalPosition(ascSidereal, 10),
    d11: calculateDivisionalPosition(ascSidereal, 11),
    d12: calculateDivisionalPosition(ascSidereal, 12),
    d16: calculateDivisionalPosition(ascSidereal, 16),
    d20: calculateDivisionalPosition(ascSidereal, 20),
    d24: calculateDivisionalPosition(ascSidereal, 24),
    d27: calculateDivisionalPosition(ascSidereal, 27),
    d30: calculateDivisionalPosition(ascSidereal, 30),
    d40: calculateDivisionalPosition(ascSidereal, 40),
    d45: calculateDivisionalPosition(ascSidereal, 45),
    d60: calculateDivisionalPosition(ascSidereal, 60),
    al: arudhaLagna.sign >= 0 ? arudhaLagna.sign : ascSign,
  };

  // New feature calculations
  const grahaYuddha = detectGrahaYuddha(planetsData);
  const aspects = calculateAspects(planetsData);
  const charaKarakas = calculateCharaKarakas(planetsData);
  const dashas = calculateVimshottariDasha(moonSidereal, input.year, input.month, input.day, input.hour, input.minute);
  const sarvashtakavarga = calculateSarvashtakavarga(planetsData, ascSign);

  return {
    birth_info: {
      name: input.name,
      year: input.year,
      month: input.month,
      day: input.day,
      hour: input.hour,
      minute: input.minute,
      lat: input.lat,
      lon: input.lon,
      isSriLanka: input.isSriLanka,
      time_offset: offset,
    },
    ayanamsa,
    ascendant: {
      sign: ascSign,
      sign_name: SIGNS[ascSign],
      longitude: ascSidereal,
      degree: ascDegree,
      nakshatra: ascNak,
      pada: ascPada,
      nak_lord: ascNakLord,
    },
    planets: planetsData,
    panchanga,
    arudha_lagna: arudhaLagna,
    yogas,
    dashas,
    chara_karakas: charaKarakas,
    aspects,
    graha_yuddha: grahaYuddha,
    sarvashtakavarga,
    lagna,
  };
}

export function calculateTransitPlanets(natalLagnaSign: number): Record<string, import('./types').TransitPlanet> {
  const now = new Date();
  const jd = (julian as { CalendarGregorianToJD: (y: number, m: number, d: number) => number })
    .CalendarGregorianToJD(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate() + (now.getUTCHours() + now.getUTCMinutes() / 60) / 24);
  const decimalYear = now.getUTCFullYear() + now.getUTCMonth() / 12 + now.getUTCDate() / 365.25;
  const jde = jd + (deltat as { deltaT: (y: number) => number }).deltaT(decimalYear) / 86400;
  const ayanamsa = lahiriAyanamsa(jd);

  const PP_earth = planetposition as { Planet: new (d: unknown) => unknown };
  const earthPlanet = new PP_earth.Planet(earthData);
  const sunPos = (solar as { apparentVSOP87: (p: unknown, jde: number) => { lon: number } }).apparentVSOP87(earthPlanet, jde);
  const sunLon = normalizeLon(normalizeDeg(sunPos.lon * DEG) - ayanamsa);

  const moonPosT = (moonposition as { position: (jde: number) => { _ra: number } }).position(jde);
  const [dpsi] = (nutation as { nutation: (jde: number) => [number, number] }).nutation(jde);
  const moonLon = normalizeLon(normalizeDeg((moonPosT._ra + dpsi) * DEG) - ayanamsa);

  const outerData: Record<string, unknown> = {
    Mars: marsData, Mercury: mercuryData, Jupiter: jupiterData, Venus: venusData, Saturn: saturnData,
  };
  const result: Record<string, import('./types').TransitPlanet> = {};

  const addPlanet = (name: string, lon: number, speed: number) => {
    const [sign, degree] = getSignAndDegree(lon);
    const [nak] = calculateNakshatra(lon);
    result[name] = { sign, degree, longitude: lon, house: ((sign - natalLagnaSign + 12) % 12) + 1, is_retrograde: speed < 0, nakshatra: nak };
  };

  addPlanet('Sun', sunLon, 1);
  addPlanet('Moon', moonLon, 13);

  for (const [name, data] of Object.entries(outerData)) {
    const { lon, speed } = planetGeocentricLon(data, jde);
    addPlanet(name, normalizeLon(lon - ayanamsa), speed);
  }

  const rahuLon = normalizeLon(meanAscendingNode(jde) - ayanamsa);
  const ketuLon = normalizeLon(rahuLon + 180);
  addPlanet('Rahu', rahuLon, -1);
  addPlanet('Ketu', ketuLon, -1);

  return result;
}
