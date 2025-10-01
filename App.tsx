import React, { useState } from 'react';
import AdminView from './components/AdminView';
import GameView from './components/GameView';
import { GameConfig } from './types';
import { DEFAULT_GAME_CONFIGS, APP_BACKGROUND_IMAGES } from './constants';
import { ChevronLeftIcon, ChevronRightIcon } from './components/icons';

type View = 'GAME' | 'ADMIN';

const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const App: React.FC = () => {
  const [view, setView] = useState<View>('GAME');
  const [gameConfigs, setGameConfigs] = useState<GameConfig[]>(DEFAULT_GAME_CONFIGS);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [currentBackground, setCurrentBackground] = useState(() => getRandomItem(APP_BACKGROUND_IMAGES));

  const handleConfigSave = (updatedConfigs: GameConfig[]) => {
    setGameConfigs(updatedConfigs);
    setView('GAME');
  };
  
  const handleNext = () => {
    if (currentPuzzleIndex < gameConfigs.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
      // Set a new random background, try to avoid the current one
      let newBg = getRandomItem(APP_BACKGROUND_IMAGES);
      if (APP_BACKGROUND_IMAGES.length > 1) {
          while (newBg === currentBackground) {
              newBg = getRandomItem(APP_BACKGROUND_IMAGES);
          }
      }
      setCurrentBackground(newBg);
    }
  };

  const handlePrev = () => {
    if (currentPuzzleIndex > 0) {
      setCurrentPuzzleIndex(currentPuzzleIndex - 1);
       // Set a new random background, try to avoid the current one
       let newBg = getRandomItem(APP_BACKGROUND_IMAGES);
       if (APP_BACKGROUND_IMAGES.length > 1) {
           while (newBg === currentBackground) {
               newBg = getRandomItem(APP_BACKGROUND_IMAGES);
           }
       }
       setCurrentBackground(newBg);
    }
  };

  const currentConfig = gameConfigs[currentPuzzleIndex];

  return (
    <div 
      style={{ backgroundImage: `url(${currentBackground})`}}
      className="min-h-screen bg-cover bg-center bg-fixed transition-all duration-500"
    >
      <div className="min-h-screen bg-black/60 backdrop-blur-sm text-white p-4 sm:p-6 lg:p-8 font-sans">
        <div className="absolute top-4 right-4 flex items-center space-x-4 z-20">
          <button
            onClick={() => setView(view === 'GAME' ? 'ADMIN' : 'GAME')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            {view === 'GAME' ? 'Bảng Quản Trị' : 'Chơi Ngay'}
          </button>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-yellow-300 tracking-tight">
              Đoán Puzzle rước Trung Thu
            </h1>
            <p className="text-lg text-blue-200 mt-2">
              Trả lời câu hỏi để khám phá bức hình bí ẩn!
            </p>
          </header>

          <div className="flex items-center justify-center space-x-4 my-6">
            <button onClick={handlePrev} disabled={currentPuzzleIndex === 0} className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors">
              <ChevronLeftIcon className="w-6 h-6"/>
            </button>
            <span className="text-xl font-semibold text-yellow-300 tabular-nums">Câu Đố {currentPuzzleIndex + 1} / {gameConfigs.length}</span>
            <button onClick={handleNext} disabled={currentPuzzleIndex === gameConfigs.length - 1} className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors">
              <ChevronRightIcon className="w-6 h-6"/>
            </button>
          </div>

          <main>
            {view === 'GAME' ? (
              <GameView key={currentConfig.id} gameConfig={currentConfig} />
            ) : (
              <AdminView
                allConfigs={gameConfigs}
                currentConfigIndex={currentPuzzleIndex}
                onSave={handleConfigSave}
                setCurrentConfigIndex={setCurrentPuzzleIndex}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;