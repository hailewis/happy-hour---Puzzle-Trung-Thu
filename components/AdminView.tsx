import React, { useState, useEffect } from 'react';
import { GameConfig, Question } from '../types';
import { generateQuestions } from '../services/geminiService';
import { SparklesIcon, UploadIcon, TrashIcon, PlusIcon } from './icons';
import { TOTAL_QUESTIONS_PER_PUZZLE, PUZZLE_BACKGROUND_IMAGES } from '../constants';

interface AdminViewProps {
  allConfigs: GameConfig[];
  currentConfigIndex: number;
  onSave: (newConfigs: GameConfig[]) => void;
  setCurrentConfigIndex: (index: number) => void;
}

const AdminView: React.FC<AdminViewProps> = ({ allConfigs, currentConfigIndex, onSave, setCurrentConfigIndex }) => {
  const [currentConfig, setCurrentConfig] = useState<GameConfig>(allConfigs[currentConfigIndex]);
  const [imagePreview, setImagePreview] = useState<string | null>(allConfigs[currentConfigIndex].targetImage);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiTheme, setAiTheme] = useState<string>('Tết Trung Thu Việt Nam');

  useEffect(() => {
    setCurrentConfig(allConfigs[currentConfigIndex]);
    setImagePreview(allConfigs[currentConfigIndex].targetImage);
  }, [currentConfigIndex, allConfigs]);

  const updateCurrentConfigInList = (updatedConfig: GameConfig) => {
    const newConfigs = [...allConfigs];
    newConfigs[currentConfigIndex] = updatedConfig;
    return newConfigs;
  };

  const handleFieldChange = (field: keyof GameConfig, value: any) => {
    const updatedConfig = { ...currentConfig, [field]: value };
    setCurrentConfig(updatedConfig);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        handleFieldChange('targetImage', result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuestionChange = (index: number, field: 'q' | 'a' | 'hint', value: string) => {
    const newQuestions = [...currentConfig.questions];
    if (field === 'a') {
      newQuestions[index] = { ...newQuestions[index], [field]: value.split(',').map(s => s.trim()) };
    } else {
      newQuestions[index] = { ...newQuestions[index], [field]: value };
    }
    handleFieldChange('questions', newQuestions);
  };
  
  const handleDeleteQuestion = (qIndex: number) => {
    const newQuestions = currentConfig.questions.filter((_, index) => index !== qIndex);
    handleFieldChange('questions', newQuestions);
  }

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      q: 'Câu hỏi mới',
      a: ['Đáp án mới'],
      hint: 'Gợi ý mới'
    };
    handleFieldChange('questions', [...currentConfig.questions, newQuestion]);
  }

  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    setAiError(null);
    try {
      const generated = await generateQuestions(aiTheme);
      const newQuestions = generated.map((q, index) => ({ ...q, id: index }));
      handleFieldChange('questions', newQuestions);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddNewPuzzle = () => {
    const randomImage = PUZZLE_BACKGROUND_IMAGES[Math.floor(Math.random() * PUZZLE_BACKGROUND_IMAGES.length)];
    const newPuzzle: GameConfig = {
      id: `puzzle-${Date.now()}`,
      targetImage: randomImage,
      targetTheme: 'Đây là gợi ý cho bức hình câu đố mới.',
      targetName: 'Tiêu Đề Câu Đố Mới',
      targetMeaning: 'Nhập ý nghĩa của câu đố này.',
      questions: Array.from({ length: TOTAL_QUESTIONS_PER_PUZZLE }, (_, i) => ({
        id: i, q: `Câu hỏi mới ${i + 1}`, a: ['ĐÁP ÁN'], hint: 'Gợi ý mới'
      }))
    };
    onSave([...allConfigs, newPuzzle]);
    setCurrentConfigIndex(allConfigs.length);
  };
  
  const handleDeleteCurrentPuzzle = () => {
    if (allConfigs.length <= 1) {
      alert("Không thể xóa câu đố cuối cùng.");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn xóa câu đố này?")) {
      const newConfigs = allConfigs.filter((_, index) => index !== currentConfigIndex);
      onSave(newConfigs);
      setCurrentConfigIndex(Math.max(0, currentConfigIndex - 1));
    }
  }
  
  const handleSaveAndExit = () => {
     onSave(updateCurrentConfigInList(currentConfig));
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-2xl max-w-4xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6 border-b-2 border-yellow-400 pb-2">
        <h2 className="text-3xl font-bold text-yellow-300">Cấu Hình Admin</h2>
        <div className="flex space-x-2">
          <button onClick={handleAddNewPuzzle} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300">Câu Đố Mới</button>
          <button onClick={handleDeleteCurrentPuzzle} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition duration-300">Xóa Câu Đố</button>
        </div>
      </div>

      <div className="space-y-8">
        {/* AI Question Generation */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-xl font-semibold text-indigo-300 mb-3">Tạo Câu Hỏi Bằng AI (cho {TOTAL_QUESTIONS_PER_PUZZLE} mảnh ghép)</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={aiTheme}
              onChange={(e) => setAiTheme(e.target.value)}
              placeholder="Nhập chủ đề (ví dụ: Tết Trung Thu)"
              className="flex-grow p-2 rounded bg-gray-900 border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              onClick={handleGenerateQuestions}
              disabled={isGenerating}
              className="flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition duration-300 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              {isGenerating ? 'Đang tạo...' : `Tạo ${TOTAL_QUESTIONS_PER_PUZZLE} Câu Hỏi`}
            </button>
          </div>
          {aiError && <p className="text-red-400 mt-2 text-sm">{aiError}</p>}
        </div>

        {/* Target Image Section */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-xl font-semibold text-indigo-300 mb-3">Hình Ảnh & Chi Tiết</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tải Hình Ảnh</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-400"/>
                  <div className="flex text-sm text-gray-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-indigo-500">
                      <span>Tải tệp lên</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*"/>
                    </label>
                    <p className="pl-1">hoặc kéo và thả</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 10MB</p>
                </div>
              </div>
              {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 rounded-lg object-cover w-full h-48" />}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Chủ Đề / Gợi Ý</label>
                <input
                  type="text"
                  value={currentConfig.targetTheme}
                  onChange={(e) => handleFieldChange('targetTheme', e.target.value)}
                  className="mt-1 block w-full p-2 rounded bg-gray-900 border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Tên Bức Hình</label>
                <input
                  type="text"
                  value={currentConfig.targetName}
                  onChange={(e) => handleFieldChange('targetName', e.target.value)}
                  className="mt-1 block w-full p-2 rounded bg-gray-900 border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Ý Nghĩa Bức Hình</label>
                <textarea
                  rows={4}
                  value={currentConfig.targetMeaning}
                  onChange={(e) => handleFieldChange('targetMeaning', e.target.value)}
                  className="mt-1 block w-full p-2 rounded bg-gray-900 border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-indigo-300">Câu Hỏi & Trả Lời ({currentConfig.questions.length} tổng)</h3>
              <p className={`text-sm font-bold ${currentConfig.questions.length !== TOTAL_QUESTIONS_PER_PUZZLE ? 'text-yellow-400' : 'text-green-400'}`}>
                {currentConfig.questions.length !== TOTAL_QUESTIONS_PER_PUZZLE ? `Cảnh báo: Lưới 3x3 yêu cầu ${TOTAL_QUESTIONS_PER_PUZZLE} câu hỏi.` : `Sẵn sàng cho lưới 3x3!`}
              </p>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {currentConfig.questions.map((q, index) => (
              <div key={q.id} className="bg-gray-800 p-3 rounded">
                <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold text-gray-300">Câu hỏi {index + 1}</p>
                    <button onClick={() => handleDeleteQuestion(index)} className="text-red-400 hover:text-red-300 p-1 rounded-full">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
                <input
                  type="text"
                  value={q.q}
                  onChange={(e) => handleQuestionChange(index, 'q', e.target.value)}
                  className="w-full p-2 mb-2 rounded bg-gray-900 border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Nội dung câu hỏi"
                />
                <input
                  type="text"
                  value={q.a.join(', ')}
                  onChange={(e) => handleQuestionChange(index, 'a', e.target.value)}
                  placeholder="Các đáp án, cách nhau bằng dấu phẩy"
                  className="w-full p-2 mb-2 rounded bg-gray-900 border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                 <input
                  type="text"
                  value={q.hint || ''}
                  onChange={(e) => handleQuestionChange(index, 'hint', e.target.value)}
                  placeholder="Gợi ý cho câu hỏi (tùy chọn)"
                  className="w-full p-2 rounded bg-gray-900 border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
           <button onClick={handleAddQuestion} className="mt-4 flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-500 hover:border-green-500 text-gray-300 hover:text-green-400 font-bold rounded-lg transition duration-300">
                <PlusIcon className="w-5 h-5 mr-2" />
                Thêm Câu Hỏi
            </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveAndExit}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition duration-300"
          >
            Lưu Cấu Hình & Bắt Đầu Chơi
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminView;