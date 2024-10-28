import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL; // Keep this server-side only

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${process.env.API_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ status: 'error' }, { status: 500 });
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
