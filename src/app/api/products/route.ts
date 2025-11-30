/**
 * Products API Route
 * Proxies product list requests to ERP backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

export async function GET(request: NextRequest) {
  try {
    const { ERP_API_URL } = getServerEnv();
    const { searchParams } = new URL(request.url);

    // Build query string from search params
    const queryString = searchParams.toString();
    const apiUrl = `${ERP_API_URL}/api/v1/products${queryString ? `?${queryString}` : ''}`;

    console.log('[Products] Fetching from ERP:', apiUrl);

    const erpResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await erpResponse.json();

    return NextResponse.json(data, { status: erpResponse.status });
  } catch (error) {
    console.error('[Products Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
      },
      { status: 500 }
    );
  }
}
