// SettingsForm.tsx
import React from 'react';

// Компонент формы настроек
const SettingsForm: React.FC<{
    urlRpc: string;
    setRpcUrl: React.Dispatch<React.SetStateAction<string>>;
    slippage: number;
    setSlippage: React.Dispatch<React.SetStateAction<number>>;
    commission: number;
    setCommission: React.Dispatch<React.SetStateAction<number>>;
    setUrlRpcX: React.Dispatch<React.SetStateAction<string>>;
    setCommissionX: React.Dispatch<React.SetStateAction<number>>;
    setSlippageX: React.Dispatch<React.SetStateAction<number>>;
}> = ({ urlRpc, setRpcUrl, slippage, setSlippage, commission, setCommission, setUrlRpcX, setCommissionX, setSlippageX, }) => {

    const handleRpcChange = (value:any) => {
        setRpcUrl(value);
        setUrlRpcX(value); // Обновляем состояние в родительском компоненте
        
    };

    const handleCommissionChange = (value:any) => {
            setCommission(Number(value));
            setCommissionX(Number(value)); // Обновляем состояние в родительском компоненте

    };

    const handleSlippageChange = (value:any) => {
        setSlippage(Number(value));
        setSlippageX(Number(value)); // Обновляем состояние в родительском компоненте
      
    };



    return (
        <>
            <div className="w-full mb-4">
                <label htmlFor="urlRpc" className="block text-white text-sm font-bold mb-2">URL RPC</label>
                <input type="text" id="urlRpc" name="urlRpc" value={urlRpc} 
                onChange={(e) => handleRpcChange(e.target.value)}
                placeholder="Введите URL RPC" required
                    className="w-full px-3 py-3 border rounded-md focus:outline-none focus:border-blue-500 bg-gray-700 text-white" />
            </div>

            <div className="w-full mb-4">
                <label htmlFor="slippage" className="block text-white text-sm font-bold mb-2">Slippage</label>
                <input type="number" id="slippage" name="slippage" value={slippage} 
                onChange={(e) => handleSlippageChange(e.target.value)}
                placeholder="Введите Slippage" required
                    className="w-full px-3 py-3 border rounded-md focus:outline-none focus:border-blue-500 bg-gray-700 text-white" />
            </div>

            <div className="w-full mb-4">
                <label htmlFor="commission" className="block text-white text-sm font-bold mb-2">Комиссия</label>
                <input type="number" id="commission" name="commission" value={commission} 
                onChange={(e) => handleCommissionChange(e.target.value)}
                placeholder="Введите Комиссию" required
                    className="w-full px-3 py-3 border rounded-md focus:outline-none focus:border-blue-500 bg-gray-700 text-white" />
            </div>
        </>
    );
};

export default SettingsForm;
