// Enhanced Global TypeScript Declarations for Enterprise Compatibility

declare module '@headlessui/react' {
  import { ComponentProps, ElementType, ReactElement, ReactNode, ForwardRefExoticComponent, RefAttributes } from 'react'

  // Headless UI Component Props
  export interface HeadlessUIProps {
    as?: ElementType
    children?: ReactNode
    className?: string
  }

  export interface DialogProps extends HeadlessUIProps {
    open?: boolean
    onClose?: (value: boolean) => void
    static?: boolean
    unmount?: boolean
  }

  export interface TransitionProps extends HeadlessUIProps {
    show?: boolean
    appear?: boolean
    enter?: string
    enterFrom?: string
    enterTo?: string
    leave?: string
    leaveFrom?: string
    leaveTo?: string
  }

  export interface MenuProps extends HeadlessUIProps {
    // Menu specific props
  }

  export interface ListboxProps extends HeadlessUIProps {
    value?: any
    onChange?: (value: any) => void
    disabled?: boolean
    multiple?: boolean
  }

  export interface DisclosureProps extends HeadlessUIProps {
    defaultOpen?: boolean
  }

  // Component exports with proper React 19 compatibility
  export const Dialog: ForwardRefExoticComponent<DialogProps & RefAttributes<HTMLElement>> & {
    Panel: ForwardRefExoticComponent<HeadlessUIProps & RefAttributes<HTMLElement>>
    Title: ForwardRefExoticComponent<HeadlessUIProps & RefAttributes<HTMLElement>>
    Description: ForwardRefExoticComponent<HeadlessUIProps & RefAttributes<HTMLElement>>
  }

  export const Transition: ForwardRefExoticComponent<TransitionProps & RefAttributes<HTMLElement>> & {
    Child: ForwardRefExoticComponent<TransitionProps & RefAttributes<HTMLElement>>
    Root: ForwardRefExoticComponent<TransitionProps & RefAttributes<HTMLElement>>
  }

  export const Menu: ForwardRefExoticComponent<MenuProps & RefAttributes<HTMLElement>> & {
    Button: ForwardRefExoticComponent<HeadlessUIProps & RefAttributes<HTMLElement>>
    Items: ForwardRefExoticComponent<HeadlessUIProps & RefAttributes<HTMLElement>>
    Item: ForwardRefExoticComponent<HeadlessUIProps & RefAttributes<HTMLElement>>
  }

  export const Listbox: ForwardRefExoticComponent<ListboxProps & RefAttributes<HTMLElement>> & {
    Button: ForwardRefExoticComponent<HeadlessUIProps & RefAttributes<HTMLElement>>
    Options: ForwardRefExoticComponent<HeadlessUIProps & RefAttributes<HTMLElement>>
    Option: ForwardRefExoticComponent<HeadlessUIProps & RefAttributes<HTMLElement>>
  }

  export const Disclosure: ForwardRefExoticComponent<DisclosureProps & RefAttributes<HTMLElement>> & {
    Button: ForwardRefExoticComponent<HeadlessUIProps & RefAttributes<HTMLElement>>
    Panel: ForwardRefExoticComponent<HeadlessUIProps & RefAttributes<HTMLElement>>
  }

  export { Fragment } from 'react'
}

// AWS SDK Type Declarations
declare module '@aws-sdk/client-ses' {
  export interface SESClientConfig {
    region?: string
    credentials?: {
      accessKeyId: string
      secretAccessKey: string
    }
    endpoint?: string
    apiVersion?: string
  }

  export class SESClient {
    constructor(config?: SESClientConfig)
    send<TCommand, TResponse>(command: TCommand): Promise<TResponse>
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
    Tags?: Array<{
      Name: string
      Value: string
    }>
  }

  export interface SendEmailCommandOutput {
    MessageId: string
    $metadata: {
      httpStatusCode?: number
      requestId?: string
    }
  }

  export class SendEmailCommand {
    constructor(input: SendEmailCommandInput)
  }
}

// Nodemailer compatibility with AWS SDK
declare module 'nodemailer' {
  export interface TransportOptions {
    host?: string
    port?: number
    secure?: boolean
    auth?: {
      user: string
      pass: string
    }
    service?: string
    ses?: any // Allow SES transport
  }

  export interface Transporter {
    sendMail(mailOptions: MailOptions): Promise<SentMessageInfo>
    verify(): Promise<true>
    close(): void
  }

  export interface MailOptions {
    from?: string
    to?: string | string[]
    cc?: string | string[]
    bcc?: string | string[]
    subject?: string
    text?: string
    html?: string
    attachments?: Attachment[]
    messageId?: string
    date?: Date | string
    encoding?: string
  }

  export interface Attachment {
    filename?: string
    content?: any
    path?: string
    contentType?: string
    cid?: string
    encoding?: string
    headers?: { [key: string]: string }
    raw?: string | Buffer
  }

  export interface SentMessageInfo {
    messageId: string
    envelope: {
      from: string
      to: string[]
    }
    accepted: string[]
    rejected: string[]
    pending: string[]
    response: string
  }

  export function createTransporter(options: TransportOptions): Transporter
  export function createTransport(options: TransportOptions): Transporter
}

// React 19 compatibility fixes
declare module 'react' {
  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T
    props: P
    key: Key | null
  }

  export interface ForwardRefExoticComponent<P> {
    (props: P): ReactElement | null
    readonly $$typeof: symbol
    displayName?: string
    defaultProps?: Partial<P>
  }
}

// Global namespace declarations
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

export {}