import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000', // your backend URL
    headers: { 'Content-Type': 'application/json' },
});

/**
 * Verify reCAPTCHA token with backend
 */
export async function verifyCaptcha(request: { token: string }) {
    try {
        const res = await api.post('/verify-captcha', request);
        console.log('reCAPTCHA verification response:', res.data);
        return res.data;
    } catch (error: any) {
        console.error('Error verifying reCAPTCHA:', error);
        throw error.response?.data ?? error;
    }
}

export default {
    verifyCaptcha,
};