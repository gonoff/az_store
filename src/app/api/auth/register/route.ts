/**
 * Register API Route
 * Registers a new customer
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
}

interface ERPRegisterResponse {
  success: true;
  message: string;
  data: {
    customer_id: number;
  };
}

interface ERPErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { ERP_API_URL } = getServerEnv();

    // Forward register request to ERP API
    const erpResponse = await fetch(`${ERP_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data: ERPRegisterResponse | ERPErrorResponse = await erpResponse.json();

    if (!erpResponse.ok || !data.success) {
      const errorData = data as ERPErrorResponse;
      return NextResponse.json(
        {
          success: false,
          error: errorData.error || 'Registration failed',
          details: errorData.details,
        },
        { status: erpResponse.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Register Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during registration',
      },
      { status: 500 }
    );
  }
}
