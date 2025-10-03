import { NextRequest, NextResponse } from 'next/server';
import { createGA4Service } from '@/lib/ga';
import { z } from 'zod';

// Ensure this runs on Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Mock data for fallback
const MOCK_DATA = {
  range: {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  },
  channels: {
    organic: 12000,
    direct: 8000,
    referral: 3000,
    llm: 1500,
    paid: 5000,
    other: 1500,
    unassigned: 500,
  },
  totals: {
    sessions: 31500,
  },
};

// Generate mock comparison data
const generateMockComparisonData = (baseData: typeof MOCK_DATA) => {
  const generateChannelData = (current: number) => {
    const previous = Math.floor(current * (0.85 + Math.random() * 0.3));
    const change = current - previous;
    const changePercent = previous > 0 ? Math.round((change / previous) * 100) : 0;
    
    return {
      current,
      previous,
      change,
      changePercent
    };
  };

  return {
    momData: {
      organic: generateChannelData(baseData.channels.organic),
      paid: generateChannelData(baseData.channels.paid),
      other: generateChannelData(baseData.channels.other)
    },
    wowData: {
      organic: generateChannelData(Math.floor(baseData.channels.organic * 0.25)),
      paid: generateChannelData(Math.floor(baseData.channels.paid * 0.25)),
      other: generateChannelData(Math.floor(baseData.channels.other * 0.25))
    },
    yoy30Data: {
      organic: generateChannelData(Math.floor(baseData.channels.organic * 0.9)),
      paid: generateChannelData(Math.floor(baseData.channels.paid * 0.9)),
      other: generateChannelData(Math.floor(baseData.channels.other * 0.9))
    },
    yoy7Data: {
      organic: generateChannelData(Math.floor(baseData.channels.organic * 0.2)),
      paid: generateChannelData(Math.floor(baseData.channels.paid * 0.2)),
      other: generateChannelData(Math.floor(baseData.channels.other * 0.2))
    }
  };
};

// Validation schema for query parameters
const QuerySchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  propertyId: z.string().optional(),
  comparison: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedQuery = QuerySchema.parse(query);
    
    // Set default date range (last 30 days)
    const endDate = validatedQuery.end || new Date().toISOString().split('T')[0];
    const startDate = validatedQuery.start || (() => {
      const date = new Date(endDate);
      date.setDate(date.getDate() - 30);
      return date.toISOString().split('T')[0];
    })();

    const propertyId = validatedQuery.propertyId;

    // Check if we have OAuth tokens
    const hasOAuthTokens = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

    if (!hasOAuthTokens) {
      console.log('No Google OAuth credentials found, returning mock data');
      const response = {
        ...MOCK_DATA,
        range: { startDate, endDate },
        mock: true,
        error: 'Please connect to Google Analytics to view real data'
      };
      
      if (validatedQuery.comparison === 'true') {
        return NextResponse.json({
          ...response,
          ...generateMockComparisonData(MOCK_DATA)
        });
      }
      
      return NextResponse.json(response);
    }

    // If no property is selected, return mock data with instruction
    if (!propertyId) {
      console.log('No property selected, returning mock data');
      const response = {
        ...MOCK_DATA,
        range: { startDate, endDate },
        mock: true,
        error: 'Please select a Google Analytics property'
      };
      
      if (validatedQuery.comparison === 'true') {
        return NextResponse.json({
          ...response,
          ...generateMockComparisonData(MOCK_DATA)
        });
      }
      
      return NextResponse.json(response);
    }

    try {
      // Fetch real GA4 data
      const ga4Service = createGA4Service(propertyId);
      const data = await ga4Service.getChannelSummary(startDate, endDate);
      
      return NextResponse.json({
        ...data,
        mock: false,
      });
    } catch (ga4Error) {
      console.error('GA4 fetch failed for property', propertyId, ':', ga4Error);
      console.error('GA4 error details:', {
        message: ga4Error instanceof Error ? ga4Error.message : String(ga4Error),
        stack: ga4Error instanceof Error ? ga4Error.stack : undefined,
        name: ga4Error instanceof Error ? ga4Error.name : undefined
      });
      
      // Return mock data with error info
      const response = {
        ...MOCK_DATA,
        range: { startDate, endDate },
        mock: true,
        error: `GA4 connection failed for property ${propertyId}: ${ga4Error instanceof Error ? ga4Error.message : String(ga4Error)}`,
      };
      
      if (validatedQuery.comparison === 'true') {
        return NextResponse.json({
          ...response,
          ...generateMockComparisonData(MOCK_DATA)
        });
      }
      
      return NextResponse.json(response);
    }

  } catch (error) {
    console.error('API Error:', error);
    
    // Return mock data on any error
    return NextResponse.json({
      ...MOCK_DATA,
      mock: true,
      error: 'API error, showing mock data',
    });
  }
}