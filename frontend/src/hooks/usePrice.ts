import {ip} from '../CONST'

export interface PricePayload {
    base_token: string;
    quote_token: string;
    rpc_https_url: string;
    id_user: string;
}

export const fetchPrice = async (payload: PricePayload): Promise<any> => {
    try {
        const response = await fetch(`${ip}/price`, {
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
            console.error('Error fetching balance:', response.statusText);
            throw new Error(`Error fetching balance: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
