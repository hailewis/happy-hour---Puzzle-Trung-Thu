import React, { useState, useEffect, useMemo } from 'react';
import { GameConfig, Notification } from '../types';
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
  const [answeredMask, setAnsweredMask] = useState<boolean[]>(Array(gameConfig.questions.length).fill(false));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isFinalGuessed, setIsFinalGuessed] = useState(false);
  const [finalGuess, setFinalGuess] = useState({ name: '', meaning: '' });

  const answeredCount = useMemo(() => answeredMask.filter(Boolean).length, [answeredMask]);
  const allPiecesSolved = useMemo(() => answeredCount === gameConfig.questions.length, [answeredCount, gameConfig.questions.length]);
  const canMakeFinalGuess = useMemo(() => answeredCount >= 3, [answeredCount]);

  useEffect(() => {
    // This effect now correctly resets the game state when gameConfig.id changes
    setAnsweredMask(Array(gameConfig.questions.length).fill(false));
    setCurrentQuestionIndex(null);
    setNotification(null);
    setIsFinalGuessed(false);
    setFinalGuess({ name: '', meaning: '' });
  }, [gameConfig.id, gameConfig.questions.length]);

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
      setNotification({
        title: "Chúc Mừng, Bạn Đã Thắng!",
        message: `Đáp án chính xác là: ${gameConfig.targetName}. Ý nghĩa: ${gameConfig.targetMeaning}`,
      });
    } else {
      setNotification({ title: "Chưa Đúng Lắm!", message: "Tên của bức hình không chính xác. Hãy nhìn kỹ và thử lại!" });
    }
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
      />
      
      <div className="mt-6">
        <button onClick={handleNextQuestion} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg shadow-md transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" disabled={allPiecesSolved}>
            Câu Chưa Giải Tiếp Theo
        </button>
      </div>

      <div className={`w-full max-w-lg mt-8 p-6 bg-gray-800 rounded-xl shadow-xl transition-opacity duration-500 ${!canMakeFinalGuess || isFinalGuessed ? 'opacity-50 pointer-events-none' : ''}`}>
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
          disabled={!canMakeFinalGuess || isFinalGuessed}
        />
        
        <button
          onClick={handleFinalGuess}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!canMakeFinalGuess || isFinalGuessed}
        >
          Gửi Đáp Án Cuối Cùng
        </button>
        {isFinalGuessed && (
            <div className="mt-4 p-4 bg-green-900 border border-green-700 rounded-lg">
                <p className="font-bold text-green-300">TÊN BỨC HÌNH: {gameConfig.targetName}</p>
                <p className="text-sm text-green-400 mt-1">Ý NGHĨA: {gameConfig.targetMeaning}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default GameView;