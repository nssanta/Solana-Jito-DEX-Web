import Cookies from 'js-cookie';

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Получаем данные с формы напрямую из объекта события event
    const formData = new FormData(event.currentTarget);
    const commission = formData.get('commission');
    const slippage = formData.get('slippage');
    const token1 = formData.get('token1');
    const token2 = formData.get('token2');
    const amount = formData.get('counttok1');
    const isToken1InputFirst = formData.get('isToken1InputFirst') === 'true';
    const urlRPC = formData.get('urlRpc');

    // Получаем сохранённый пароль из Cookies
    const userPass = Cookies.get('password_swap_sol') || '';

    // Обработка форматирования и проверки значений
    const commissionNumber = typeof commission === 'string' ? parseFloat(commission) : 0;
    const slippageNumber = typeof slippage === 'string' ? parseFloat(slippage) : 0;
    const amountNumber = typeof amount === 'string' ? parseFloat(amount.replace(',', '')) : 0;
    const token1String = typeof token1 === 'string' ? token1 : '';
    const token2String = typeof token2 === 'string' ? token2 : '';

    // Определяем, какой токен использовать первым
    const buyToken = isToken1InputFirst ? token1String : token2String;
    const sellToken = isToken1InputFirst ? token2String : token1String;

    // Формируем тело запроса
    const requestBody = {
        buy_token: buyToken,
        sell_token: sellToken,
        amount: amountNumber,
        slippage: slippageNumber,
        jito_fees: commissionNumber,
        rpc_https_url: urlRPC,
        id_user: userPass
    };

    try {
        const response = await fetch('http://localhost:5553/swap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();

        if (response.ok) {
            return {
                bundleId: result.bundle,
                transactionId: result.transactions,
                error: `${result.error}`,
                success: true,
            };
        } else {
            return {
                bundleId: '',
                transactionId: '',
                error: `${result.error}`,
                success: false,
            };
        }
    } catch (error) {
        console.error('Ошибка при выполнении обмена:', error);
        return {
            bundleId: '',
            transactionId: '',
            error: `${error}`,
            success: false,
        };
    }
};

export default handleSubmit;
