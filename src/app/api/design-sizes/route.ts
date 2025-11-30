/**
 * Design Sizes API Route
 * Proxies design size requests to ERP backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

export async function GET(request: NextRequest) {
  try {
    const { ERP_API_URL } = getServerEnv();
    const { searchParams } = new URL(request.url);

    const area = searchParams.get('area');
    const method = searchParams.get('method');

    if (!area || !method) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: area and method',
        },
        { status: 400 }
      );
    }

    const apiUrl = `${ERP_API_URL}/api/v1/design-sizes?area=${encodeURIComponent(area)}&method=${encodeURIComponent(method)}`;

    console.log('[Design Sizes] Fetching from ERP:', apiUrl);

    const erpResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await erpResponse.json();

    return NextResponse.json(data, { status: erpResponse.status });
  } catch (error) {
    console.error('[Design Sizes Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch design sizes',
      },
      { status: 500 }
    );
  }
}
