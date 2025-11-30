/**
 * Resend Verification Email API Route
 * Requests a new verification email for the user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

interface ResendVerificationRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ResendVerificationRequest = await request.json();
    const { ERP_API_URL } = getServerEnv();

    const apiUrl = `${ERP_API_URL}/api/auth/resend-verification`;
    console.log('[ResendVerification] Calling ERP API:', apiUrl);

    // Forward request to ERP API
    const erpResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const responseText = await erpResponse.text();
    console.log('[ResendVerification] ERP Response Status:', erpResponse.status);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('[ResendVerification] Failed to parse ERP response as JSON');
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid response from server',
        },
        { status: 502 }
      );
    }

    // Return response with same status as ERP
    return NextResponse.json(data, { status: erpResponse.status });
  } catch (error) {
    console.error('[ResendVerification Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while resending verification email',
      },
      { status: 500 }
    );
  }
}
