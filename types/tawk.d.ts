// TypeScript declarations for Tawk.to JavaScript API
export {};

declare global {
  interface Window {
    Tawk_API?: {
      /**
       * Set visitor attributes (name, email, etc.)
       */
      setAttributes: (
        attributes: {
          name?: string;
          email?: string;
          hash?: string;
          [key: string]: any;
        },
        callback?: (error: any) => void
      ) => void;

      /**
       * Add custom event with metadata
       */
      addEvent: (
        eventName: string,
        metadata?: Record<string, any>,
        callback?: (error: any) => void
      ) => void;

      /**
       * Called when Tawk.to widget loads
       */
      onLoad?: () => void;

      /**
       * Show/hide the chat widget
       */
      showWidget?: () => void;
      hideWidget?: () => void;

      /**
       * Maximize/minimize the chat window
       */
      maximize?: () => void;
      minimize?: () => void;
    };

    Tawk_LoadStart?: Date;
  }
}
