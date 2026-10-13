'use client';

import { useState, useEffect } from 'react';
import type { BirthDetails } from '@/lib/types';

interface InputFormProps {
  onSubmit: (data: BirthDetails) => void;
  isLoading: boolean;
}

interface SavedProfile {
  key: string;
  details: BirthDetails;
}

const STORAGE_KEY = 'vedic-saved-profiles';

function loadProfiles(): SavedProfile[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as SavedProfile[];
  } catch {
    return [];
  }
}

function persistProfiles(profiles: SavedProfile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

const SRI_LANKA_CITIES = [
  { name: 'Colombo', lat: 6.9271, lon: 79.8612, emoji: '🏙️' },
  { name: 'Kandy',   lat: 7.2906, lon: 80.6337, emoji: '🏔️' },
  { name: 'Galle',   lat: 6.0535, lon: 80.2210, emoji: '🌊' },
  { name: 'Jaffna',  lat: 9.6615, lon: 80.0255, emoji: '🌴' },
];

const WORLD_CITY_GROUPS = [
  {
    region: 'India',
    cities: [
      { name: 'Mumbai',     lat: 19.0760,  lon: 72.8777,   emoji: '🏙️' },
      { name: 'Delhi',      lat: 28.6139,  lon: 77.2090,   emoji: '🏛️' },
      { name: 'Chennai',    lat: 13.0827,  lon: 80.2707,   emoji: '🌊' },
      { name: 'Kolkata',    lat: 22.5726,  lon: 88.3639,   emoji: '🌉' },
      { name: 'Bengaluru',  lat: 12.9716,  lon: 77.5946,   emoji: '🌿' },
    ],
  },
  {
    region: 'South Asia',
    cities: [
      { name: 'Dhaka',      lat: 23.8103,  lon: 90.4125,   emoji: '🌿' },
      { name: 'Karachi',    lat: 24.8607,  lon: 67.0011,   emoji: '⛵' },
      { name: 'Kathmandu',  lat: 27.7172,  lon: 85.3240,   emoji: '🏔️' },
    ],
  },
  {
    region: 'Southeast Asia',
    cities: [
      { name: 'Singapore',      lat: 1.3521,   lon: 103.8198, emoji: '🦁' },
      { name: 'Bangkok',        lat: 13.7563,  lon: 100.5018, emoji: '🏛️' },
      { name: 'Kuala Lumpur',   lat: 3.1390,   lon: 101.6869, emoji: '🏙️' },
      { name: 'Jakarta',        lat: -6.2088,  lon: 106.8456, emoji: '🌴' },
    ],
  },
  {
    region: 'East Asia',
    cities: [
      { name: 'Tokyo',   lat: 35.6762, lon: 139.6503, emoji: '🗼' },
      { name: 'Beijing', lat: 39.9042, lon: 116.4074, emoji: '🏯' },
      { name: 'Seoul',   lat: 37.5665, lon: 126.9780, emoji: '🌸' },
    ],
  },
  {
    region: 'Middle East',
    cities: [
      { name: 'Dubai',   lat: 25.2048, lon: 55.2708, emoji: '🌆' },
      { name: 'Riyadh',  lat: 24.6877, lon: 46.7219, emoji: '🕌' },
    ],
  },
  {
    region: 'Europe',
    cities: [
      { name: 'London', lat: 51.5074, lon: -0.1278, emoji: '🌉' },
      { name: 'Paris',  lat: 48.8566, lon: 2.3522,  emoji: '🗼' },
      { name: 'Berlin', lat: 52.5200, lon: 13.4050, emoji: '🏛️' },
    ],
  },
  {
    region: 'Americas',
    cities: [
      { name: 'New York',    lat: 40.7128, lon: -74.0060,  emoji: '🗽' },
      { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, emoji: '🌴' },
      { name: 'Toronto',     lat: 43.6532, lon: -79.3832,  emoji: '🍁' },
    ],
  },
  {
    region: 'Australia',
    cities: [
      { name: 'Sydney',    lat: -33.8688, lon: 151.2093, emoji: '🦘' },
      { name: 'Melbourne', lat: -37.8136, lon: 144.9631, emoji: '☕' },
    ],
  },
];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function friendlyDate(y: number, m: number, d: number): string {
  try {
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return '';
    return `${WEEKDAYS[date.getDay()]}, ${d} ${MONTH_NAMES[m - 1]} ${y}`;
  } catch {
    return '';
  }
}

function friendlyTime(h: number, min: number): string {
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(min).padStart(2, '0')} ${period}  ·  ${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')} (24h)`;
}

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [form, setForm] = useState<BirthDetails>({
    name: '',
    year: 1990,
    month: 1,
    day: 1,
    hour: 6,
    minute: 0,
    lat: 6.9271,
    lon: 79.8612,
    isSriLanka: true,
  });
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);

  useEffect(() => {
    setSavedProfiles(loadProfiles());
  }, []);

  function set<K extends keyof BirthDetails>(key: K, val: BirthDetails[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function saveProfile() {
    if (!form.name.trim()) return;
    const key = form.name.trim();
    const updated = [
      { key, details: { ...form } },
      ...savedProfiles.filter((p) => p.key !== key),
    ].slice(0, 10); // max 10 saved
    setSavedProfiles(updated);
    persistProfiles(updated);
  }

  function deleteProfile(key: string) {
    const updated = savedProfiles.filter((p) => p.key !== key);
    setSavedProfiles(updated);
    persistProfiles(updated);
  }

  function loadProfile(profile: SavedProfile) {
    setForm({ ...profile.details });
  }

  function applyCity(lat: number, lon: number) {
    setForm((f) => ({ ...f, lat, lon }));
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value; // "YYYY-MM-DD"
    if (!val) return;
    const [y, m, d] = val.split('-').map(Number);
    if (y && m && d) setForm((f) => ({ ...f, year: y, month: m, day: d }));
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value; // "HH:MM"
    if (!val) return;
    const [h, min] = val.split(':').map(Number);
    setForm((f) => ({ ...f, hour: h ?? 0, minute: min ?? 0 }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  const dateValue = `${form.year}-${String(form.month).padStart(2, '0')}-${String(form.day).padStart(2, '0')}`;
  const timeValue = `${String(form.hour).padStart(2, '0')}:${String(form.minute).padStart(2, '0')}`;

  const inputCls = 'vedic-input w-full rounded-lg px-3 py-2.5 text-sm focus:ring-0 font-body';
  const labelCls = 'block text-xs text-stone-500 mb-1.5 font-display tracking-wider uppercase';

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-8 animate-slide-up">

      {/* Saved profiles */}
      {savedProfiles.length > 0 && (
        <div className="mb-6 pb-6 border-b border-stone-200/70">
          <p className="text-xs text-stone-400 font-display uppercase tracking-wider mb-2.5">Saved Profiles</p>
          <div className="flex flex-wrap gap-2">
            {savedProfiles.map((p) => (
              <div
                key={p.key}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-sm font-body group"
              >
                <button
                  type="button"
                  onClick={() => loadProfile(p)}
                  className="hover:text-amber-600 transition-colors"
                >
                  {p.key}
                </button>
                <button
                  type="button"
                  onClick={() => deleteProfile(p.key)}
                  className="ml-1 text-stone-300 hover:text-red-400 transition-colors leading-none text-base"
                  title="Remove saved profile"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Name */}
      <div className="mb-6">
        <label className={labelCls}>Full Name</label>
        <div className="flex gap-2">
          <input
            type="text"
            className={`${inputCls} flex-1`}
            placeholder="Enter birth name..."
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
          />
          <button
            type="button"
            onClick={saveProfile}
            disabled={!form.name.trim()}
            title="Save this profile"
            className="px-3 py-2.5 rounded-lg border border-stone-200 bg-white/60 text-stone-500 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition-all text-sm disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            💾
          </button>
        </div>
      </div>

      {/* Date + Time */}
      <div className="mb-6">
        <label className={labelCls}>Date &amp; Time of Birth</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {/* Date picker */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
              </svg>
            </div>
            <input
              type="date"
              className={`${inputCls} pl-9 date-picker`}
              min="1800-01-01"
              max="2100-12-31"
              value={dateValue}
              onChange={handleDateChange}
              required
            />
          </div>

          {/* Time picker */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <input
              type="time"
              className={`${inputCls} pl-9 time-picker`}
              value={timeValue}
              onChange={handleTimeChange}
              required
            />
          </div>
        </div>

        {/* Human-readable preview */}
        <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-1">
          <span className="text-xs text-amber-700 font-body flex items-center gap-1.5">
            <span className="text-stone-400">📅</span>
            {friendlyDate(form.year, form.month, form.day)}
          </span>
          <span className="hidden sm:block text-stone-300">·</span>
          <span className="text-xs text-amber-700 font-body flex items-center gap-1.5">
            <span className="text-stone-400">🕐</span>
            {friendlyTime(form.hour, form.minute)}
          </span>
        </div>
      </div>

      {/* Sri Lanka toggle */}
      <div className="mb-5">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              form.isSriLanka
                ? 'bg-amber-500 border border-amber-400'
                : 'bg-stone-200 border border-stone-300'
            }`}
            onClick={() => set('isSriLanka', !form.isSriLanka)}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                form.isSriLanka ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </div>
          <div>
            <span className="text-sm text-stone-700 font-body">Born in Sri Lanka 🇱🇰</span>
            <p className="text-xs text-stone-400 mt-0.5">Applies historical timezone corrections</p>
          </div>
        </label>
      </div>

      {/* City presets */}
      {form.isSriLanka ? (
        <div className="mb-5 animate-fade-in">
          <label className={labelCls}>Quick City Presets</label>
          <div className="grid grid-cols-2 gap-2">
            {SRI_LANKA_CITIES.map((city) => {
              const active =
                Math.abs(form.lat - city.lat) < 0.01 &&
                Math.abs(form.lon - city.lon) < 0.01;
              return (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => applyCity(city.lat, city.lon)}
                  className={`px-3 py-2 rounded-lg text-sm font-body transition-all duration-200 flex items-center gap-2 ${
                    active
                      ? 'bg-amber-100 border border-amber-400 text-amber-800'
                      : 'btn-ghost'
                  }`}
                >
                  <span>{city.emoji}</span>
                  <span>{city.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mb-5">
          <label className={labelCls}>World City Presets</label>
          <div className="max-h-52 overflow-y-auto rounded-xl border border-stone-200 divide-y divide-stone-100">
            {WORLD_CITY_GROUPS.map((group) => (
              <div key={group.region} className="px-3 py-2">
                <p className="text-xs text-stone-400 font-display uppercase tracking-wider mb-2">{group.region}</p>
                <div className="flex flex-wrap gap-1.5">
                  {group.cities.map((city) => {
                    const active =
                      Math.abs(form.lat - city.lat) < 0.01 &&
                      Math.abs(form.lon - city.lon) < 0.01;
                    return (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => applyCity(city.lat, city.lon)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-body transition-all duration-200 flex items-center gap-1.5 border ${
                          active
                            ? 'bg-amber-100 border-amber-400 text-amber-800'
                            : 'bg-white/60 border-stone-200 text-stone-600 hover:border-amber-300 hover:text-amber-700'
                        }`}
                      >
                        <span>{city.emoji}</span>
                        <span>{city.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coordinates */}
      <div className="mb-7">
        <label className={labelCls}>
          Coordinates {form.isSriLanka ? '(auto-filled from city)' : ''}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="number"
              className={inputCls}
              step="0.0001"
              placeholder="Latitude"
              value={form.lat}
              onChange={(e) => set('lat', parseFloat(e.target.value) || 0)}
              required
            />
            <p className="text-xs text-stone-400 mt-1 text-center">Latitude (N+, S–)</p>
          </div>
          <div>
            <input
              type="number"
              className={inputCls}
              step="0.0001"
              placeholder="Longitude"
              value={form.lon}
              onChange={(e) => set('lon', parseFloat(e.target.value) || 0)}
              required
            />
            <p className="text-xs text-stone-400 mt-1 text-center">Longitude (E+, W–)</p>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-gold w-full py-4 rounded-xl text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-3">
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Calculating Cosmic Positions...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span>✦</span>
            Calculate Chart
            <span>✦</span>
          </span>
        )}
      </button>

      <p className="text-center text-xs text-stone-400 mt-4 font-body">
        All calculations run server-side · Profiles saved locally in your browser · Free guest access
      </p>
    </form>
  );
}
