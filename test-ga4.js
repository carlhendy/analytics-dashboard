// Test script to check GA4 connection
const { google } = require('googleapis');

async function testGA4Connection() {
  try {
    console.log('Testing GA4 connection...');
    
    // Try Application Default Credentials
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });
    
    const analyticsData = google.analyticsdata({
      version: 'v1beta',
      auth,
    });
    
    console.log('✅ Authentication successful!');
    
    // Test API call
    const response = await analyticsData.properties.runReport({
      property: 'properties/292486236',
      requestBody: {
        dateRanges: [
          {
            startDate: '2024-12-01',
            endDate: '2024-12-31',
          },
        ],
        dimensions: [
          {
            name: 'sessionDefaultChannelGroup',
          },
        ],
        metrics: [
          {
            name: 'sessions',
          },
        ],
      },
    });
    
    console.log('✅ API call successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testGA4Connection();
