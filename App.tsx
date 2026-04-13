import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import Sidebar from './components/Sidebar';
import { GameState, Tank } from './types';
import { LEVELS, PLAYER_MAX_HP, generateRandomMap, getLastItemInArray } from './constants';

const SAVE_KEY = 'tank_souls_save_data_v1';
const LEVEL_COUNT = 5;

const App: React.FC = () => {
  // --- State Initialization with LocalStorage ---
  const getSavedData = () => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to load save', e);
      return null;
    }
  };

  // Attempt to load saved game state from local storage
  const savedData = getSavedData(); // Get saved game state from local storage, if any <-- Windsurf Testing by me

  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  // Keep score persistent so users can save up for items across sessions
  const [score, setScore] = useState<number>(savedData?.score ?? 0);
  const [enemiesLeft, setEnemiesLeft] = useState<number>(20);

  const [levelMap, setLevelMap] = useState<[]>(savedData?.levelMap ?? []);
  const [level, setLevel] = useState<number | string>(savedData?.unlockedLevel ?? 1); // Start at latest unlocked (Возврат к состоянию приложения)

  const [levelCount, setLevelCount] = useState<number>(savedData?.levelCount ?? LEVEL_COUNT); // Количество ингейм уровней (Возврат к состоянию приложения)

  const [unlockedLevel, setUnlockedLevel] = useState<number>(savedData?.unlockedLevel ?? 1);

  const [gameSessionId, setGameSessionId] = useState<number>(0);
  const [isGameInProgress, setIsGameInProgress] = useState<boolean>(false);
  const [deathCount, setDeathCount] = useState<number>(savedData?.deathCount ?? 0);
  const [playerHp, setPlayerHp] = useState<number>(PLAYER_MAX_HP);

  // Shop Items State
  const [estusUnlocked, setEstusUnlocked] = useState<boolean>(savedData?.estusUnlocked ?? false);
  const [estusCharges, setEstusCharges] = useState<number>(3);
  const [boneUnlocked, setBoneUnlocked] = useState<boolean>(savedData?.boneUnlocked ?? false);

  // --- Persistence Effect ---
  useEffect(() => {
    const dataToSave = {
      // Можно сохранять скор, левелы, кол-во смертей, эстус и статус разблокированной кости. (В магазине есть товар под названием "Bone", это статус для того, чтобы она была включена)
      // Я сделал это для разработки, так сказать /run dev, в билде для игры обычного пользователя 'Bone' не должен быть доступен с нулевой, а только доступен для покупки игроку.
      // В будущем я сделаю для этого пасхалку чит-код ROCKSJS.
      score,
      unlockedLevel,
      deathCount,
      levelCount,
      levelMap,
      estusUnlocked,
      boneUnlocked,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
  }, [score, unlockedLevel, levelCount, levelMap, deathCount, estusUnlocked, boneUnlocked]);

  // Handle Victory unlocking logic and game progress state
  useEffect(() => {
    if (gameState === GameState.VICTORY) {
      setIsGameInProgress(false);
      // Allow unlocking up to Level 4
      // Removed bug where level 4 was not unlocked
      if (level === unlockedLevel && level) {
        setUnlockedLevel((prev) => prev + 1);
      }
    } else if (gameState === GameState.GAME_OVER) {
      setIsGameInProgress(false);
    }
  }, [gameState, level, unlockedLevel]);

  const startGame = () => {
    setGameSessionId((prev) => prev + 1); // добавляем +1 к количеству гейм сессий, число хранится так же как число смертей
    setGameState(GameState.PLAYING); // Start the game
    setEnemiesLeft(20);
    setIsGameInProgress(true);
    setPlayerHp(PLAYER_MAX_HP);
    setEstusCharges(3);
    // console.log('старт гейм');

    // Reset Estus charges on level start if unlocked
    if (estusUnlocked) {
      setEstusCharges(3);
      // console.log(estusCharges, 'estus Charges in estusUnlocked()');
    } else {
      setEstusCharges(0);
    }
  };

  const startGameTesting = () => {
    // написать функцию инициализации для режима.

    //generateLevelMap();
    //generateMobs();
    // console.log('старт гейм стори');

    setGameSessionId((prev) => prev + 1); // добавляем +1 к количеству гейм сессий, число хранится так же как число смертей
    setGameState(GameState.PLAYING); // Start the game
    setIsGameInProgress(true);
    setPlayerHp(PLAYER_MAX_HP);

    const generatedMap = generateRandomMap();
    LEVELS[LEVELS.length - 1] = generatedMap; // некст нужно парсить из константы в локал сторадже. Тогда у нас будет доступ до карты постоянно.
    // Сохраняем в локал сторадж. Все работает.
    setLevel(LEVELS.length); // LEVEL_0 ПОКА ЧТО РАБОТАЕТ. НЕ ТРОГАТЬ.
    setLevelMap(generatedMap); // Записываем карту в стейт.
    // Эта хуйня юзлесс пушто где-то в коде лвл берется из LEVELS массива именно
    // Я буду это рефакторить потом когда мне будет не настолько в падлу
    // А щаспопробуем сделать пятого босса!ы

    // console.log(LEVELS, 'levels in startgameTsting');

    // setLevelMap(levelMap) // set Level Map State

    // setLevelMap

    // renderLevelButton(0);

    // setEnemiesLeft(20);
    // setIsGameInProgress(true);
    // setPlayerHp(PLAYER_MAX_HP);

    // Reset Estus charges on level start if unlocked
    if (estusUnlocked) {
      setEstusCharges(3);
    } else {
      setEstusCharges(0);
    }
  };

  const resumeGame = () => {
    setGameState(GameState.PLAYING);
  };

  const handlePlayerDeath = () => {
    setDeathCount((prev) => prev + 1);
    setPlayerHp(0);
  };

  const resetProgress = () => {
    // console.log('...Reseting progress...');
    localStorage.removeItem(SAVE_KEY);
    setScore(0);
    setUnlockedLevel(1);
    setLevel(1);
    setDeathCount(0);
    setLevelMap([]);
    setEstusUnlocked(false);
    setEstusCharges(0);
    setBoneUnlocked(false);
    setGameState(GameState.MENU); // Force menu refresh
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-32 pb-12">
      <div className="relative">
        <div className="relative border-[4px] border-[#333] rounded shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-[#1a1a1a] flex">
          {/* TV Scanline effect (subtler for Tank Souls) */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(0,0,0,0.03),rgba(0,0,0,0.03))] z-30 pointer-events-none bg-[length:100%_4px,3px_100%] rounded-lg"></div>

          {/* Game Area Wrapper: Contains Canvas, Fog, and UI Overlay */}
          <div className="relative">
            {/* Canvas & Fog (Blurred when in Menu) */}
            <div className={`relative transition-all duration-1000 ${gameState === GameState.MENU ? 'blur-[4px] brightness-125' : ''}`}>
              <GameCanvas
                gameState={gameState}
                setGameState={setGameState}
                setScore={setScore}
                setEnemiesLeft={setEnemiesLeft}
                level={level}
                levelCount={levelCount}
                levelMap={levelMap}
                gameSessionId={gameSessionId}
                onPlayerDeath={handlePlayerDeath}
                estusUnlocked={estusUnlocked}
                estusCharges={estusCharges}
                setEstusCharges={setEstusCharges}
                infiniteEstus={boneUnlocked && unlockedLevel >= 4}
                setPlayerHp={setPlayerHp}
              />

              {/* Fog Overlay for Menu Ambience - Persistent on all levels */}
              <div
                className="absolute inset-0 z-10 pointer-events-none mix-blend-screen opacity-40 animate-fog-slide"
                style={{
                  backgroundImage: `
                                linear-gradient(to right, transparent 0%, rgba(255,255,255,0.2) 20%, transparent 40%),
                                radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1), transparent 70%)
                            `,
                  backgroundSize: '200% 100%',
                }}
              ></div>
              {/* Static ambient glow for extra "souls" mist feel */}
              <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-white/10 via-transparent to-white/5 mix-blend-screen"></div>
            </div>

            {/* UI Overlay sits on top of the blur, aligned with game area */}
            <div className="absolute inset-0 z-20 pointer-events-none">
              <UIOverlay
                gameState={gameState}
                setGameState={setGameState}
                score={score}
                setScore={setScore}
                enemiesLeft={enemiesLeft}
                startGame={startGame}
                startGameTesting={startGameTesting}
                resumeGame={resumeGame}
                level={level}
                setLevel={setLevel}
                levelCount={levelCount}
                levelMap={levelMap}
                unlockedLevel={unlockedLevel}
                setUnlockedLevel={setUnlockedLevel}
                isGameInProgress={isGameInProgress}
                deathCount={deathCount}
                estusUnlocked={estusUnlocked}
                setEstusUnlocked={setEstusUnlocked}
                boneUnlocked={boneUnlocked}
                setBoneUnlocked={setBoneUnlocked}
                resetProgress={resetProgress}
              />
            </div>
          </div>

          <Sidebar
            enemiesLeft={enemiesLeft}
            score={score}
            level={level}
            setGameState={setGameState}
            playerHp={playerHp}
            estusCharges={estusCharges}
          />
        </div>

        {/* Decorative details    PREPARE TO DIE EDITION */}
        <div className="absolute -bottom-12 left-0 w-full flex justify-center text-[#444] font-gothic text-xl opacity-50"></div>
      </div>
      <div
        className={`text-xs text-gray-500 tracking-widest uppercase animate-pulse mt-8 pointer-events-auto ${
          isGameInProgress ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {isGameInProgress ? '​ ​' : 'Press [SPACE] to Start'}
      </div>
    </div>
  );
};

export default App;
