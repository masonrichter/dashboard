type SummaryData = {
  totalAUM: string;
  totalCampaigns: number;
  activeClients: number;
};

type SummaryItem = {
  label: string;
  value: string | number;
  description: string;
};

export default function DashboardSummary({ data }: { data: SummaryData }) {
  const summaryItems: SummaryItem[] = [
    {
      label: 'Total AUM',
      value: data.totalAUM,
      description: 'Assets Under Management',
    },
    {
      label: 'Total Campaigns',
      value: data.totalCampaigns,
      description: 'Active email campaigns',
    },
    {
      label: 'Active Clients',
      value: data.activeClients,
      description: 'Clients with active services',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {summaryItems.map((item, index) => (
        <div key={index} className="flex items-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-500">{item.label}</p>
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            <p className="text-xs text-gray-400">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}