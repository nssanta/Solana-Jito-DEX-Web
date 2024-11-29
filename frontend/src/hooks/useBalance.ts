import {ip} from '../CONST'

export interface BalancePayload {
    token: string;
    rpc_https_url: string;
    id_user: string;
}

export const fetchBalance = async (payload: BalancePayload): Promise<any> => {
    try {
        const response = await fetch(`${ip}/balance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
           // console.log('Balance:', data);
            return data;
        } else {
            console.error('Error fetching price:', response.statusText);
            throw new Error(`Error fetching price: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
