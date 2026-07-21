import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface YandexSDKContextType {
  ysdk: any;
  sdkReady: boolean;
  player: any;
}

const YandexSDKContext = createContext<YandexSDKContextType | null>(null);

export const YandexSDKProvider: React.FC<{ children: ReactNode; ysdk: any }> = ({ children, ysdk }) => {
  const [sdkReady, setSdkReady] = useState(false);
  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      if (!ysdk) {
        setSdkReady(false);
        return;
      }

      try {
        const playerData = await ysdk.getPlayer();
        setPlayer(playerData);
        setSdkReady(true);
        console.log('✅ Игрок получен:', playerData.getName?.() || 'Гость');
      } catch (err) {
        console.log('⚠️ SDK подключён, но игрок не получен (локальный режим)');
        setSdkReady(true);
      }
    };

    init();
  }, [ysdk]);

  return <YandexSDKContext.Provider value={{ ysdk, sdkReady, player }}>{children}</YandexSDKContext.Provider>;
};

// Хук для удобного использования
export const useYSDK = () => {
  const context = useContext(YandexSDKContext);
  if (!context) {
    throw new Error('useYSDK должен использоваться внутри YandexSDKProvider');
  }
  return context;
};
