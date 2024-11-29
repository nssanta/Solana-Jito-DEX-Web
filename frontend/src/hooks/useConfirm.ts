import {ip} from '../CONST'

export interface ConfirmPayload {
    signature: string;
    rpc_https_url: string;
    id_user: string;
}

export const fetchConfirm = async (payload: ConfirmPayload): Promise<any> => {
    try {
        const response = await fetch(`${ip}/confirm`, {
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
            console.error('Error fetching confirm:', response.statusText);
            throw new Error(`Error fetching confirm: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
