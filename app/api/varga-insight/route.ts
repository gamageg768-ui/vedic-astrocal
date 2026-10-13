import { NextRequest, NextResponse } from 'next/server';
import type { ChartResult } from '@/lib/types';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

const VARGA_SIGNIFICATIONS: Record<number, string> = {
  1:  'overall personality, physical constitution, and life path',
  2:  'wealth, financial prosperity, and resource accumulation',
  3:  'siblings, courage, short travels, and longevity',
  4:  'fixed assets, property, home, and personal fortune',
  6:  'health, diseases, debts, conflicts, and enemies',
  7:  'children, creative progeny, and fertility',
  8:  'longevity, chronic illness, transformation, and obstacles',
  9:  'spouse, partnership, dharma (life purpose), and spiritual strength',
  10: 'career, profession, vocation, public status, and achievements',
  11: 'gains, income, social network, elder siblings, and aspirations',
  12: 'parents, ancestral blessings, and lineage karma',
  16: 'vehicles, conveyances, comforts, and material luxuries',
  20: 'spiritual life, devotional practices, and upasana path',
  24: 'education, formal learning, skills, and intellectual achievements',
  27: 'physical strength, vitality, and stamina',
  30: 'troubles, hidden enemies, chronic suffering, and evils',
  40: 'auspicious and inauspicious events, maternal lineage karma',
  45: 'father figure, paternal lineage, and ancestral dharma',
  60: 'past life karma, accumulated samskaras, and overall destiny',
};

const VARGA_NAMES: Record<number, string> = {
  1:  'Rashi',
  2:  'Hora',
  3:  'Drekkana',
  4:  'Chaturthamsha',
  6:  'Shashthamsha',
  7:  'Saptamsha',
  8:  'Ashtamsha',
  9:  'Navamsha',
  10: 'Dashamsha',
  11: 'Ekadashamamsha',
  12: 'Dwadashamsha',
  16: 'Shodashamsha',
  20: 'Vimshamsha',
  24: 'Siddhamsha',
  27: 'Bhamsha',
  30: 'Trimshamsha',
  40: 'Khavedamsha',
  45: 'Akshavedamsha',
  60: 'Shashtyamsha',
};

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export async function POST(req: NextRequest) {
  try {
    const { chart, varga }: { chart: ChartResult; varga: number } = await req.json();

    const vargaName = VARGA_NAMES[varga] ?? `D${varga}`;
    const signification = VARGA_SIGNIFICATIONS[varga] ?? 'general life themes';

    const lagnaSignIdx = (chart.lagna as unknown as Record<string, number>)[`d${varga}`] ?? chart.lagna.d1;
    const lagnaSign = SIGNS[lagnaSignIdx] ?? '?';

    const planetPositions = Object.entries(chart.planets)
      .map(([name, p]) => {
        const signIdx = (p as unknown as Record<string, number>)[`d${varga}`];
        const sign = SIGNS[signIdx] ?? '?';
        const houseNum = ((signIdx - lagnaSignIdx + 12) % 12) + 1;
        return `${name}: ${sign} H${houseNum} (D1: ${SIGNS[p.sign]} H${p.house}${p.is_retrograde ? ' Rx' : ''})`;
      })
      .join('\n');

    const prompt = `You are an expert Vedic astrologer specializing in divisional (varga) chart analysis.

Analyze the D${varga} ${vargaName} chart for ${chart.birth_info.name}.
This chart specifically reveals: ${signification}.

Birth: ${chart.birth_info.day}/${chart.birth_info.month}/${chart.birth_info.year} at ${chart.birth_info.hour}:${String(chart.birth_info.minute).padStart(2, '0')}
D1 Ascendant: ${chart.ascendant.sign_name} ${chart.ascendant.degree.toFixed(1)}°
D${varga} Lagna: ${lagnaSign}
Ayanamsa (Lahiri): ${chart.ayanamsa.toFixed(4)}°

Planetary positions in D${varga} ${vargaName}:
${planetPositions}

Based on this D${varga} chart, provide a focused 3-4 paragraph reading about the native's ${signification}. Be specific about which planets are well-placed vs. challenged in this varga, and what this means for the specific life area this chart governs. Avoid generic statements — ground observations in the actual planetary placements shown above.`;

    if (!GROQ_API_KEY) {
      return NextResponse.json({
        insight: `**D${varga} ${vargaName} Analysis for ${chart.birth_info.name}**\n\nGroq API key not configured. Add GROQ_API_KEY to .env.local to enable varga-specific AI readings.\n\nD${varga} Lagna is in ${lagnaSign}. This chart governs ${signification}.`,
      });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq error: ${await response.text()}`);
    }

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    return NextResponse.json({ insight: data.choices[0]?.message?.content ?? '' });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed' },
      { status: 500 }
    );
  }
}
