import React from 'react';

interface PuzzlePieceProps {
  index: number;
  isAnswered: boolean;
  onClick: () => void;
}

const PuzzlePiece: React.FC<PuzzlePieceProps> = ({ index, isAnswered, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        flex flex-col justify-center items-center cursor-pointer 
        border border-yellow-400/30 transform transition-all duration-700 ease-in-out
        ${isAnswered 
          ? 'opacity-0 scale-110 pointer-events-none' // Animate to this state
          : 'bg-indigo-900 text-yellow-300 hover:bg-indigo-800 opacity-100 scale-100' // Initial state
        }
      `}
    >
      {/* Content is always rendered, but will become invisible due to parent's opacity change */}
      <>
        <span className="text-2xl font-bold">?</span>
        <p className="text-xs mt-1">Câu hỏi {index + 1}</p>
      </>
    </div>
  );
};

export default PuzzlePiece;