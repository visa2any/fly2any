// React helper types to reduce errors
import * as React from 'react';

declare global {
  namespace React {
    // Helper for ElementRef 
    type ElementRef<T extends React.ElementType> = T extends React.ForwardRefExoticComponent<
      React.RefAttributes<infer Instance>
    >
      ? Instance
      : T extends keyof JSX.IntrinsicElements
      ? JSX.IntrinsicElements[T] extends React.DetailedHTMLProps<any, infer E>
        ? E
        : never
      : never;

    // Helper for ComponentPropsWithoutRef
    type ComponentPropsWithoutRef<T extends React.ElementType> = 
      React.ComponentProps<T> extends { ref?: any }
        ? Omit<React.ComponentProps<T>, 'ref'>
        : React.ComponentProps<T>;
  }
}

// Export helper types
export type SetStateAction<T> = T | ((prevState: T) => T);
export type Dispatch<A> = (value: A) => void;

// Common event handler types
export type ChangeEventHandler<T = Element> = React.ChangeEventHandler<T>;
export type FormEventHandler<T = Element> = React.FormEventHandler<T>;
export type MouseEventHandler<T = Element> = React.MouseEventHandler<T>;
export type KeyboardEventHandler<T = Element> = React.KeyboardEventHandler<T>;
export type FocusEventHandler<T = Element> = React.FocusEventHandler<T>;

// Helper for async functions
export type AsyncFunction<T = void, R = void> = (args: T) => Promise<R>;

// Utility types for component props
export type PropsWithChildren<P = unknown> = P & { children?: React.ReactNode };
export type PropsWithClassName<P = unknown> = P & { className?: string };

export {};