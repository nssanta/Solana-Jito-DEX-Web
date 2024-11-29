import { useState, useEffect } from 'react';
import { ip } from '../CONST';

type WorkerInfo = {
  id: string;
  status: string;
  meta: {
    buy_token: string;
    sell_token: string;
    amount: number;
    slippage: number;
    jito_fees: number;
    rpc_https_url: string;
    id_user: string;
    temp_price: number;
    base_token: string;
    quote_token: string;
  };
};

const useFetchWorkerInfo = (userId: string) => {
  const [workerInfoList, setWorkerInfoList] = useState<WorkerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${ip}/userworkers/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();

      // Convert the workers object into an array of WorkerInfo
      const workersArray: WorkerInfo[] = Object.keys(data.workers).map((workerId) => ({
        id: workerId,
        ...data.workers[workerId]
      }));

      setWorkerInfoList(workersArray);
      setLoading(false);
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const refetchData = () => {
    fetchData();
  };

  return { workerInfoList, loading, error, refetchData };
};

export default useFetchWorkerInfo;
