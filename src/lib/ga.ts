import { google } from 'googleapis';
import { cookies } from 'next/headers';

export class GA4Service {
  private analyticsData: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  private propertyId: string;

  constructor(propertyId: string) {
    this.propertyId = propertyId;
    
    // Initialize with OAuth2 credentials
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    this.analyticsData = google.analyticsdata({ 
      version: 'v1beta',
      auth: oauth2Client
    });
  }

  private async ensureAuthenticated() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('google_access_token')?.value;
    const refreshToken = cookieStore.get('google_refresh_token')?.value;

    if (!accessToken) {
      throw new Error('No OAuth2 access token found. Please authenticate first.');
    }

    // Set the credentials
    this.analyticsData.auth.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // Try to refresh the token if it's expired
    try {
      await this.analyticsData.auth.refreshAccessToken();
    } catch (error) {
      console.log('Token refresh failed, using existing token:', error);
    }
  }

  async getChannelSummary(startDate: string, endDate: string) {
    try {
      // Check for stored tokens and refresh if needed
      await this.ensureAuthenticated();
      
      // Get sessions by channel group
      const channelResponse = await this.analyticsData.properties.runReport({
        property: `properties/${this.propertyId}`,
        requestBody: {
          dateRanges: [
            {
              startDate,
              endDate,
            },
          ],
          dimensions: [
            {
              name: 'sessionDefaultChannelGrouping',
            },
          ],
          metrics: [
            {
              name: 'sessions',
            },
            {
              name: 'screenPageViews',
            },
            {
              name: 'bounceRate',
            },
            {
              name: 'totalUsers',
            },
          ],
        },
      });

      const rows = channelResponse.data.rows || [];
      
      // Process channel data
      const channels: { [key: string]: number } = {
        organic: 0,
        direct: 0,
        referral: 0,
        llm: 0,
        paid: 0,
        other: 0,
        unassigned: 0,
      };

      let totalSessions = 0;
      let totalPageViews = 0;
      let totalBounceRate = 0;
      let totalUsers = 0;

      rows.forEach((row: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const channel = row.dimensionValues?.[0]?.value || 'unassigned';
        const sessions = parseInt(row.metricValues?.[0]?.value || '0');
        const pageViews = parseInt(row.metricValues?.[1]?.value || '0');
        const bounceRate = parseFloat(row.metricValues?.[2]?.value || '0');
        const users = parseInt(row.metricValues?.[3]?.value || '0');

        totalSessions += sessions;
        totalPageViews += pageViews;
        totalBounceRate += bounceRate;
        totalUsers += users;

        // Map channels to our categories
        if (channel.toLowerCase().includes('organic') || channel.toLowerCase().includes('search')) {
          channels.organic += sessions;
        } else if (channel.toLowerCase().includes('paid') || channel.toLowerCase().includes('cpc') || channel.toLowerCase().includes('ppc')) {
          channels.paid += sessions;
        } else if (channel.toLowerCase().includes('direct')) {
          channels.direct += sessions;
        } else if (channel.toLowerCase().includes('referral')) {
          channels.referral += sessions;
        } else if (channel.toLowerCase().includes('llm') || channel.toLowerCase().includes('ai')) {
          channels.llm += sessions;
        } else {
          channels.other += sessions;
        }
      });

      // Calculate other as the sum of direct, referral, llm, and unassigned
      channels.other = channels.direct + channels.referral + channels.llm + channels.unassigned;

      return {
        range: { startDate, endDate },
        channels,
        totals: {
          sessions: totalSessions,
          pageViews: totalPageViews,
          bounceRate: totalBounceRate / rows.length,
          totalUsers,
        },
      };
    } catch (error) {
      console.error('GA4 API Error:', error);
      throw new Error('Failed to fetch GA4 data');
    }
  }
}

export function createGA4Service(propertyId: string) {
  return new GA4Service(propertyId);
}
