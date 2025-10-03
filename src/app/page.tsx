'use client';

import { useState, useEffect, useCallback } from 'react';
// import StatCard from '@/components/StatCard'; // Unused for now
import PropertySelector from '@/components/PropertySelector';

// interface ComparisonData {
//   organic: {
//     current: number;
//     previous: number;
//     change: number;
//     changePercent: number;
//   };
//   paid: {
//     current: number;
//     previous: number;
//     change: number;
//     changePercent: number;
//   };
//   other: {
//     current: number;
//     previous: number;
//     change: number;
//     changePercent: number;
//   };
// }

export default function Home() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [data, setData] = useState<{
    totalUsers?: number;
    totalUsersChange?: number;
    totalUsersChangePercent?: number;
    sessions?: number;
    sessionsChange?: number;
    sessionsChangePercent?: number;
    pageViews?: number;
    pageViewsChange?: number;
    pageViewsChangePercent?: number;
    bounceRate?: number;
    bounceRateChange?: number;
    bounceRateChangePercent?: number;
    organic?: number;
    paid?: number;
    other?: number;
  } | null>(null);
  // const [momData, setMomData] = useState<ComparisonData | null>(null);
  // const [wowData, setWowData] = useState<ComparisonData | null>(null);
  // const [yoy30Data, setYoy30Data] = useState<ComparisonData | null>(null);
  // const [yoy7Data, setYoy7Data] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('2025-09-03');
  const [endDate, setEndDate] = useState('2025-10-03');
  const [sliderValues, setSliderValues] = useState({
    direct: 0,
    referral: 0,
    llm: 0,
    other: 0,
    unassigned: 0
  });

  const handleSliderChange = (channel: string, value: number) => {
    setSliderValues(prev => ({
      ...prev,
      [channel]: value
    }));
  };

  const fetchData = useCallback(async (propertyId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch summary data
      const summaryResponse = await fetch(`/api/ga/summary?propertyId=${propertyId}&start=${startDate}&end=${endDate}`);
      const summaryData = await summaryResponse.json();
      
      if (!summaryResponse.ok) {
        throw new Error(summaryData.error || 'Failed to fetch summary data');
      }
      
        setData({
        totalUsers: summaryData.totals?.sessions || 0,
        totalUsersChange: summaryData.totals?.sessionsChange || 0,
        totalUsersChangePercent: summaryData.totals?.sessionsChangePercent || 0,
        sessions: summaryData.totals?.sessions || 0,
        sessionsChange: summaryData.totals?.sessionsChange || 0,
        sessionsChangePercent: summaryData.totals?.sessionsChangePercent || 0,
        pageViews: summaryData.totals?.pageViews || 0,
        pageViewsChange: summaryData.totals?.pageViewsChange || 0,
        pageViewsChangePercent: summaryData.totals?.pageViewsChangePercent || 0,
        bounceRate: summaryData.totals?.bounceRate || 0,
        bounceRateChange: summaryData.totals?.bounceRateChange || 0,
        bounceRateChangePercent: summaryData.totals?.bounceRateChangePercent || 0,
        organic: summaryData.channels?.organic || 0,
        paid: summaryData.channels?.paid || 0,
        other: summaryData.channels?.other || 0,
      });

      // Fetch comparison data
      const comparisonResponse = await fetch(`/api/ga/summary?propertyId=${propertyId}&comparison=true&start=${startDate}&end=${endDate}`);
      const comparisonData = await comparisonResponse.json();
      
      // if (comparisonResponse.ok) {
      //   setMomData(comparisonData.momData || null);
      //   setWowData(comparisonData.wowData || null);
      //   setYoy30Data(comparisonData.yoy30Data || null);
      //   setYoy7Data(comparisonData.yoy7Data || null);
      // }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (selectedPropertyId) {
      fetchData(selectedPropertyId);
    } else {
      setLoading(false);
    }
  }, [selectedPropertyId, startDate, endDate, fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
          <h1 className="text-3xl font-bold text-gray-900">Total Organic Dashboard</h1>
              <p className="mt-2 text-gray-600">GA4 sessions for {startDate} → {endDate}</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Connect GA4
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Select Property
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Property Selector */}
        <div className="mb-8">
          <PropertySelector onPropertySelect={(propertyId) => setSelectedPropertyId(propertyId)} />
        </div>

        {/* Traffic Weightings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Traffic Weightings</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{data?.sessions?.toLocaleString() || '31,500'}</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
              <div className="text-lg font-semibold text-blue-600">100.0%</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{data?.organic?.toLocaleString() || '12,000'}</div>
              <div className="text-sm text-gray-600">Organic</div>
              <div className="text-lg font-semibold text-green-600">
                {data ? ((data.organic || 0) / (data.sessions || 1) * 100).toFixed(1) : '38.1'}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{data?.paid?.toLocaleString() || '5,000'}</div>
              <div className="text-sm text-gray-600">Paid</div>
              <div className="text-lg font-semibold text-blue-600">
                {data ? ((data.paid || 0) / (data.sessions || 1) * 100).toFixed(1) : '15.9'}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{data?.other?.toLocaleString() || '14,500'}</div>
              <div className="text-sm text-gray-600">Other</div>
              <div className="text-lg font-semibold text-gray-600">
                {data ? ((data.other || 0) / (data.sessions || 1) * 100).toFixed(1) : '46.0'}%
              </div>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Date Range</h2>
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days selected
              </button>
            </div>
          </div>
        </div>

        {/* Channel Analysis & Organic Allocation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Channel Analysis & Organic Allocation</h2>
          <p className="text-gray-600 mb-6">Adjust the sliders to allocate traffic to Total Organic</p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">CHANNEL</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">ORIGINAL GA4 DATA</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">CALCULATED RESULTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-900">Direct</td>
                  <td className="py-3 px-4">
                    <div className="text-lg font-semibold text-gray-900">8,000</div>
                    <div className="text-sm text-gray-600">ORIGINAL SESSIONS</div>
                    <div className="text-sm text-gray-600">25.4% OF TOTAL</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">ALLOCATE TO ORGANIC %</label>
                      <div className="slider-container">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={sliderValues.direct}
                          onChange={(e) => handleSliderChange('direct', parseInt(e.target.value))}
                          className="slider w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 font-medium">{sliderValues.direct}%</div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{Math.round(8000 * sliderValues.direct / 100).toLocaleString()}</div>
                    <div className="text-sm text-gray-600">ALLOCATED TO ORGANIC SESSIONS</div>
                    <div className="text-sm text-gray-600">{((8000 * sliderValues.direct / 100) / 31500 * 100).toFixed(1)}% OF TOTAL</div>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-900">Referral</td>
                  <td className="py-3 px-4">
                    <div className="text-lg font-semibold text-gray-900">3,000</div>
                    <div className="text-sm text-gray-600">ORIGINAL SESSIONS</div>
                    <div className="text-sm text-gray-600">9.5% OF TOTAL</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">ALLOCATE TO ORGANIC %</label>
                      <div className="slider-container">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={sliderValues.referral}
                          onChange={(e) => handleSliderChange('referral', parseInt(e.target.value))}
                          className="slider w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 font-medium">{sliderValues.referral}%</div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{Math.round(3000 * sliderValues.referral / 100).toLocaleString()}</div>
                    <div className="text-sm text-gray-600">ALLOCATED TO ORGANIC SESSIONS</div>
                    <div className="text-sm text-gray-600">{((3000 * sliderValues.referral / 100) / 31500 * 100).toFixed(1)}% OF TOTAL</div>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-900">AI/LLM Referral</td>
                  <td className="py-3 px-4">
                    <div className="text-lg font-semibold text-gray-900">1,500</div>
                    <div className="text-sm text-gray-600">ORIGINAL SESSIONS</div>
                    <div className="text-sm text-gray-600">4.8% OF TOTAL</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">ALLOCATE TO ORGANIC %</label>
                      <div className="slider-container">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={sliderValues.llm}
                          onChange={(e) => handleSliderChange('llm', parseInt(e.target.value))}
                          className="slider w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 font-medium">{sliderValues.llm}%</div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{Math.round(1500 * sliderValues.llm / 100).toLocaleString()}</div>
                    <div className="text-sm text-gray-600">ALLOCATED TO ORGANIC SESSIONS</div>
                    <div className="text-sm text-gray-600">{((1500 * sliderValues.llm / 100) / 31500 * 100).toFixed(1)}% OF TOTAL</div>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-900">Other</td>
                  <td className="py-3 px-4">
                    <div className="text-lg font-semibold text-gray-900">1,500</div>
                    <div className="text-sm text-gray-600">ORIGINAL SESSIONS</div>
                    <div className="text-sm text-gray-600">4.8% OF TOTAL</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">ALLOCATE TO ORGANIC %</label>
                      <div className="slider-container">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={sliderValues.other}
                          onChange={(e) => handleSliderChange('other', parseInt(e.target.value))}
                          className="slider w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 font-medium">{sliderValues.other}%</div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{Math.round(1500 * sliderValues.other / 100).toLocaleString()}</div>
                    <div className="text-sm text-gray-600">ALLOCATED TO ORGANIC SESSIONS</div>
                    <div className="text-sm text-gray-600">{((1500 * sliderValues.other / 100) / 31500 * 100).toFixed(1)}% OF TOTAL</div>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-900">Unassigned</td>
                  <td className="py-3 px-4">
                    <div className="text-lg font-semibold text-gray-900">500</div>
                    <div className="text-sm text-gray-600">ORIGINAL SESSIONS</div>
                    <div className="text-sm text-gray-600">1.6% OF TOTAL</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">ALLOCATE TO ORGANIC %</label>
                      <div className="slider-container">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={sliderValues.unassigned}
                          onChange={(e) => handleSliderChange('unassigned', parseInt(e.target.value))}
                          className="slider w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 font-medium">{sliderValues.unassigned}%</div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{Math.round(500 * sliderValues.unassigned / 100).toLocaleString()}</div>
                    <div className="text-sm text-gray-600">ALLOCATED TO ORGANIC SESSIONS</div>
                    <div className="text-sm text-gray-600">{((500 * sliderValues.unassigned / 100) / 31500 * 100).toFixed(1)}% OF TOTAL</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Summary Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Allocation Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">
                  {(
                    Math.round(8000 * sliderValues.direct / 100) +
                    Math.round(3000 * sliderValues.referral / 100) +
                    Math.round(1500 * sliderValues.llm / 100) +
                    Math.round(1500 * sliderValues.other / 100) +
                    Math.round(500 * sliderValues.unassigned / 100)
                  ).toLocaleString()}
                </div>
                <div className="text-sm text-blue-700">Total Allocated to Organic</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(
                    ((
                      Math.round(8000 * sliderValues.direct / 100) +
                      Math.round(3000 * sliderValues.referral / 100) +
                      Math.round(1500 * sliderValues.llm / 100) +
                      Math.round(1500 * sliderValues.other / 100) +
                      Math.round(500 * sliderValues.unassigned / 100)
                    ) / 31500 * 100)
                  ).toFixed(1)}%
                </div>
                <div className="text-sm text-green-700">Of Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {(
                    12000 + 
                    Math.round(8000 * sliderValues.direct / 100) +
                    Math.round(3000 * sliderValues.referral / 100) +
                    Math.round(1500 * sliderValues.llm / 100) +
                    Math.round(1500 * sliderValues.other / 100) +
                    Math.round(500 * sliderValues.unassigned / 100)
                  ).toLocaleString()}
                </div>
                <div className="text-sm text-gray-700">New Total Organic</div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Traffic Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Monthly Traffic Breakdown</h2>
          <div className="text-center py-8">
            <p className="text-gray-600">Monthly breakdown will be displayed here</p>
          </div>
        </div>

        {/* Comparison Data */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Traffic Source Comparisons</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Month over Month */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Month over Month</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Actual</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Organic</span>
                  <div className="text-right">
                    <div className="font-medium">12,000</div>
                    <div className="text-sm text-green-600">+1,200 (+11.1%)</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Paid</span>
                  <div className="text-right">
                    <div className="font-medium">5,000</div>
                    <div className="text-sm text-red-600">-500 (-9.1%)</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Other</span>
                  <div className="text-right">
                    <div className="font-medium">14,500</div>
                    <div className="text-sm text-green-600">+800 (+5.8%)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Week over Week */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Week over Week</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Actual</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Organic</span>
                  <div className="text-right">
                    <div className="font-medium">3,000</div>
                    <div className="text-sm text-green-600">+300 (+11.1%)</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Paid</span>
                  <div className="text-right">
                    <div className="font-medium">1,250</div>
                    <div className="text-sm text-red-600">-125 (-9.1%)</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Other</span>
                  <div className="text-right">
                    <div className="font-medium">3,625</div>
                    <div className="text-sm text-green-600">+200 (+5.8%)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Year over Year 30 days */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Last 30 days YoY</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Actual</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Organic</span>
                  <div className="text-right">
                    <div className="font-medium">10,800</div>
                    <div className="text-sm text-green-600">+1,200 (+12.5%)</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Paid</span>
                  <div className="text-right">
                    <div className="font-medium">4,500</div>
                    <div className="text-sm text-red-600">-500 (-10.0%)</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Other</span>
                  <div className="text-right">
                    <div className="font-medium">13,050</div>
                    <div className="text-sm text-green-600">+1,450 (+12.5%)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Year over Year 7 days */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Last 7 days YoY</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Actual</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Organic</span>
                  <div className="text-right">
                    <div className="font-medium">2,400</div>
                    <div className="text-sm text-green-600">+240 (+11.1%)</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Paid</span>
                  <div className="text-right">
                    <div className="font-medium">1,000</div>
                    <div className="text-sm text-red-600">-100 (-9.1%)</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Other</span>
                  <div className="text-right">
                    <div className="font-medium">2,900</div>
                    <div className="text-sm text-green-600">+290 (+11.1%)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}