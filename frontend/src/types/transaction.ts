export interface SearchParams {
    hash?: string;
    fromTimestamp?: string;
    toTimestamp?: string;
    page?: number;
    pageSize?: number;
  }

export interface Transaction {
    hash: string;
    blockNumber: number;
    timestamp: string;
    gasUsed: number;
    gasPrice: number;
    ethUsdtPrice: number;
    feeInEth: number;
    feeInUsdt: number;
  }
  
  export interface Stats {
    totalFeeUsdt: number;
    totalFeeEth: number;
    currentEthUsdtPrice: number;
  }
  
  