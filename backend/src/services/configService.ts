export type SmtpConfig = {
    host: string;
    port: number;
    user: string;
    pass: string;
    from?: string;
    secure?: boolean;
};

let smtpConfigMemory: SmtpConfig | null = null;

export function setSmtpConfig(config: SmtpConfig): void {
    smtpConfigMemory = { ...config };
}

export function getSmtpConfig(): SmtpConfig | null {
    return smtpConfigMemory;
}

