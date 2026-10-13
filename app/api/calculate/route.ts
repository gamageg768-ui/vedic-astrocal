import { NextRequest, NextResponse } from 'next/server';
import { calculateChart } from '@/lib/engine';
import type { BirthDetails } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: BirthDetails = await req.json();
    const result = calculateChart(body);
    return NextResponse.json(result);
  } catch (e: unknown) {
    console.error('Calculation error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Calculation failed' },
      { status: 500 }
    );
  }
}
