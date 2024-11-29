import React, { useState } from 'react';
import Cookies from 'js-cookie';
import useFetchWorkerInfo from '../hooks/useListLimit';
import useTerminateJob from '../hooks/useTerminateJob';

const ListLimit: React.FC = () => {
  const userPass = Cookies.get('password_swap_sol') || '';
  const { workerInfoList, loading, error, refetchData } = useFetchWorkerInfo(userPass);
  const { terminateJob, loading: terminateLoading, error: terminateError } = useTerminateJob();

  const handleTerminate = async (jobId: string) => {
    try {
      await terminateJob(jobId);
      // После успешного завершения работы вызываем функцию для повторного запроса данных
      refetchData();
    } catch (error) {
      console.error('Failed to terminate job:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!workerInfoList || workerInfoList.length === 0) return <div>No worker information available</div>;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-gray-200 p-4 rounded-lg shadow-md">
        <h2 className="text-2xl text-gray-800 mb-4">Worker Information</h2>
        {workerInfoList.map((workerInfo) => (
          <div key={workerInfo.id} className="mb-4">
            <p><strong>Status:</strong> {workerInfo.status}</p>
            <p><strong>Buy Token:</strong> {workerInfo.meta.buy_token}</p>
            <p><strong>Sell Token:</strong> {workerInfo.meta.sell_token}</p>
            <p><strong>Amount:</strong> {workerInfo.meta.amount}</p>
            <p><strong>Slippage:</strong> {workerInfo.meta.slippage}</p>
            <p><strong>Jito Fees:</strong> {workerInfo.meta.jito_fees}</p>
            <p><strong>RPC HTTPS URL:</strong> {workerInfo.meta.rpc_https_url}</p>
            <p><strong>Temporary Price:</strong> {workerInfo.meta.temp_price}</p>
            <p><strong>Base Token:</strong> {workerInfo.meta.base_token}</p>
            <p><strong>Quote Token:</strong> {workerInfo.meta.quote_token}</p>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              onClick={() => handleTerminate(workerInfo.id)}
              disabled={terminateLoading}
            >
              {terminateLoading ? 'Terminating...' : 'Terminate Job'}
            </button>
            {terminateLoading && <span className="ml-2">Terminating...</span>}
            {terminateError && <span className="ml-2 text-red-600">{terminateError}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListLimit;
