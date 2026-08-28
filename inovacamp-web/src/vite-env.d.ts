/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the FastAPI chat endpoint. Defaults to `/api/chat`. */
  readonly VITE_CHAT_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
