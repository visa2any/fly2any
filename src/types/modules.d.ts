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

declare module '@hapi/boom' {
  export interface BoomError extends Error {
    isBoom: boolean;
    output: {
      statusCode: number;
      payload: {
        statusCode: number;
        error: string;
        message: string;
      };
      headers: Record<string, any>;
    };
    data: any;
  }
  
  export class Boom extends Error implements BoomError {
    isBoom: boolean;
    output: {
      statusCode: number;
      payload: {
        statusCode: number;
        error: string;
        message: string;
      };
      headers: Record<string, any>;
    };
    data: any;
    
    constructor(message?: string, options?: {
      statusCode?: number;
      data?: any;
      ctor?: Function;
    });
  }
  
  export function badRequest(message?: string, data?: any): BoomError;
  export function unauthorized(message?: string, scheme?: string, attributes?: any): BoomError;
  export function forbidden(message?: string, data?: any): BoomError;
  export function notFound(message?: string, data?: any): BoomError;
  export function internal(message?: string, data?: any, statusCode?: number): BoomError;
}