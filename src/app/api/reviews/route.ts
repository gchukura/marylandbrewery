import { NextRequest, NextResponse } from 'next/server';
import { getBreweryReviews } from '../../../../lib/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const breweryId = searchParams.get('breweryId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!breweryId) {
      return NextResponse.json(
        { error: 'breweryId is required' },
        { status: 400 }
      );
    }

    const result = await getBreweryReviews(breweryId, limit, offset);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

