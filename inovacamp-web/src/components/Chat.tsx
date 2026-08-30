"use client"

import * as React from "react"
import { useChat } from "@ai-sdk/react"
import { convertFileListToFileUIParts, type FileUIPart } from "ai"
import {
  ArrowUpIcon,
  ChevronRightIcon,
  GlobeIcon,
  ImageIcon,
  MessageCircleDashedIcon,
  PaperclipIcon,
  PlusIcon,
  RotateCwIcon,
  SquareIcon,
  TelescopeIcon,
  XIcon,
} from "lucide-react"

import { createChatTransport, createThreadId, type ChatMessage } from "@/lib/ai"
import { createMockChatTransport } from "@/lib/mock-chat"
import { cn } from "@/lib/utils"
import { ChatBackdrop } from "@/components/chat-backdrop"
import { MessageAnimated } from "@/components/message-animated"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Message, MessageContent } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"

/**
 * Capabilities the user can switch on for a turn. The selected ids are sent to
 * the backend as `enabled_tools`, so the graph can bind the matching tools.
 */
const CHAT_TOOLS = [
  { id: "image_generation", label: "Gerar imagem", icon: ImageIcon },
  { id: "deep_research", label: "Pesquisa profunda", icon: TelescopeIcon },
  { id: "web_search", label: "Pesquisa na web", icon: GlobeIcon },
] as const

type ChatToolId = (typeof CHAT_TOOLS)[number]["id"]

type ChatSuggestionBase = {
  /** Leading fragment rendered in bold, e.g. "Rastrear boletos". */
  emphasis?: string
  /** Remainder of the row label. */
  label: string
  /** Trailing icon. Defaults to the one matching the action. */
  icon?: React.ComponentType<{ className?: string }>
}

export type ChatSuggestion =
  | (ChatSuggestionBase & {
    /** Sends a prompt into the conversation. The default. */
    action?: "send"
    /** Text sent. Defaults to the emphasis plus the label. */
    prompt?: string
  })
  | (ChatSuggestionBase & {
    /** Leaves the chat for a dedicated flow instead of sending a prompt. */
    action: "navigate"
    /** Destination handed to `onNavigate`. */
    screen: string
  })

export type ChatSuggestionGroup = {
  heading: string
  items: ChatSuggestion[]
}

/** Starter prompts offered before the first message. Override per screen. */
const DEFAULT_SUGGESTIONS: ChatSuggestionGroup[] = [
  {
    heading: "Iniciar conversa",
    items: [
      { label: "Trazer meu boleto de luz pra cá" },
      { label: "Me ajude a trazer meu crédito pessoal" },
      { label: "Traga meus Pix Agendados para o Itaú" },
    ],
  },
  {
    heading: "Ações rápidas",
    items: [
      {
        emphasis: "Trazer meu financiamento",
        label: "pro Itaú",
        action: "navigate",
        screen: "migrar-financiamento",
      },
      {
        emphasis: "Traga meus pagamentos recorrentes",
        label: "de outras contas",
        action: "navigate",
        screen: "migrar-debitos-automaticos",
      },
    ],
  },
]

export type ChatProps = {
  /** Endpoint of the FastAPI chat route. Defaults to `VITE_CHAT_API_URL`. */
  api?: string
  /** Extra request headers, e.g. an `Authorization` bearer token. */
  headers?: Record<string, string>
  /** Extra fields merged into the request body, e.g. a graph config. */
  body?: Record<string, unknown>
  /** Conversation id sent as `thread_id`. Generated once when omitted. */
  threadId?: string
  /**
   * Answers from the scripted transport in `lib/mock-chat` instead of calling
   * the backend. Defaults to on while no endpoint is configured, so the demo
   * runs offline until `VITE_CHAT_API_URL` (or `api`) points at the graph.
   */
  mock?: boolean
  /** Transcript to hydrate the chat with, e.g. a persisted conversation. */
  initialMessages?: ChatMessage[]
  /** File types the attachment picker accepts. */
  accept?: string
  /** Starter prompts shown in the empty state. Pass `[]` to hide them. */
  suggestions?: ChatSuggestionGroup[]
  /** Copy for the empty state shown before the first message. */
  emptyTitle?: string
  emptyDescription?: string
  placeholder?: string
  className?: string
  onError?: (error: Error) => void
  /** Opens a dedicated flow for a `navigate` suggestion. */
  onNavigate?: (screen: string, suggestion: ChatSuggestion) => void
}

export function Chat({
  api,
  headers,
  body,
  threadId,
  mock = !api && !import.meta.env.VITE_CHAT_API_URL,
  initialMessages,
  accept = "image/*,.pdf,.txt,.csv,.md",
  suggestions = DEFAULT_SUGGESTIONS,
  emptyTitle = "Como posso ajudar?",
  emptyDescription = "Faça uma pergunta para começar a conversa.",
  placeholder = "Escreva sua mensagem…",
  className,
  onError,
  onNavigate,
}: ChatProps) {
  const [input, setInput] = React.useState("")
  const [attachments, setAttachments] = React.useState<FileUIPart[]>([])
  const [enabledTools, setEnabledTools] = React.useState<ChatToolId[]>([])
  const [generatedThreadId] = React.useState(createThreadId)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const imageInputRef = React.useRef<HTMLInputElement>(null)
  const resolvedThreadId = threadId ?? generatedThreadId

  // Kept for the whole chat: the mock owns its message id counter, so a new
  // instance per render would hand out ids that are already on screen.
  const mockTransport = React.useMemo(
    () => (mock ? createMockChatTransport() : null),
    [mock]
  )

  // useChat resolves the transport lazily on each send, so rebuilding it here
  // keeps a rotating token or changed config in sync without resetting state.
  const transport =
    mockTransport ??
    createChatTransport({
      api,
      headers,
      body: { ...body, enabled_tools: enabledTools },
      threadId: resolvedThreadId,
    })

  const { messages, sendMessage, status, stop, regenerate, error, clearError } =
    useChat<ChatMessage>({
      id: resolvedThreadId,
      messages: initialMessages,
      transport,
      onError,
    })

  const isBusy = status === "submitted" || status === "streaming"
  const isEmpty = messages.length === 0
  const hasContent = input.trim().length > 0 || attachments.length > 0

  async function addFiles(fileList: FileList | null) {
    if (!fileList?.length) {
      return
    }

    const parts = await convertFileListToFileUIParts(fileList)
    setAttachments((current) => [...current, ...parts])
  }

  function toggleTool(id: ChatToolId) {
    setEnabledTools((current) =>
      current.includes(id)
        ? current.filter((tool) => tool !== id)
        : [...current, id]
    )
  }

  function submitPrompt(prompt: string, files: FileUIPart[] = []) {
    const text = prompt.trim()
    if (isBusy || (!text && files.length === 0)) {
      return
    }

    setInput("")
    setAttachments([])
    clearError()
    void sendMessage(text ? { text, files } : { files })
  }

  function applySuggestion(suggestion: ChatSuggestion) {
    if (suggestion.action === "navigate") {
      onNavigate?.(suggestion.screen, suggestion)
      return
    }

    submitPrompt(
      suggestion.prompt ??
      [suggestion.emphasis, suggestion.label].filter(Boolean).join(" ")
    )
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isBusy) {
      void stop()
      return
    }

    submitPrompt(input, attachments)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return
    }

    event.preventDefault()
    event.currentTarget.form?.requestSubmit()
  }

  return (
    <MessageScrollerProvider>
      <div
        className={cn(
          "relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-background",
          className
        )}
      >
        {isEmpty ? <ChatBackdrop /> : null}

        <div className="relative flex min-h-0 flex-1 flex-col">
          {isEmpty ? (
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-end overflow-y-auto px-4">
              <Empty className="flex-1 justify-center p-8">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MessageCircleDashedIcon />
                  </EmptyMedia>
                  <EmptyTitle>{emptyTitle}</EmptyTitle>
                  <EmptyDescription>{emptyDescription}</EmptyDescription>
                </EmptyHeader>
              </Empty>

              {suggestions.map((group) => (
                <div key={group.heading} className="pb-4">
                  <div className="px-2 pb-1 text-xs text-muted-foreground">
                    {group.heading}
                  </div>
                  {group.items.map((suggestion) => (
                    <SuggestionRow
                      key={`${suggestion.emphasis ?? ""}${suggestion.label}`}
                      suggestion={suggestion}
                      disabled={isBusy}
                      onSelect={() => applySuggestion(suggestion)}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <MessageScroller>
              <MessageScrollerViewport>
                <MessageScrollerContent
                  aria-busy={isBusy}
                  className="mx-auto w-full max-w-2xl gap-6 px-4 py-6"
                >
                  {messages.map((message) => (
                    <MessageAnimated
                      key={message.id}
                      message={message}
                      userVariant="brand"
                      scrollAnchor={message.role === "user"}
                    />
                  ))}
                  {status === "submitted" ? <PendingMessage /> : null}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          )}
        </div>

        <div
          className={cn(
            "relative shrink-0 border-t transition-colors",
            isEmpty ? "border-transparent" : "bg-background"
          )}
        >
          <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {error ? (
              <div
                role="alert"
                className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                <span className="min-w-0 truncate">
                  Não foi possível obter a resposta.
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="shrink-0 text-destructive hover:text-destructive"
                  onClick={() => void regenerate()}
                >
                  <RotateCwIcon />
                  Tentar novamente
                </Button>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="md:pb-8">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={accept}
                className="hidden"
                onChange={(event) => {
                  void addFiles(event.target.files)
                  event.target.value = ""
                }}
              />
              <input
                ref={imageInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  void addFiles(event.target.files)
                  event.target.value = ""
                }}
              />

              <InputGroup className="bg-background/70 backdrop-blur-sm">
                {attachments.length > 0 ? (
                  <InputGroupAddon align="block-start" className="flex-wrap">
                    {attachments.map((attachment, index) => (
                      <AttachmentPreview
                        key={`${attachment.filename ?? "file"}-${index}`}
                        attachment={attachment}
                        onRemove={() =>
                          setAttachments((current) =>
                            current.filter((_, i) => i !== index)
                          )
                        }
                      />
                    ))}
                  </InputGroupAddon>
                ) : null}

                <InputGroupTextarea
                  aria-label="Mensagem"
                  className="max-h-40 min-h-14 overflow-y-auto px-3 py-2.5"
                  placeholder={placeholder}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <InputGroupAddon align="block-end" className="flex-wrap pt-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <InputGroupButton
                          aria-label="Adicionar anexos e recursos"
                          type="button"
                          size="icon-sm"
                          variant="outline"
                        >
                          <PlusIcon />
                        </InputGroupButton>
                      }
                    />
                    <DropdownMenuContent
                      align="start"
                      side="top"
                      className="w-52"
                    >
                      <DropdownMenuItem
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <PaperclipIcon />
                        Anexar arquivo
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <ImageIcon />
                        Adicionar foto
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {CHAT_TOOLS.map((tool) => (
                        <DropdownMenuCheckboxItem
                          key={tool.id}
                          checked={enabledTools.includes(tool.id)}
                          closeOnClick={false}
                          onCheckedChange={() => toggleTool(tool.id)}
                        >
                          <tool.icon />
                          {tool.label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {CHAT_TOOLS.filter((tool) =>
                    enabledTools.includes(tool.id)
                  ).map((tool) => (
                    <InputGroupButton
                      key={tool.id}
                      type="button"
                      variant="secondary"
                      onClick={() => toggleTool(tool.id)}
                    >
                      <tool.icon />
                      {tool.label}
                      <XIcon />
                      <span className="sr-only">Desativar {tool.label}</span>
                    </InputGroupButton>
                  ))}

                  <InputGroupButton
                    type="submit"
                    variant="default"
                    size="icon-sm"
                    disabled={!isBusy && !hasContent}
                    className="ml-auto"
                  >
                    {isBusy ? <SquareIcon /> : <ArrowUpIcon />}
                    <span className="sr-only">
                      {isBusy ? "Parar" : "Enviar"}
                    </span>
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </form>
          </div>
        </div>
      </div>
    </MessageScrollerProvider>
  )
}

/** One tappable starter prompt: a full-width row with a trailing action icon. */
function SuggestionRow({
  suggestion,
  disabled,
  onSelect,
}: {
  disabled?: boolean
  onSelect: () => void
  suggestion: ChatSuggestion
}) {
  const Icon =
    suggestion.icon ??
    (suggestion.action === "navigate" ? ChevronRightIcon : ArrowUpIcon)

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className="flex w-full items-center justify-between gap-4 rounded-xl px-2 py-3 text-left text-sm transition-colors hover:bg-muted/60 disabled:pointer-events-none disabled:opacity-50"
    >
      <span className="min-w-0">
        {suggestion.emphasis ? (
          <span className="font-semibold">{suggestion.emphasis} </span>
        ) : null}
        <span
          className={suggestion.emphasis ? "text-muted-foreground" : undefined}
        >
          {suggestion.label}
        </span>
      </span>
      <Icon className="size-4 shrink-0 text-brand" />
    </button>
  )
}

/** Thumbnail or filename chip for a file queued in the composer. */
function AttachmentPreview({
  attachment,
  onRemove,
}: {
  attachment: FileUIPart
  onRemove: () => void
}) {
  const isImage = attachment.mediaType.startsWith("image")

  return (
    <div className="relative flex items-center gap-2 rounded-xl border bg-background py-1 pr-7 pl-1 text-xs">
      {isImage ? (
        <img
          src={attachment.url}
          alt=""
          className="size-8 rounded-lg object-cover"
        />
      ) : (
        <span className="flex size-8 items-center justify-center rounded-lg bg-muted">
          <PaperclipIcon className="size-4" />
        </span>
      )}
      <span className="max-w-32 truncate text-foreground">
        {attachment.filename ?? "Arquivo"}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <XIcon className="size-3.5" />
        <span className="sr-only">
          Remover {attachment.filename ?? "arquivo"}
        </span>
      </button>
    </div>
  )
}

/** Placeholder bubble shown between sending a message and the first token. */
function PendingMessage() {
  return (
    <Message align="start">
      <MessageContent>
        <Bubble variant="muted">
          <BubbleContent className="flex gap-1 py-3.5">
            <span className="sr-only">Gerando resposta…</span>
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                aria-hidden
                className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
                style={{ animationDelay: `${index * 150}ms` }}
              />
            ))}
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  )
}
