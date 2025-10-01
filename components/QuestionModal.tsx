
import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import Timer from './Timer';
import { QUESTION_TIME_LIMIT_SECONDS } from '../constants';

interface QuestionModalProps {
  question: Question;
  onClose: () => void;
  onSubmit: (answer: string) => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ question, onClose, onSubmit }) => {
  const [answer, setAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer);
    }
  };

  const handleTimeUp = () => {
    onSubmit(""); // Submit empty answer when time is up, treated as incorrect
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-lg m-4 transform transition-all animate-slide-up border-t-4 border-yellow-400"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-yellow-300">Thời Gian Trả Lời!</h3>
          <Timer initialSeconds={QUESTION_TIME_LIMIT_SECONDS} onTimeUp={handleTimeUp} />
        </div>

        <p className="text-lg text-blue-200 mb-6 min-h-[6rem]">{question.q}</p>

        {/* Hint Section */}
        {question.hint && (
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="text-sm text-yellow-400 hover:text-yellow-300 underline"
                >
                    {showHint ? 'Ẩn Gợi Ý' : 'Cần một gợi ý?'}
                </button>
                {showHint && (
                    <div className="mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg animate-fade-in">
                        <p className="text-sm text-yellow-200 italic">{question.hint}</p>
                    </div>
                )}
            </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="answer-input" className="block text-sm font-medium text-gray-300 mb-2">Câu Trả Lời Của Bạn:</label>
          <input
            id="answer-input"
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Nhập câu trả lời của bạn tại đây..."
            autoFocus
          />

          {showAnswer && (
            <div className="mt-4 p-3 bg-green-900 border border-green-700 rounded-lg animate-fade-in">
              <p className="text-sm font-semibold text-green-300">Đáp Án Đúng:</p>
              <p className="text-md text-white font-mono">{question.a.join(', ')}</p>
            </div>
          )}
          
          <div className="mt-6 flex justify-between items-center">
             <button
              type="button"
              onClick={() => setShowAnswer(!showAnswer)}
              className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition duration-200"
            >
              {showAnswer ? 'Ẩn Đáp Án' : 'Hiện Đáp Án'}
            </button>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition duration-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50"
                disabled={!answer.trim()}
              >
                Nộp
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionModal;