export const emailConfig = {
    email: {
        host: process.env.EMAIL_HOST,
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
        connectionTimeout: 180000,
        tls: {
            rejectUnauthorized: false,
        },
        user: process.env.EMAIL,
    },
};
