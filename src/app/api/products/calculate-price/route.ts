/**
 * Price Calculation API Route
 * Proxies price calculation requests to ERP backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    const { ERP_API_URL } = getServerEnv();
    const body = await request.json();

    const apiUrl = `${ERP_API_URL}/api/v1/products/calculate-price`;

    console.log('[Calculate Price] Sending to ERP:', apiUrl);

    const erpResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await erpResponse.json();

    return NextResponse.json(data, { status: erpResponse.status });
  } catch (error) {
    console.error('[Calculate Price Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate price',
      },
      { status: 500 }
    );
  }
}
