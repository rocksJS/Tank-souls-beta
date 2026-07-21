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
    const initPlayer = async () => {
      if (!ysdk) {
        setSdkReady(false);
        return;
      }

      try {
        const playerData = await ysdk.getPlayer();
        setPlayer(playerData);
        setSdkReady(true);
        console.log('✅ Игрок загружен:', playerData.getName?.() || 'Гость');
      } catch (err) {
        console.log('⚠️ Игрок не загружен (локальный режим)');
        setSdkReady(true);
      }
    };

    initPlayer();
  }, [ysdk]);

  return <YandexSDKContext.Provider value={{ ysdk, sdkReady, player }}>{children}</YandexSDKContext.Provider>;
};

export const useYSDK = () => {
  const context = useContext(YandexSDKContext);
  if (context === null) {
    throw new Error('useYSDK должен использоваться внутри YandexSDKProvider');
  }
  return context;
};
