
import React from 'react';
import PuzzlePiece from './PuzzlePiece';

interface PuzzleGridProps {
  targetImage: string;
  answeredMask: boolean[];
  onPieceClick: (index: number) => void;
}

const PuzzleGrid: React.FC<PuzzleGridProps> = ({ targetImage, answeredMask, onPieceClick }) => {
  return (
    <div className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[480px] md:h-[480px] shadow-2xl rounded-xl overflow-hidden">
      <img
        src={targetImage}
        alt="Target"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      />
      <div className="absolute top-0 left-0 w-full h-full grid grid-cols-3 grid-rows-3 z-10">
        {Array.from({ length: answeredMask.length }).map((_, index) => (
          <PuzzlePiece
            key={index}
            index={index}
            isAnswered={answeredMask[index]}
            onClick={() => onPieceClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default PuzzleGrid;
