import React from 'react';

interface SwapResultProps {
    swapResult: {
        bundleId: string;
        transactionId: string;
        error: string;
        success: boolean;
        confirmed: boolean;
    } | null;
}

const SwapResult: React.FC<SwapResultProps> = ({ swapResult }) => {
    return (
        <div className="flex-col justify-center py-3">
            {/* Отображение результата свопа */}
            {swapResult && (
                <>
                    <label className="py-1 block text-sm font-bold text-violet-600 overflow-hidden whitespace-nowrap truncate">
                        Bundle ID:
                        <span className="mr-2"></span>
                        <a
                            href={`https://explorer.jito.wtf/bundle/${swapResult.bundleId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600"
                        >
                            {swapResult.bundleId}
                        </a>
                    </label>

                    <label className="py-1 block text-sm text-violet-600 font-bold overflow-hidden whitespace-nowrap truncate">
                        Transaction ID:
                        <span className="mr-2"></span>
                        <a
                            href={`https://solscan.io/tx/${swapResult.transactionId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600"
                        >
                            {swapResult.transactionId}
                        </a>
                    </label>

                    {/* Отображение ошибки, если есть */}
                    {swapResult.error !== 'null' && swapResult.error !== null && swapResult.error !== undefined && (
                        <label className="py-1 block text-sm text-red-600 font-bold break-words max-w-xs">Result:
                            <span className="mr-2"></span>
                            <p>{swapResult.error}</p>
                        </label>

                    )}

                    <div className={`p-2 rounded-md shadow-md border ${swapResult.confirmed ? 'border-green-600 bg-green-100' : 'border-red-600 bg-red-100'}`}>
                        <div className="flex items-center">
                            <label className="text-sm font-bold underline mr-2">
                                Confirm:
                            </label>
                            <span className={`${swapResult.confirmed ? 'text-green-600' : 'text-red-600'}`}>
                                {swapResult.confirmed ? 'TRANSACTION SUCCESSFUL' : 'TRANSACTION FAILED'}
                            </span>
                        </div>
                    </div> 
                </>
            )}
        </div>
    );
};

export default SwapResult;
