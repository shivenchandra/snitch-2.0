import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { storeData, getData } from '../utils/storage';
type CurrencyCode = 'USD' | 'INR';
interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  rate: number; 
}
const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  INR: { code: 'INR', symbol: '₹', rate: 1 },
  USD: { code: 'USD', symbol: '$', rate: 0.012 }, 
};
interface CurrencyContextType {
  currency: CurrencyInfo;
  currencyCode: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (priceInINR: number) => string;
  convertPrice: (priceInINR: number) => number;
}
const STORAGE_KEY = '@snitch_currency';
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);
export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('INR');
  useEffect(() => {
    const load = async () => {
      const saved = await getData<CurrencyCode>(STORAGE_KEY);
      if (saved && CURRENCIES[saved]) {
        setCurrencyCode(saved);
      }
    };
    load();
  }, []);
  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyCode(code);
    storeData(STORAGE_KEY, code);
  }, []);
  const convertPrice = useCallback(
    (priceInINR: number): number => {
      return priceInINR * CURRENCIES[currencyCode].rate;
    },
    [currencyCode]
  );
  const formatPrice = useCallback(
    (priceInINR: number): string => {
      const converted = priceInINR * CURRENCIES[currencyCode].rate;
      const symbol = CURRENCIES[currencyCode].symbol;
      if (currencyCode === 'INR') {
        return `${symbol}${converted.toLocaleString('en-IN', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`;
      }
      return `${symbol}${converted.toFixed(2)}`;
    },
    [currencyCode]
  );
  return (
    <CurrencyContext.Provider
      value={{
        currency: CURRENCIES[currencyCode],
        currencyCode,
        setCurrency,
        formatPrice,
        convertPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
export default CurrencyContext;
