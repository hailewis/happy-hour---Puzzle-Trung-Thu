
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GameConfig, Notification, CompletedPuzzle } from '../types';
import PuzzleGrid from './PuzzleGrid';
import QuestionModal from './QuestionModal';
import NotificationModal from './NotificationModal';

interface GameViewProps {
  gameConfig: GameConfig;
}

const normalizeAnswer = (input: string): string => {
  if (!input) return "";
  return input.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, ' ');
};

const GameView: React.FC<GameViewProps> = ({ gameConfig }) => {
  const [answeredMask, setAnsweredMask] = useState<boolean[]>(() => {
    try {
      const savedProgress = localStorage.getItem(`puzzle-progress-${gameConfig.id}`);
      if (savedProgress) {
        const parsedMask = JSON.parse(savedProgress);
        if (Array.isArray(parsedMask) && parsedMask.length === gameConfig.questions.length) {
          return parsedMask;
        }
      }
    } catch (error) {
      console.error("Failed to load progress from localStorage:", error);
    }
    return Array(gameConfig.questions.length).fill(false);
  });
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isFinalGuessed, setIsFinalGuessed] = useState(false);
  const [finalGuess, setFinalGuess] = useState({ name: '', meaning: '' });
  const [lastCorrectAnswerIndex, setLastCorrectAnswerIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const answeredCount = useMemo(() => answeredMask.filter(Boolean).length, [answeredMask]);
  const allPiecesSolved = useMemo(() => answeredCount === gameConfig.questions.length, [answeredCount, gameConfig.questions.length]);
  const canMakeFinalGuess = useMemo(() => answeredCount >= 3, [answeredCount]);
  
  // Effect to manage background ambient sound
  useEffect(() => {
    // Using a ref to persist the audio object across renders without re-creating it
    if (!audioRef.current) {
        audioRef.current = new Audio('https://cdn.pixabay.com/audio/2022/10/10/audio_b28d548f47.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.2; // Set a soft volume
    }
    
    // Play the audio, handling potential browser restrictions
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Audio autoplay was prevented by the browser:", error);
        // User interaction will be needed to start audio in some browsers.
      });
    }

    // Cleanup function to run when the component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount


  // Effect to save progress to localStorage whenever it changes
  useEffect(() => {
    try {
      if (!isFinalGuessed) {
        localStorage.setItem(`puzzle-progress-${gameConfig.id}`, JSON.stringify(answeredMask));
      }
    } catch (error) {
      console.error("Failed to save progress to localStorage:", error);
    }
  }, [answeredMask, gameConfig.id, isFinalGuessed]);

  // Effect to load progress and reset game state when the puzzle (gameConfig.id) changes
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(`puzzle-progress-${gameConfig.id}`);
      if (savedProgress) {
        const parsedMask = JSON.parse(savedProgress);
        if (Array.isArray(parsedMask) && parsedMask.length === gameConfig.questions.length) {
          setAnsweredMask(parsedMask);
        } else {
          setAnsweredMask(Array(gameConfig.questions.length).fill(false));
        }
      } else {
        setAnsweredMask(Array(gameConfig.questions.length).fill(false));
      }
    } catch (error) {
      console.error("Failed to load progress on puzzle change:", error);
      setAnsweredMask(Array(gameConfig.questions.length).fill(false));
    }

    // Reset other game state
    setCurrentQuestionIndex(null);
    setNotification(null);
    setIsFinalGuessed(false);
    setFinalGuess({ name: '', meaning: '' });
    setLastCorrectAnswerIndex(null);
  }, [gameConfig.id, gameConfig.questions.length]);


  useEffect(() => {
    if (lastCorrectAnswerIndex !== null) {
      const timer = setTimeout(() => {
        setLastCorrectAnswerIndex(null);
      }, 700); // Duration should match the animation in index.html
      return () => clearTimeout(timer);
    }
  }, [lastCorrectAnswerIndex]);

  const handlePieceClick = (index: number) => {
    if (answeredMask[index] || isFinalGuessed) return;
    setCurrentQuestionIndex(index);
  };
  
  const handleNextQuestion = () => {
      const nextIndex = answeredMask.findIndex(answered => !answered);
      if(nextIndex !== -1) {
          setCurrentQuestionIndex(nextIndex);
      } else {
          setNotification({title: "Hoàn Thành!", message: "Bạn đã trả lời tất cả câu hỏi! Giờ là lúc cho lần đoán cuối cùng."})
      }
  }

  const handleAnswerSubmit = (userAnswer: string) => {
    if (currentQuestionIndex === null) return;
    const question = gameConfig.questions[currentQuestionIndex];
    const normalizedUserAnswer = normalizeAnswer(userAnswer);

    const isCorrect = question.a.some(correctAnswer => normalizeAnswer(correctAnswer) === normalizedUserAnswer);

    if (isCorrect) {
      try {
        const correctSound = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_2b28b1eb7d.mp3');
        correctSound.volume = 0.5;
        correctSound.play().catch(e => console.error("Error playing sound:", e));
      } catch (error) {
          console.error("Could not play audio:", error);
      }

      setLastCorrectAnswerIndex(currentQuestionIndex);
      setAnsweredMask(prev => {
        const newMask = [...prev];
        newMask[currentQuestionIndex] = true;
        return newMask;
      });
      setNotification({ title: "Chính Xác!", message: "Bạn đã mở được một mảnh ghép. Tiếp tục nào!" });
      if (answeredCount + 1 === gameConfig.questions.length) {
        setTimeout(() => setNotification({ title: "Đã Mở Tất Cả Mảnh Ghép!", message: "Bây giờ, hãy đoán tên và ý nghĩa của bức hình!" }), 600);
      }
    } else {
      setNotification({ title: "Không Chính Xác!", message: "Đó không phải là câu trả lời đúng. Hãy thử câu hỏi khác hoặc thử lại câu này sau." });
    }
    setCurrentQuestionIndex(null);
  };

  const handleFinalGuess = () => {
    if (isFinalGuessed) return;
    const isNameCorrect = normalizeAnswer(finalGuess.name) === normalizeAnswer(gameConfig.targetName);

    if (isNameCorrect) {
      setIsFinalGuessed(true);
      localStorage.removeItem(`puzzle-progress-${gameConfig.id}`);
      setNotification({
        title: "Chúc Mừng, Bạn Đã Thắng!",
        message: `Đáp án chính xác là: ${gameConfig.targetName}. Ý nghĩa: ${gameConfig.targetMeaning}`,
      });
      
      // Save to history on correct final guess
      try {
        const savedHistory = localStorage.getItem('puzzle-history');
        const history: CompletedPuzzle[] = savedHistory ? JSON.parse(savedHistory) : [];
        
        const isAlreadyCompleted = history.some(p => p.id === gameConfig.id);
        
        if (!isAlreadyCompleted) {
          const newHistoryEntry: CompletedPuzzle = {
            id: gameConfig.id,
            name: gameConfig.targetName,
            completedAt: new Date().toISOString(),
          };
          const updatedHistory = [...history, newHistoryEntry];
          localStorage.setItem('puzzle-history', JSON.stringify(updatedHistory));
        }
      } catch (error) {
        console.error("Failed to save to puzzle history:", error);
      }

    } else {
      setNotification({ title: "Chưa Đúng Lắm!", message: "Tên của bức hình không chính xác. Hãy nhìn kỹ và thử lại!" });
    }
  };

  const handleReset = () => {
    const initialMask = Array(gameConfig.questions.length).fill(false);
    setAnsweredMask(initialMask);

    try {
      localStorage.removeItem(`puzzle-progress-${gameConfig.id}`);
    } catch (error) {
      console.error("Failed to clear progress from localStorage:", error);
    }

    setIsFinalGuessed(false);
    setFinalGuess({ name: '', meaning: '' });
    setNotification(null);
    setCurrentQuestionIndex(null);
    setLastCorrectAnswerIndex(null);
  };


  return (
    <div className="flex flex-col items-center animate-fade-in">
      {currentQuestionIndex !== null && (
        <QuestionModal
          key={currentQuestionIndex}
          question={gameConfig.questions[currentQuestionIndex]}
          onClose={() => setCurrentQuestionIndex(null)}
          onSubmit={handleAnswerSubmit}
        />
      )}

      {notification && (
        <NotificationModal
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <p className="mb-4 text-lg font-medium text-blue-300">
        Số Mảnh Đã Mở: {answeredCount} / {gameConfig.questions.length}
      </p>

      <PuzzleGrid
        targetImage={gameConfig.targetImage}
        answeredMask={answeredMask}
        onPieceClick={handlePieceClick}
        lastCorrectAnswerIndex={lastCorrectAnswerIndex}
      />
      
      <div className="mt-6">
        <button onClick={handleNextQuestion} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg shadow-md transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" disabled={allPiecesSolved || isFinalGuessed}>
            Câu Chưa Giải Tiếp Theo
        </button>
      </div>

      {!isFinalGuessed && (
        <div className={`w-full max-w-lg mt-8 p-6 bg-gray-800 rounded-xl shadow-xl transition-opacity duration-500 ${!canMakeFinalGuess ? 'opacity-50 pointer-events-none' : ''}`}>
          <p className="text-center text-blue-300 italic mb-4">
            Gợi ý: "{gameConfig.targetTheme}"
          </p>
          <h2 className="text-xl font-bold text-yellow-300 mb-4 border-b border-yellow-400 pb-2">Đoán Lần Cuối</h2>
          
          <label htmlFor="name-guess" className="block text-sm font-medium text-gray-300 mb-1">Tên Bức Hình:</label>
          <input
            type="text"
            id="name-guess"
            value={finalGuess.name}
            onChange={(e) => setFinalGuess(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 mb-4"
            placeholder="Nhập tên tại đây..."
            disabled={!canMakeFinalGuess}
          />
          
          <button
            onClick={handleFinalGuess}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canMakeFinalGuess}
          >
            Gửi Đáp Án Cuối Cùng
          </button>
        </div>
      )}

      {isFinalGuessed && (
          <div className="w-full max-w-lg mt-8 p-6 bg-green-900 border border-green-700 rounded-lg animate-fade-in">
              <p className="font-bold text-green-300">TÊN BỨC HÌNH: {gameConfig.targetName}</p>
              <p className="text-sm text-green-400 mt-1">Ý NGHĨA: {gameConfig.targetMeaning}</p>
              <button
                  onClick={handleReset}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
              >
                  Chơi Lại Câu Đố Này
              </button>
          </div>
      )}
    </div>
  );
};

export default GameView;
