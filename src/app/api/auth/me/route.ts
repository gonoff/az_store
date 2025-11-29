/**
 * Current User API Route
 * Returns current authenticated user info
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

interface ERPMeResponse {
  success: true;
  data: {
    customer_id: number;
    email: string;
    full_name: string;
    email_verified: boolean;
    phone_number: string;
    created_at: string;
  };
}

interface ERPErrorResponse {
  success: false;
  error: string;
}

export async function GET(request: NextRequest) {
  try {
    const { ERP_API_URL, JWT_COOKIE_NAME } = getServerEnv();

    // Get access token from cookie
    const accessToken = request.cookies.get(`${JWT_COOKIE_NAME}_access`)?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
        },
        { status: 401 }
      );
    }

    // Forward request to ERP API with auth header
    const erpResponse = await fetch(`${ERP_API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data: ERPMeResponse | ERPErrorResponse = await erpResponse.json();

    if (!erpResponse.ok || !data.success) {
      const errorData = data as ERPErrorResponse;
      return NextResponse.json(
        {
          success: false,
          error: errorData.error || 'Failed to get user info',
        },
        { status: erpResponse.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Me Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching user info',
      },
      { status: 500 }
    );
  }
}
