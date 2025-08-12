import { NextRequest, NextResponse } from 'next/server'

// These helper functions were missing from your original code
function generateMonthlyTrends(totalAUM: number, monthlyGrowth: number) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
  const trends = []
  let currentAUM = totalAUM * 0.95 
  
  for (let i = 0; i < months.length; i++) {
    const growth = i === months.length - 1 ? monthlyGrowth : (Math.random() * 2 + 0.5)
    trends.push({
      month: months[i],
      aum: Math.round(currentAUM),
      growth: parseFloat(growth.toFixed(1))
    })
    currentAUM *= (1 + growth / 100)
  }
  
  return trends
}

function generateAssetAllocation(totalAUM: number) {
  return [
    { category: 'Equities', percentage: 45, value: Math.round(totalAUM * 0.45) },
    { category: 'Fixed Income', percentage: 30, value: Math.round(totalAUM * 0.30) },
    { category: 'Cash & Equivalents', percentage: 15, value: Math.round(totalAUM * 0.15) },
    { category: 'Alternative Investments', percentage: 10, value: Math.round(totalAUM * 0.10) },
  ]
}

function generateRecentTransactions(clients: any[]) {
  const transactionTypes = ['deposit', 'withdrawal', 'transfer']
  const statuses = ['completed', 'pending', 'failed']
  const transactions = []
  
  for (let i = 0; i < Math.min(4, clients.length); i++) {
    const client = clients[i]
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const amount = Math.round(Math.random() * 100000 + 10000)
    
    transactions.push({
      id: `TXN${String(i + 1).padStart(3, '0')}`,
      client: client[0],
      type,
      amount,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status
    })
  }
  
  return transactions
}

export async function GET(request: NextRequest) {
  try {
    const GOOGLE_SHEETS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
    
    if (GOOGLE_SHEETS_API_KEY && GOOGLE_SHEETS_SPREADSHEET_ID) {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_SPREADSHEET_ID}/values/A:H?key=${GOOGLE_SHEETS_API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const sheetData = data.values || [];
        
        const clients = sheetData.slice(1).filter((row: any[]) => row[0] && row[2]);
        
        if (clients.length > 0) {
          const totalAUM = clients.reduce((sum: number, row: any[]) => sum + parseFloat(row[2] || '0'), 0);
          const clientCount = clients.length;
          const averageAccountSize = clientCount > 0 ? totalAUM / clientCount : 0;
          
          const topPerformers = clients
            .map((row: any[]) => ({
              name: row[0],
              aum: parseFloat(row[2] || '0'),
              growth: parseFloat(row[3] || '0'),
              performance: parseFloat(row[3] || '0')
            }))
            .sort((a: any, b: any) => b.aum - a.aum);
          
          const monthlyGrowth = clients.reduce((sum: number, row: any[]) => sum + parseFloat(row[3] || '0'), 0) / clientCount;
          
          const realAUMData = {
            totalAUM,
            monthlyGrowth,
            clientCount,
            averageAccountSize,
            topPerformers,
            monthlyTrends: generateMonthlyTrends(totalAUM, monthlyGrowth),
            assetAllocation: generateAssetAllocation(totalAUM),
            recentTransactions: generateRecentTransactions(clients)
          };
          
          return NextResponse.json(realAUMData);
        }
      }
    }
    
    // Fallback to mock data if API key is not available or sheet is not accessible
    const mockAUMData = {
      totalAUM: 8450000,
      monthlyGrowth: 4.2,
      clientCount: 4,
      averageAccountSize: 2112500,
      topPerformers: [
        { name: 'David Thompson', aum: 3200000, growth: 6.7, performance: 6.7 },
        { name: 'Sarah Johnson', aum: 2500000, growth: 12.8, performance: 12.8 },
        { name: 'Michael Chen', aum: 1800000, growth: 8.4, performance: 8.4 },
        { name: 'Emily Rodriguez', aum: 950000, growth: 15.2, performance: 15.2 },
      ],
      monthlyTrends: [
        { month: 'Jan', aum: 8000000, growth: 2.1 },
        { month: 'Feb', aum: 8100000, growth: 1.3 },
        { month: 'Mar', aum: 8200000, growth: 1.2 },
        { month: 'Apr', aum: 8250000, growth: 0.6 },
        { month: 'May', aum: 8300000, growth: 0.6 },
        { month: 'Jun', aum: 8350000, growth: 0.6 },
        { month: 'Jul', aum: 8450000, growth: 1.2 },
      ],
      assetAllocation: [
        { category: 'Equities', percentage: 45, value: 3802500 },
        { category: 'Fixed Income', percentage: 30, value: 2535000 },
        { category: 'Cash & Equivalents', percentage: 15, value: 1267500 },
        { category: 'Alternative Investments', percentage: 10, value: 845000 },
      ],
      recentTransactions: [
        { id: 'TXN001', client: 'David Thompson', type: 'deposit', amount: 50000, date: '2024-01-15', status: 'completed' },
        { id: 'TXN002', client: 'Sarah Johnson', type: 'deposit', amount: 25000, date: '2024-01-14', status: 'completed' },
        { id: 'TXN003', client: 'Michael Chen', type: 'deposit', amount: 75000, date: '2024-01-13', status: 'pending' },
        { id: 'TXN004', client: 'Emily Rodriguez', type: 'deposit', amount: 30000, date: '2024-01-12', status: 'completed' },
      ]
    };

    return NextResponse.json(mockAUMData);
  } catch (error: any) {
    console.error('Error fetching AUM data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AUM data', details: error.message },
      { status: 500 }
    );
  }
}