/**
 * Product Detail API Route
 * Proxies single product requests to ERP backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { ERP_API_URL } = getServerEnv();
    const { id } = await context.params;

    const apiUrl = `${ERP_API_URL}/api/v1/products/${id}`;

    console.log('[Product Detail] Fetching from ERP:', apiUrl);

    const erpResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await erpResponse.json();

    return NextResponse.json(data, { status: erpResponse.status });
  } catch (error) {
    console.error('[Product Detail Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product',
      },
      { status: 500 }
    );
  }
}
