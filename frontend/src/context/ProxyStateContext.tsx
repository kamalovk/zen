import { createContext, useContext, ReactNode, useState } from 'react';
import { ProxyState } from '../types';

type ProxyStateContextType = {
  proxyState: ProxyState;
  setProxyState: (state: ProxyState) => void;
  isProxyRunning: boolean;
};

const ProxyStateContext = createContext<ProxyStateContextType | undefined>(undefined);

export const ProxyStateProvider = ({ children }: { children: ReactNode }) => {
  const [proxyState, setProxyState] = useState<ProxyState>('off');
  const isProxyRunning = proxyState === 'on' || proxyState === 'loading';

  return (
    <ProxyStateContext.Provider value={{ proxyState, setProxyState, isProxyRunning }}>
      {children}
    </ProxyStateContext.Provider>
  );
};

export const useProxyState = () => {
  const context = useContext(ProxyStateContext);
  if (context === undefined) {
    throw new Error('useProxyState must be used within a ProxyStateProvider');
  }
  return context;
};
