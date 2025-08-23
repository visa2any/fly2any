// Type declarations for missing modules

// Temporary Prisma types until client is generated
declare module '@prisma/client' {
  export const PrismaClient: any;
  export const Prisma: any;
  export type Booking = any;
  export type BookingStatus = any;
  export type PaymentStatus = any;
  export type EmailStatus = any;
}

// ws and qrcode-terminal types are now provided by @types packages

declare module 'openai' {
  export class OpenAI {
    constructor(config: any);
    chat: any;
  }
}

declare module '@aws-sdk/client-ses' {
  export class SESClient {
    constructor(config: any);
    send(command: any): Promise<any>;
  }
  export class SendEmailCommand {
    constructor(params: any);
  }
  export class SendBulkTemplatedEmailCommand {
    constructor(params: any);
  }
  export class GetSendQuotaCommand {
    constructor(params: any);
  }
}

declare module '@playwright/test' {
  export function defineConfig(config: any): any;
  export const devices: any;
}