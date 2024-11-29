// SwapButton.tsx
import React from 'react';

// Компонент кнопки свопа
const SwapButton: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
    return (
        <div className="py-2 flex items-center justify-center">
            <button type="submit"
                className={`bg-purple-500 text-white px-4 py-2 rounded-md flex items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue'}`}
                disabled={isLoading}>
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 11-8 8v-8H4z"></path>
                        </svg>
                        Загрузка...
                    </>
                ) : 'Обменять'}
            </button>
        </div>
    );
};

export default SwapButton;
