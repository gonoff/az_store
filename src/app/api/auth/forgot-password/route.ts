/**
 * Forgot Password API Route
 * Requests a password reset email
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

interface ForgotPasswordRequest {
  email: string;
}

interface ERPResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ForgotPasswordRequest = await request.json();
    const { ERP_API_URL } = getServerEnv();

    // Forward request to ERP API
    const erpResponse = await fetch(`${ERP_API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data: ERPResponse = await erpResponse.json();

    if (!erpResponse.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          error: data.error || 'Failed to send reset email',
        },
        { status: erpResponse.status }
      );
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a reset link has been sent.',
    });
  } catch (error) {
    console.error('[Forgot Password Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while processing your request',
      },
      { status: 500 }
    );
  }
}
