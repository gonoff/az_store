/**
 * Filters API Route
 * Proxies filter options requests to ERP backend
 */

import { NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

export async function GET() {
  try {
    const { ERP_API_URL } = getServerEnv();

    const apiUrl = `${ERP_API_URL}/api/v1/filters`;

    console.log('[Filters] Fetching from ERP:', apiUrl);

    const erpResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await erpResponse.json();

    return NextResponse.json(data, { status: erpResponse.status });
  } catch (error) {
    console.error('[Filters Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch filters',
      },
      { status: 500 }
    );
  }
}
