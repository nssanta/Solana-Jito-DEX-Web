import React from 'react';

interface SwapResultProps {
    swapResult: {
        jobId: string;
    } | null;
}

const SwapResultLimit: React.FC<SwapResultProps> = ({ swapResult }) => {
    return (
        <div className="flex-col justify-center py-3">
            {/* Отображение результата свопа */}
            {swapResult && (
                <>
                    <label className="py-1 block text-sm font-bold text-violet-600 overflow-hidden whitespace-nowrap truncate">
                        ID:
                        <span className="mr-2"></span>
                    
                             {swapResult.jobId}
                    </label>
   
                </>
            )}
        </div>
    );
};

export default SwapResultLimit;
