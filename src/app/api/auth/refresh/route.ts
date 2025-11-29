/**
 * Refresh Token API Route
 * Refreshes access token using refresh token from cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

interface ERPRefreshResponse {
  success: true;
  data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: 'Bearer';
  };
}

interface ERPErrorResponse {
  success: false;
  error: string;
}

export async function POST(request: NextRequest) {
  try {
    const { ERP_API_URL, JWT_COOKIE_NAME, NODE_ENV } = getServerEnv();

    // Get refresh token from cookie
    const refreshToken = request.cookies.get(`${JWT_COOKIE_NAME}_refresh`)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'No refresh token found',
        },
        { status: 401 }
      );
    }

    // Forward refresh request to ERP API
    const erpResponse = await fetch(`${ERP_API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data: ERPRefreshResponse | ERPErrorResponse = await erpResponse.json();

    if (!erpResponse.ok || !data.success) {
      const errorData = data as ERPErrorResponse;

      // Clear cookies on refresh failure
      const response = NextResponse.json(
        {
          success: false,
          error: errorData.error || 'Token refresh failed',
        },
        { status: 401 }
      );

      response.cookies.set(`${JWT_COOKIE_NAME}_access`, '', {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
      });

      response.cookies.set(`${JWT_COOKIE_NAME}_refresh`, '', {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
      });

      return response;
    }

    const successData = data as ERPRefreshResponse;
    const { access_token, refresh_token, expires_in } = successData.data;

    const response = NextResponse.json({
      success: true,
    });

    // Update access token cookie
    response.cookies.set(`${JWT_COOKIE_NAME}_access`, access_token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expires_in,
      path: '/',
    });

    // Update refresh token cookie
    response.cookies.set(`${JWT_COOKIE_NAME}_refresh`, refresh_token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Refresh Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during token refresh',
      },
      { status: 500 }
    );
  }
}
