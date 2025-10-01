
import React, { useEffect } from 'react';

interface NotificationModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ title, message, onClose }) => {

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape' || e.key === 'Enter') {
            onClose();
          }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center animate-fade-in">
      <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-sm m-4 transform transition-all animate-slide-up border-t-4 border-indigo-500">
        <h3 className="text-2xl font-bold text-center mb-3 text-yellow-300">{title}</h3>
        <p className="text-gray-300 text-center mb-5">{message}</p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
            autoFocus
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
