/**
 * Reset Password API Route
 * Resets password using token
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

interface ResetPasswordRequest {
  token: string;
  password: string;
}

interface ERPResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ResetPasswordRequest = await request.json();
    const { ERP_API_URL } = getServerEnv();

    // Forward request to ERP API
    const erpResponse = await fetch(`${ERP_API_URL}/api/auth/reset-password`, {
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
          error: data.error || 'Failed to reset password',
        },
        { status: erpResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully.',
    });
  } catch (error) {
    console.error('[Reset Password Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while resetting your password',
      },
      { status: 500 }
    );
  }
}
