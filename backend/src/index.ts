import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { v4 as uuidv4 } from 'uuid';
import path from 'path'; // Импорт модуля path для работы с путями

//import { buy_tokens, sell_tokens } from '../engine/engines';
import { getUserCoinBalance } from '../swap/getBalance'
import { swap } from '../engine/engines'
import Raydium from "../swap/raydium";
import { Worker } from 'worker_threads'; // Импорт типа Worker из worker_threads модуля

// Импортируем функции для управления состоянием воркеров
import { addUserWorker, updateUserWorkerStatus, getUserWorkers, terminateUserWorker, removeUserWorker, getUserWorkerStatus } from '../engine/state';

dotenv.config();

const port: number = 5553;

// Объект для хранения задач
// const tasks: { [key: string]: { worker: Worker, status: string } } = {};

class App {
    private app: Express;

    constructor() {
        this.app = express();
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.static("public"));
        this.app.use(express.json());
        this.app.use(cors());
    }

    public init = async () => {
        try {
            this.app.listen(port, () => {
                console.log('Server start');
            })

            // Добавляем новый маршрут для POST-запроса продажи токена
            this.app.post("/swap", async (req, res) => {
                // Получаем данные из тела запроса.
                const data = req.body;
                // console.log(data)
                // Проверяем все ли поля есть 
                if ('buy_token' in data && 'sell_token' in data && 'amount' in data &&
                    'slippage' in data && 'jito_fees' in data && 'rpc_https_url' in data && 'id_user' in data) {
                    const buyToken = data.buy_token;
                    const sellToken = data.sell_token;
                    const amount = data.amount;
                    const slippage = data.slippage;
                    const jitoFees = data.jito_fees * LAMPORTS_PER_SOL;
                    const rpc_https_url = data.rpc_https_url;
                    const passUser = data.id_user;

                    try {
                        // Делаем попытку для покупки 
                        const result = await swap(buyToken, sellToken, amount, slippage, jitoFees, rpc_https_url, passUser);
                        // Form response
                        const output: any = {
                            "error": null,
                            "bundle": result.bund_hash,
                            "transactions": result.trans_hash,
                            "confirmed": null,
                        }

                        // TODO: Load users from database instead of environment variables
                        // const users = JSON.parse(process.env.REACT_APP_USERS || '{}');
                        const users: any = {}; // Temporary stub

                        // Get user data by saved password
                        const user = users[data.id_user];
                        // Check user and wallet existence
                        if (!user || !user.wallet) {
                            console.error('User not found or user has no wallet.');
                            return;
                        }
                        // Get user wallet
                        const wallet = user.wallet;
                        // Create Raydium instance
                        const raydium = new Raydium(data.rpc_https_url, wallet)
                        // Check transaction confirmation
                        const confirm = await raydium.confirm(result.trans_hash[0])
                        if (confirm?.confirmed == null) {
                            output['confirmed'] = false
                        }
                        output['confirmed'] = confirm?.confirmed

                        // Return response 
                        res.json(output);

                        //  }

                        // если ошибка
                    } catch (error) {
                        // console.log(data)
                        // console.log(error)
                        const output: any = {
                            "error": `No compile transactuins: ${error}`,
                            "bundle": null,
                            "transactions": null,
                            "confirmed": null
                        }
                        // Возвращаем данные 
                        res.json(output);
                    }
                } else {
                    res.send(`Error, not found data`);
                }
            });
            // Добавляем новый маршрут для POST-запроса продажи токена
            this.app.post("/balance", async (req, res) => {
                const data = req.body;
                //console.log(data);

                if ('rpc_https_url' in data && 'id_user' in data && 'token' in data) {
                    // const rpc_https_url = data.rpc_https_url;
                    // const token = data.token;
                    // const passUser = data.id_user;
                    try {
                        const balance = await getUserCoinBalance(data.rpc_https_url, data.token, data.id_user);
                        res.json(balance);
                    } catch (error) {
                        res.status(500).json({ error: `Error fetching balance ${error}` });
                    }
                } else {
                    res.status(400).send(`Error: Missing required fields`);
                }
            });

            // Добавляем новый маршрут для POST-запроса продажи токена
            this.app.post("/price", async (req, res) => {
                const data = req.body;
                //console.log(data);

                if ('base_token' in data && 'quote_token' in data && 'id_user' in data && 'rpc_https_url' in data) {
                    try {
                        // Парсим переменные окружения с пользователями в объект
                        const users = JSON.parse(process.env.REACT_APP_USERS || '{}');
                        // Получаем данные пользователя по сохранённому паролю
                        const user = users[data.id_user];
                        // Проверяем наличие пользователя и кошелька
                        if (!user || !user.wallet) {
                            console.error('Пользователь не найден или у пользователя отсутствует кошелек.');
                            return;
                        }
                        // Получаем кошел пользователя
                        const wallet = user.wallet;
                        // Создаем экземпляр класса.
                        const raydium = new Raydium(data.rpc_https_url, wallet)
                        // Получаем и возвращаем цену
                        const price = await raydium.getPriceOfPool(data.base_token, data.quote_token)
                        res.json(price)
                    } catch (error) {
                        res.status(500).json({ error: `Error fetching balance ${error}` });
                    }
                } else {
                    res.status(400).send(`Error: Missing required fields`);
                }
            });

            // Добавляем новый маршрут для POST-запроса продажи токена
            this.app.post("/confirm", async (req, res) => {
                const data = req.body;
                //console.log(data);

                if ('signature' in data && 'id_user' in data && 'rpc_https_url' in data) {
                    try {
                        // Парсим переменные окружения с пользователями в объект
                        const users = JSON.parse(process.env.REACT_APP_USERS || '{}');
                        // Получаем данные пользователя по сохранённому паролю
                        const user = users[data.id_user];
                        // Проверяем наличие пользователя и кошелька
                        if (!user || !user.wallet) {
                            console.error('Пользователь не найден или у пользователя отсутствует кошелек.');
                            return;
                        }
                        // Получаем кошел пользователя
                        const wallet = user.wallet;
                        // Создаем экземпляр класса.
                        const raydium = new Raydium(data.rpc_https_url, wallet)
                        // Получаем и возвращаем цену
                        // console.log('Запрашиваю подтверждение для ', data.signature)
                        const output = await raydium.confirm(data.signature)
                        //console.log(output)
                        res.json(output)
                    } catch (error) {
                        res.status(500).json({ error: `Error confirmed for signature ${error}` });
                    }
                } else {
                    res.status(400).send(`Error: Missing required fields`);
                }
            });

            // Маршрут для создания задачи и получения ID потока
            this.app.post("/pricepotok", async (req, res) => {
                const data = req.body; // Получаем данные из тела запроса
                const jobId = uuidv4(); // Генерируем уникальный идентификатор для задачи

                // Проверяем, что все необходимые поля присутствуют в запросе
                if ('buy_token' in data && 'sell_token' in data && 'amount' in data && 'slippage' in data
                    && 'jito_fees' in data && 'rpc_https_url' in data && 'id_user' in data && 'temp_price' in data
                    && 'base_token' in data && 'quote_token' in data) {

                    if (data.temp_price != 0 && data.jito_fees != 0 && data.rpc_https_url != '') {
                        try {
                            const workerPath = path.join(process.cwd(), './engine/taskQueue.ts'); // Определяем путь к воркеру
                            const worker = new Worker(workerPath, { workerData: { ...data, jobId } }); // Создаем нового воркера

                            // Добавляем информацию о воркере в состояние приложения
                            addUserWorker(data.id_user, jobId, worker, 'running', {
                                buy_token: data.buy_token,
                                sell_token: data.sell_token,
                                amount: data.amount,
                                slippage: data.slippage,
                                jito_fees: data.jito_fees,
                                rpc_https_url: data.rpc_https_url,
                                id_user: data.id_user,
                                temp_price: data.temp_price,
                                base_token: data.base_token,
                                quote_token: data.quote_token
                            });

                            // Обрабатываем сообщения от воркера
                            worker.on('message', (message) => {
                                console.log(`Worker thread message: ${message}`);
                                updateUserWorkerStatus(data.id_user, jobId, 'completed'); // Обновляем статус задачи на 'completed'
                            });

                            // Обрабатываем ошибки воркера
                            worker.on('error', (error) => {
                                console.error(`Worker thread error: ${error}`);
                                updateUserWorkerStatus(data.id_user, jobId, 'failed'); // Обновляем статус задачи на 'failed'
                            });

                            // Обрабатываем завершение работы воркера
                            worker.on('exit', (code) => {
                                // console.log(`Worker exited with code ${code}`);
                                if (code !== 0) {
                                    updateUserWorkerStatus(data.id_user, jobId, 'failed'); // Обновляем статус задачи на 'failed', если воркер завершился с ошибкой
                                } else {
                                    updateUserWorkerStatus(data.id_user, jobId, 'completed'); // Обновляем статус задачи на 'completed'
                                }
                            });

                            res.json({ jobId }); // Возвращаем ID задачи в ответе
                        } catch (error) {
                            console.error(`Error creating worker thread: ${error}`);
                            res.status(500).json({ error: 'Internal server error' }); // Возвращаем ошибку сервера в случае проблемы с созданием воркера
                        }
                    } else {
                        // console.log(data)
                        res.status(400).send(`Error: Missing required fields`); // Возвращаем ошибку, если отсутствуют необходимые поля
                    }
                } else {
                    res.status(400).send(`Error: Missing required fields`); // Возвращаем ошибку, если отсутствуют необходимые поля
                }
            });

            // Маршрут для завершения задачи
            this.app.post("/terminate", (req, res) => {
                const { jobId, userId } = req.body; // Получаем ID задачи и пользователя из тела запроса

                try {
                    terminateUserWorker(userId, jobId); // Завершаем воркер
                    removeUserWorker(userId, jobId); // Удаляем воркер
                    res.json({ jobId, status: 'terminated' }); // Возвращаем статус завершения задачи
                } catch (error) {
                    console.error(`Failed to terminate worker ${jobId}:`, error);
                    res.status(500).json({ error: 'Failed to terminate worker' }); // Возвращаем ошибку в случае проблемы с завершением воркера
                }
            });

            // Маршрут для проверки статуса задачи (POST)
            this.app.post("/taskstatus", (req, res) => {
                const { jobId, userId } = req.body; // Получаем ID задачи и пользователя из тела запроса

                if (!jobId || !userId) {
                    return res.status(400).json({ error: 'Job ID and User ID are required' }); // Возвращаем ошибку, если ID задачи или пользователя не переданы
                }

                const status = getUserWorkerStatus(userId, jobId); // Получаем статус воркера
                if (status) {
                    res.json({ jobId, status }); // Возвращаем статус задачи
                } else {
                    res.status(404).json({ error: 'Task not found' }); // Возвращаем ошибку, если задача не найдена
                }
            });

            // Маршрут для получения списка всех рабочих потоков по ID пользователя
            this.app.get("/userworkers/:userId", (req, res) => {
                const { userId } = req.params; // Получаем ID пользователя из параметров запроса
                const userWorkers = getUserWorkers(userId); // Получаем список рабочих потоков пользователя

                if (userWorkers) {
                    res.json({ userId, workers: userWorkers }); // Возвращаем список рабочих потоков
                } else {
                    res.status(404).json({ error: 'User not found or no workers available' }); // Возвращаем ошибку, если пользователь не найден или нет рабочих потоков
                }
            });

            // В случае ошибок маршрута.
        } catch (error: unknown) {
            const err = error as Error;
            // console.log(err.message);
        }
    }
}

export const app = new App();

app.init().then(() => {
    console.log("Inits succesful")
}).catch(() => {
    console.log("server in not inits")
})


