import React, { useState, useEffect } from 'react';
import AdminView from './components/AdminView';
import GameView from './components/GameView';
import { GameConfig, CompletedPuzzle } from './types';
import { DEFAULT_GAME_CONFIGS, APP_BACKGROUND_IMAGES } from './constants';
import { ChevronLeftIcon, ChevronRightIcon } from './components/icons';

type View = 'GAME' | 'ADMIN';

// --- HistoryModal Component ---
interface HistoryModalProps {
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ onClose }) => {
  const [history, setHistory] = useState<CompletedPuzzle[]>([]);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('puzzle-history');
      if (savedHistory) {
        const parsedHistory: CompletedPuzzle[] = JSON.parse(savedHistory);
        // Sort by most recent first
        parsedHistory.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error("Failed to load puzzle history:", error);
      setHistory([]);
    }
  }, []);
  
  const handleClearHistory = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử chơi không?")) {
        localStorage.removeItem('puzzle-history');
        setHistory([]);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md m-4 transform transition-all animate-slide-up border-t-4 border-yellow-400"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-yellow-300">Lịch Sử Hoàn Thành</h3>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
                aria-label="Đóng"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        {history.length > 0 ? (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {history.map((puzzle) => (
              <div key={puzzle.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold text-blue-300">{puzzle.name}</p>
                  <p className="text-xs text-gray-400">
                    Hoàn thành lúc: {new Date(puzzle.completedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">Bạn chưa hoàn thành câu đố nào.</p>
        )}

        {history.length > 0 && (
             <div className="mt-6 flex justify-end">
                <button
                    onClick={handleClearHistory}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition duration-200"
                >
                    Xóa Lịch Sử
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
// --- End of HistoryModal Component ---


const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const App: React.FC = () => {
  const [view, setView] = useState<View>('GAME');
  const [gameConfigs, setGameConfigs] = useState<GameConfig[]>(DEFAULT_GAME_CONFIGS);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [currentBackground, setCurrentBackground] = useState(() => getRandomItem(APP_BACKGROUND_IMAGES));
  const [showHistory, setShowHistory] = useState(false);

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
      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}
      <div className="min-h-screen bg-black/60 backdrop-blur-sm text-white p-4 sm:p-6 lg:p-8 font-sans">
        <div className="absolute top-4 right-4 flex items-center space-x-4 z-20">
          <button
            onClick={() => setShowHistory(true)}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-gray-900 font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Lịch Sử Chơi
          </button>
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
