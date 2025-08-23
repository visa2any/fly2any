// Global type declarations to resolve compatibility issues

// Fix for @headlessui/react with React 19
declare module '@headlessui/react' {
  import { ComponentProps, ElementType, Fragment, ReactElement, ReactNode } from 'react'

  // Headless UI Components
  export interface DialogProps {
    as?: ElementType
    children?: ReactNode
    open?: boolean
    onClose?: (value: boolean) => void
    className?: string
    static?: boolean
    unmount?: boolean
  }

  export interface TransitionProps {
    as?: ElementType
    show?: boolean
    appear?: boolean
    children?: ReactNode
    enter?: string
    enterFrom?: string
    enterTo?: string
    leave?: string
    leaveFrom?: string
    leaveTo?: string
    className?: string
  }

  export interface MenuProps {
    as?: ElementType
    children?: ReactNode
    className?: string
  }

  export interface ListboxProps {
    as?: ElementType
    children?: ReactNode
    value?: any
    onChange?: (value: any) => void
    disabled?: boolean
    multiple?: boolean
    className?: string
  }

  export interface DisclosureProps {
    as?: ElementType
    children?: ReactNode
    defaultOpen?: boolean
    className?: string
  }

  // Main exports
  export const Dialog: {
    (props: DialogProps): ReactElement
    Panel: (props: ComponentProps<'div'>) => ReactElement
    Title: (props: ComponentProps<'h1'>) => ReactElement
    Description: (props: ComponentProps<'p'>) => ReactElement
  }

  export const Transition: {
    (props: TransitionProps): ReactElement
    Child: (props: TransitionProps) => ReactElement
    Root: (props: TransitionProps) => ReactElement
  }

  export const Menu: {
    (props: MenuProps): ReactElement
    Button: (props: ComponentProps<'button'>) => ReactElement
    Items: (props: ComponentProps<'div'>) => ReactElement
    Item: (props: ComponentProps<'div'>) => ReactElement
  }

  export const Listbox: {
    (props: ListboxProps): ReactElement
    Button: (props: ComponentProps<'button'>) => ReactElement
    Options: (props: ComponentProps<'ul'>) => ReactElement
    Option: (props: ComponentProps<'li'>) => ReactElement
  }

  export const Disclosure: {
    (props: DisclosureProps): ReactElement
    Button: (props: ComponentProps<'button'>) => ReactElement
    Panel: (props: ComponentProps<'div'>) => ReactElement
  }

  export const Fragment: typeof Fragment
}

// Fix for AWS SDK compatibility
declare module '@aws-sdk/client-ses' {
  export interface SESClientConfig {
    region?: string
    credentials?: {
      accessKeyId: string
      secretAccessKey: string
    }
    endpoint?: string
  }

  export class SESClient {
    constructor(config?: SESClientConfig)
    send(command: any): Promise<any>
  }

  export interface SendEmailCommandInput {
    Source: string
    Destination: {
      ToAddresses: string[]
      CcAddresses?: string[]
      BccAddresses?: string[]
    }
    Message: {
      Subject: {
        Data: string
        Charset?: string
      }
      Body: {
        Text?: {
          Data: string
          Charset?: string
        }
        Html?: {
          Data: string
          Charset?: string
        }
      }
    }
    ReplyToAddresses?: string[]
    ReturnPath?: string
  }

  export class SendEmailCommand {
    constructor(input: SendEmailCommandInput)
  }
}

// Fix for nodemailer with AWS SDK compatibility
declare module 'nodemailer' {
  export interface Transporter {
    sendMail(mailOptions: any): Promise<any>
  }

  export interface TransportOptions {
    host?: string
    port?: number
    secure?: boolean
    auth?: {
      user: string
      pass: string
    }
    service?: string
  }

  export function createTransporter(options: TransportOptions): Transporter
  export function createTransport(options: TransportOptions): Transporter

  export interface MailOptions {
    from?: string
    to?: string | string[]
    cc?: string | string[]
    bcc?: string | string[]
    subject?: string
    text?: string
    html?: string
    attachments?: any[]
  }
}

// Fix for React 19 compatibility with other packages
declare module 'react' {
  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T
    props: P
    key: Key | null
  }

  export interface ComponentProps<T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>> {
    children?: ReactNode
    className?: string
  }
}

// Global type fixes
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

export {}