
import axios from 'axios';
import { Transaction, SearchParams, Stats } from '../types/transaction';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const transactionApi = {
  getTransactions: async (params: SearchParams) => {
    const response = await api.get<Transaction[]>('/api/v1/transactions', { params });
    return response.data;
  },

  getTransaction: async (hash: string) => {
    const response = await api.get<Transaction>(`/api/v1/transactions/${hash}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<Stats>('/api/v1/stats');
    return response.data;
  },
};

// src/components/Statistics.tsx
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

// src/components/TransactionList.tsx
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { transactionApi } from '../services/api';
import { SearchParams, Transaction } from '../types/transaction';

const TransactionList: React.FC = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    pageSize: 50,
  });

  const { data, isLoading, error } = useQuery(
    ['transactions', searchParams],
    () => transactionApi.getTransactions(searchParams),
    {
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  );

  const handlePageChange = (newPage: number) => {
    setSearchParams({ ...searchParams, page: newPage });
  };

  if (isLoading) {
    return <div className="animate-pulse bg-gray-100 p-4 rounded-lg">Loading transactions...</div>;
  }

  if (error) {
    return <div className="bg-red-100 p-4 rounded-lg">Error loading transactions</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hash
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gas Used
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fee (ETH)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fee (USDT)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.map((transaction: Transaction) => (
              <tr key={transaction.hash} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                  <a
                    href={`https://etherscan.io/tx/${transaction.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {`${transaction.hash.slice(0, 6)}...${transaction.hash.slice(-4)}`}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(transaction.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                  {transaction.gasUsed.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  Ξ{transaction.feeInEth.toFixed(6)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  ${transaction.feeInUsdt.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(searchParams.page! - 1)}
            disabled={searchParams.page === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(searchParams.page! + 1)}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;