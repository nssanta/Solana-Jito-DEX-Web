import { Worker } from 'worker_threads';

// Интерфейс для хранения информации о воркере
interface WorkerInfo {
    worker: Worker;
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
}

// Объект для хранения информации о пользователях и их воркерах
const userWorkers: { [key: string]: { [key: string]: WorkerInfo } } = {};

// Функция для добавления воркера
export const addUserWorker = (userId: string, jobId: string, worker: Worker, status: string, meta: WorkerInfo['meta']) => {
    if (!userWorkers[userId]) {
        userWorkers[userId] = {};
    }
    userWorkers[userId][jobId] = { worker, status, meta };
};

// Функция для обновления статуса воркера
export const updateUserWorkerStatus = (userId: string, jobId: string, status: string) => {
    if (userWorkers[userId] && userWorkers[userId][jobId]) {
        userWorkers[userId][jobId].status = status;
    }
};

// Функция для получения списка воркеров пользователя
export const getUserWorkers = (userId: string) => {
    return userWorkers[userId];
};

// Функция для завершения воркера
export const terminateUserWorker = (userId: string, jobId: string) => {
    if (userWorkers[userId] && userWorkers[userId][jobId]) {
        userWorkers[userId][jobId].worker.terminate();
    }
};

// Функция для удаления воркера
export const removeUserWorker = (userId: string, jobId: string) => {
    if (userWorkers[userId] && userWorkers[userId][jobId]) {
        delete userWorkers[userId][jobId];
    }
};

// Функция для получения статуса воркера
export const getUserWorkerStatus = (userId: string, jobId: string) => {
    if (userWorkers[userId] && userWorkers[userId][jobId]) {
        return userWorkers[userId][jobId].status;
    }
    return null;
};
