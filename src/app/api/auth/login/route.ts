/**
 * Login API Route
 * Authenticates user and sets httpOnly cookies
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

interface LoginRequest {
  email: string;
  password: string;
}

interface ERPLoginResponse {
  success: true;
  data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: 'Bearer';
    customer: {
      customer_id: number;
      email: string;
      full_name: string;
      email_verified: boolean;
    };
  };
}

interface ERPErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { ERP_API_URL, JWT_COOKIE_NAME, NODE_ENV } = getServerEnv();

    const apiUrl = `${ERP_API_URL}/api/auth/login`;
    console.log('[Login] Calling ERP API:', apiUrl);

    // Forward login request to ERP API
    const erpResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const responseText = await erpResponse.text();
    console.log('[Login] ERP Response Status:', erpResponse.status);
    console.log('[Login] ERP Response (first 200 chars):', responseText.substring(0, 200));

    // Try to parse as JSON
    let data: ERPLoginResponse | ERPErrorResponse;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('[Login] Failed to parse ERP response as JSON');
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid response from authentication server',
        },
        { status: 502 }
      );
    }

    if (!erpResponse.ok || !data.success) {
      const errorData = data as ERPErrorResponse;
      return NextResponse.json(
        {
          success: false,
          error: errorData.error || 'Login failed',
          details: errorData.details,
        },
        { status: erpResponse.status }
      );
    }

    const successData = data as ERPLoginResponse;
    const { access_token, refresh_token, expires_in, customer } = successData.data;

    // Create response with customer data (tokens stored in cookies)
    const response = NextResponse.json({
      success: true,
      data: {
        customer,
      },
    });

    // Set access token cookie
    response.cookies.set(`${JWT_COOKIE_NAME}_access`, access_token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expires_in,
      path: '/',
    });

    // Set refresh token cookie (longer expiry)
    response.cookies.set(`${JWT_COOKIE_NAME}_refresh`, refresh_token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Login Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during login',
      },
      { status: 500 }
    );
  }
}
