
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import TransactionList from './components/TransactionList';
import SearchForm from './components/SearchForm';
import Statistics from './components/Statistics';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Uniswap WETH-USDC Transaction Tracker</h1>
        <Statistics />
        <SearchForm />
        <TransactionList />
      </div>
    </QueryClientProvider>
  );
};

export default App;

