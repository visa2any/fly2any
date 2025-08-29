// Type declarations for missing modules

// Google Analytics (gtag) types and PWA iOS support
declare global {
  interface Window {
    React?: typeof import('react');
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: {
        page_title?: string;
        page_location?: string;
        custom_map?: Record<string, string>;
        send_to?: string;
        [key: string]: any;
      }
    ) => void;
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      onCommitFiberRoot: (id: any, root: any, priorityLevel?: any) => void;
    };
  }
  
  interface Navigator {
    standalone?: boolean; // iOS PWA standalone mode
  }
}

// Styled JSX types - Extend React types without overriding them
declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        style: React.DetailedHTMLProps<React.StyleHTMLAttributes<HTMLStyleElement> & {
          jsx?: boolean;
          global?: boolean;
        }, HTMLStyleElement>;
      }
    }
  }
}

// Augment React types without overriding the module
declare global {
  namespace React {
    interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
      jsx?: boolean;
      global?: boolean;
    }
  }
}

// Additional React type helpers (without module override)
export type ReactElementRef<
  C extends 
    | React.ForwardRefExoticComponent<any>
    | React.ComponentType<any>
    | keyof JSX.IntrinsicElements
> = C extends React.ForwardRefExoticComponent<
  React.RefAttributes<infer Instance>
>
  ? Instance
  : C extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[C] extends React.DetailedHTMLProps<infer P, infer E>
    ? E
    : never
  : React.ComponentRef<C>;

export type ReactComponentPropsWithoutRef<T extends React.ElementType> = 
  React.ComponentProps<T> extends { ref?: any }
    ? Omit<React.ComponentProps<T>, 'ref'>
    : React.ComponentProps<T>;

// Performance API extensions
declare global {
  interface PerformanceEntry {
    value?: number;
    renderTime?: number;
    loadTime?: number;
    transferSize?: number;
  }
}

// Intl.DateFormat fix for older TypeScript
declare global {
  namespace Intl {
    var DateFormat: {
      new(locales?: string | string[], options?: DateTimeFormatOptions): DateTimeFormat;
    };
  }
}

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
  export default SESClient;
}

// Fix for AWS SDK v2 compatibility issues
declare module '@aws-sdk/client-sesv2' {
  const client: any;
  export default client;
}

// Fix nodemailer SES transport type conflict
declare module '@aws-sdk/client-sesv2/dist-types/index' {
  const client: any;
  export default client;
  export * from '@aws-sdk/client-sesv2';
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

// PWA Manager modules - declarations removed as they're handled by the actual implementation

// Note: Mobile animation utilities and touch handlers are now implemented directly in their respective files

// Note: Component exports are now handled directly in their respective files

// React Secret Internals (for enterprise provider)
declare global {
  namespace React {
    const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: any;
  }
}