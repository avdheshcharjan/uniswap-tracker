
import React from 'react';
import { useQuery } from 'react-query';
import { transactionApi } from '../services/api';

const Statistics: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery('stats', transactionApi.getStats, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return <div className="animate-pulse bg-gray-100 p-4 rounded-lg">Loading statistics...</div>;
  }

  if (error) {
    return <div className="bg-red-100 p-4 rounded-lg">Error loading statistics</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Total Fees (USDT)</h3>
        <p className="text-2xl font-bold text-green-600">
          ${stats?.totalFeeUsdt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Total Fees (ETH)</h3>
        <p className="text-2xl font-bold text-blue-600">
          Ξ{stats?.totalFeeEth.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Current ETH/USDT Price</h3>
        <p className="text-2xl font-bold text-purple-600">
          ${stats?.currentEthUsdtPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

