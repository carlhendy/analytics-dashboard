// import { google } from 'googleapis';
// import { cookies } from 'next/headers';

export async function GET() {
  try {
    // For now, always return mock properties to avoid API issues
    console.log('Returning mock properties for development');
    return Response.json({
      properties: [{
        id: '292486236',
        name: 'Demo GA4 Property',
        accountName: 'Demo Account',
        accountId: 'demo',
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
      }]
    });
  } catch (error) {
    console.error('Error fetching GA4 properties:', error);
    return Response.json({ 
      error: 'Failed to fetch Google Analytics properties. Please try reconnecting.' 
    }, { status: 500 });
  }
}