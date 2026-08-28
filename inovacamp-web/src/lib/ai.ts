import { DefaultChatTransport, type UIMessage } from "ai"

/**
 * Messages exchanged with the LangGraph backend.
 *
 * The backend is expected to answer `POST {api}` with an AI SDK UI message
 * stream (`Content-Type: text/event-stream`, `x-vercel-ai-ui-message-stream: v1`),
 * i.e. SSE frames carrying `text-start` / `text-delta` / `text-end` chunks —
 * plus `reasoning-*` chunks when the graph exposes intermediate thinking, which
 * the UI renders as a collapsed reasoning block.
 */
export type ChatMessage = UIMessage

/** Base URL of the FastAPI chat endpoint. Override with `VITE_CHAT_API_URL`. */
export const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL ?? "/api/chat"

export type ChatRequestBody = {
  /** Conversation id, mapped to the LangGraph checkpointer thread. */
  thread_id: string
  /** Whole transcript, so a stateless graph can be replayed from scratch. */
  messages: ChatMessage[]
  /** `submit-message` for a new turn, `regenerate-message` for a retry. */
  trigger: "submit-message" | "regenerate-message"
  /** Id of the message being sent or regenerated, when there is one. */
  message_id?: string
  /**
   * Capabilities the user switched on in the composer (`web_search`,
   * `deep_research`, `image_generation`). The graph binds the matching tools.
   */
  enabled_tools?: string[]
}

/** A value, or a function returning it, resolved at request time. */
type Resolvable<T> = T | (() => T)

export type CreateChatTransportOptions = {
  /** Endpoint override. Defaults to {@link CHAT_API_URL}. */
  api?: string
  /** Extra headers, e.g. an `Authorization` bearer token. */
  headers?: Resolvable<Record<string, string> | undefined>
  /** Extra fields merged into the request body. */
  body?: Resolvable<Record<string, unknown> | undefined>
  /** Conversation id sent as `thread_id`. */
  threadId: string
}

/**
 * Transport that talks to the FastAPI/LangGraph endpoint.
 *
 * The body is reshaped to snake_case so it maps straight onto a Pydantic
 * request model on the FastAPI side. Pass `headers` / `body` as functions when
 * they change over the life of the chat (an access token, a selected model) —
 * they are resolved on every request instead of being captured once.
 */
export function createChatTransport({
  api = CHAT_API_URL,
  headers,
  body,
  threadId,
}: CreateChatTransportOptions) {
  return new DefaultChatTransport<ChatMessage>({
    api,
    headers: () => resolve(headers) ?? {},
    prepareSendMessagesRequest({
      api,
      headers,
      body: perRequestBody,
      messages,
      trigger,
      messageId,
    }) {
      const requestBody: ChatRequestBody = {
        thread_id: threadId,
        messages,
        trigger,
        message_id: messageId,
      }

      return {
        api,
        headers,
        body: { ...requestBody, ...resolve(body), ...perRequestBody },
      }
    },
  })
}

function resolve<T>(value: Resolvable<T>): T {
  return typeof value === "function" ? (value as () => T)() : value
}

/** Flattens the text parts of a message into a single string. */
export function getMessageText(message: Pick<UIMessage, "parts">) {
  return message.parts.reduce(
    (text, part) => (part.type === "text" ? text + part.text : text),
    ""
  )
}

/** Generates a conversation id for a fresh thread. */
export function createThreadId() {
  return crypto.randomUUID()
}
