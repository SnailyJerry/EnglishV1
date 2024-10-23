import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Upload } from 'lucide-react';
import { RecognizedWord } from '../services/imageRecognition';

interface ImageWithWordsProps {
  image: string;
  words: RecognizedWord[];
  onReupload: () => void;
  isLoading: boolean;
}

const ImageWithWords: React.FC<ImageWithWordsProps> = ({ 
  image, 
  words = [], 
  onReupload,
  isLoading 
}) => {
  const [adjustedPositions, setAdjustedPositions] = useState<Array<{x: number, y: number}>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adjustPositions = (words: RecognizedWord[]) => {
      return words.map(word => ({
        x: word.x,
        y: word.y
      }));
    };

    if (words.length > 0) {
      setAdjustedPositions(adjustPositions(words));
    }
  }, [words]);

  const handleWordClick = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative" ref={containerRef}>
        <div className="relative">
          <img 
            src={image} 
            alt="Uploaded" 
            className={`max-w-full h-auto rounded-lg shadow-lg ${isLoading ? 'blur-sm' : ''}`}
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 rounded-lg">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-white font-medium text-shadow">识别中...</p>
            </div>
          )}
        </div>
        
        {!isLoading && words.map((word, index) => {
          const position = adjustedPositions[index] || { x: word.x, y: word.y };
          return (
            <div
              key={index}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ 
                left: `${position.x}%`, 
                top: `${position.y}%`,
                zIndex: 10
              }}
            >
              <div className="inline-flex flex-col transform transition-all duration-300 hover:scale-110 hover:z-30">
                {/* 英文单词卡片 - 调整透明度为80% */}
                <button
                  className="bg-white/80 px-3 py-1.5 rounded-t-md text-sm font-medium text-gray-700 hover:bg-blue-50/90 transition-colors flex items-center justify-between whitespace-nowrap shadow-sm border border-gray-100/80"
                  onClick={() => handleWordClick(word.word)}
                >
                  <span>{word.word}</span>
                  <Volume2 className="w-3.5 h-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                </button>
                
                {/* 中文翻译卡片 - 调整透明度为80% */}
                <div className="bg-gray-800/80 px-3 py-1 rounded-b-md text-xs text-white text-left whitespace-nowrap border-t border-gray-700/80">
                  {word.translation}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-2">
        <button
          onClick={onReupload}
          className="bg-white/80 hover:bg-gray-50/90 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm hover:shadow transition-all"
        >
          <Upload className="w-4 h-4 mr-2" />
          重新上传照片
        </button>
      </div>
    </div>
  );
};

export default ImageWithWords;