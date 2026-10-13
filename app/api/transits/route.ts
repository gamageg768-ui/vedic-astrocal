import { NextRequest, NextResponse } from 'next/server';
import { calculateTransitPlanets } from '@/lib/engine';

export async function POST(req: NextRequest) {
  try {
    const { natalLagnaSign } = await req.json() as { natalLagnaSign: number };
    const transits = calculateTransitPlanets(natalLagnaSign);
    return NextResponse.json(transits);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Transit calculation failed' },
      { status: 500 }
    );
  }
}
