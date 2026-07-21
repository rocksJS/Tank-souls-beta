import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { YandexSDKProvider } from './components/YandexSDKContent';

async function loadYandexSDK(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).YaGames) {
      return resolve((window as any).YaGames);
    }

    const script = document.createElement('script');
    script.src = 'https://yandex.ru/games/sdk/v2';
    script.async = true;

    script.onload = () => resolve((window as any).YaGames);
    script.onerror = () => reject(new Error('Не удалось загрузить SDK'));

    document.head.appendChild(script);
  });
}

async function initYandexSDK() {
  let ysdk = null;

  try {
    const YaGames = await loadYandexSDK();
    ysdk = await YaGames.init({
      screen: {
        fullscreen: true,
        orientation: {
          value: 'portrait',
          lock: true,
        },
      },
    });
    console.log('✅ Yandex Games SDK успешно инициализирован');
    (window as any).ysdk = ysdk;
  } catch (error) {
    console.warn('⚠️ SDK не удалось полностью инициализировать (локальный режим)', error);
  }

  const root = ReactDOM.createRoot(document.getElementById('root')!);
  root.render(
    <React.StrictMode>
      <YandexSDKProvider ysdk={ysdk}>
        {' '}
        {/* ← Обернули App в Provider */}
        <App />
      </YandexSDKProvider>
    </React.StrictMode>
  );
}

initYandexSDK();
