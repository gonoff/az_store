/**
 * Logout API Route
 * Clears httpOnly cookies
 */

import { NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

export async function POST() {
  try {
    const { JWT_COOKIE_NAME, NODE_ENV } = getServerEnv();

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear access token cookie
    response.cookies.set(`${JWT_COOKIE_NAME}_access`, '', {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    // Clear refresh token cookie
    response.cookies.set(`${JWT_COOKIE_NAME}_refresh`, '', {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Logout Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during logout',
      },
      { status: 500 }
    );
  }
}
