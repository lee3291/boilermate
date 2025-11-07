import { Injectable } from '@nestjs/common';

@Injectable()
export class ReCaptchaService {
    private readonly SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

    async verifyToken(token: string): Promise<{ success: boolean; 'error-codes'?: string[] }> {
        if (!token) {
            return { success: false, 'error-codes': ['missing-input-response'] };
        }

        try {
            const response = await fetch(
                `https://www.google.com/recaptcha/api/siteverify?secret=${this.SECRET_KEY}&response=${token}`,
                { method: 'POST' },
            );
            const data = await response.json();
            return { success: data.success, 'error-codes': data['error-codes'] };
        } catch (err) {
            console.error(err);
            return { success: false, 'error-codes': ['internal-error'] };
        }
    }
}
