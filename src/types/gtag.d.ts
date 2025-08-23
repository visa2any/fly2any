/**
 * Google Analytics gtag global type definitions
 */

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: {
        page_title?: string;
        page_path?: string;
        custom_parameter?: any;
        event_category?: string;
        event_label?: string;
        value?: number;
        currency?: string;
        transaction_id?: string;
        items?: any[];
        send_to?: string;
        [key: string]: any;
      }
    ) => void;
    
    dataLayer?: any[];
  }

  function gtag(
    command: 'config',
    targetId: string,
    config?: {
      page_title?: string;
      page_path?: string;
      custom_parameter?: any;
      [key: string]: any;
    }
  ): void;

  function gtag(
    command: 'event',
    eventName: string,
    parameters?: {
      event_category?: string;
      event_label?: string;
      value?: number;
      currency?: string;
      transaction_id?: string;
      items?: any[];
      send_to?: string;
      [key: string]: any;
    }
  ): void;

  function gtag(
    command: 'set',
    config: {
      custom_parameter?: any;
      [key: string]: any;
    }
  ): void;

  function gtag(
    command: string,
    targetId?: string,
    config?: {
      [key: string]: any;
    }
  ): void;

  var gtag: typeof gtag;
}

export {};