import { NextRequest, NextResponse } from 'next/server';
import type { ChartResult } from '@/lib/types';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const chart: ChartResult = await req.json();

    const planetSummary = Object.entries(chart.planets)
      .map(([name, p]) =>
        `${name}: ${p.sign !== undefined ? ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][p.sign] : 'Unknown'} (H${p.house}), ${p.dignity}${p.is_retrograde ? ' Rx' : ''}, Nakshatra: ${p.nakshatra}`
      )
      .join('\n');

    const yogaList = chart.yogas.map((y) => `• ${y.name}: ${y.effect}`).join('\n');

    const prompt = `You are an expert Vedic astrologer. Provide a concise, insightful reading for the following birth chart. Focus on personality, key strengths, life themes, and important yogas. Be specific and avoid generic statements. Keep it to 4-5 rich paragraphs.

Name: ${chart.birth_info.name}
Birth: ${chart.birth_info.day}/${chart.birth_info.month}/${chart.birth_info.year} at ${chart.birth_info.hour}:${String(chart.birth_info.minute).padStart(2,'0')}

Ascendant (Lagna): ${chart.ascendant.sign_name} ${chart.ascendant.degree.toFixed(1)}° | Nakshatra: ${chart.ascendant.nakshatra} Pada ${chart.ascendant.pada} (Lord: ${chart.ascendant.nak_lord})
Ayanamsa (Lahiri): ${chart.ayanamsa.toFixed(4)}°
Arudha Lagna: ${chart.arudha_lagna.sign_name}

Planetary Positions:
${planetSummary}

Panchanga:
- Tithi: ${chart.panchanga.tithi.name} (${chart.panchanga.tithi.paksha})
- Nakshatra: ${chart.panchanga.nakshatra.name} Pada ${chart.panchanga.nakshatra.pada} (Lord: ${chart.panchanga.nakshatra.lord})
- Yoga: ${chart.panchanga.yoga.name}
- Vara: ${chart.panchanga.vara.name}

Active Yogas:
${yogaList || 'None detected'}

Provide an insightful Vedic astrology reading highlighting personality, dharma, wealth potential, relationships, and spiritual path.`;

    if (!GROQ_API_KEY) {
      return NextResponse.json({
        insight: `**Chart Reading for ${chart.birth_info.name}**\n\nThe Groq API key is not configured. Please add GROQ_API_KEY to your .env.local file to enable AI-powered astrological insights.\n\nYour chart shows ${chart.ascendant.sign_name} rising with the Moon in ${['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][chart.planets.Moon?.sign || 0]}, indicating ${chart.panchanga.tithi.name} tithi at birth.`,
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
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq API error: ${err}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };
    const insight = data.choices[0]?.message?.content || 'No insight generated.';

    return NextResponse.json({ insight });
  } catch (e: unknown) {
    console.error('AI insight error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'AI insight failed' },
      { status: 500 }
    );
  }
}
