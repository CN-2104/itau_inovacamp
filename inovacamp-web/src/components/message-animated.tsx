"use client"

import * as React from "react"
import { PaperclipIcon, CornerUpRightIcon } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import type { MessageAnimationPreset } from "@/lib/message-animations"
import { MESSAGE_ANIMATIONS } from "@/lib/message-animations"
import { cn } from "@/lib/utils"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Message, MessageContent } from "@/components/ui/message"
import { MessageScrollerItem } from "@/components/ui/message-scroller"

type MessageAnimatedPart = {
  content?: unknown
  type: string
  text?: unknown
  url?: unknown
  mediaType?: unknown
  filename?: unknown
}

type MessageAnimatedContentPart =
  | { key: string; type: "text" | "reasoning"; text: string }
  | {
    key: string
    type: "file"
    url: string
    mediaType: string
    filename?: string
  }

type MessageAnimatedMessage = {
  id: string
  role: string
  text?: string
  parts?: ReadonlyArray<MessageAnimatedPart>
}

const MotionMessageScrollerItem = motion.create(MessageScrollerItem)

function MessageAnimated({
  message,
  animationPreset = MESSAGE_ANIMATIONS["slide-up"],
  assistantVariant = "ghost",
  scrollAnchor,
  userVariant = "muted",
  onAction,
  ...props
}: Omit<
  React.ComponentProps<typeof MotionMessageScrollerItem>,
  "animate" | "children" | "exit" | "initial" | "messageId" | "variants"
> & {
  animationPreset?: MessageAnimationPreset
  assistantVariant?: React.ComponentProps<typeof Bubble>["variant"]
  message: MessageAnimatedMessage
  userVariant?: React.ComponentProps<typeof Bubble>["variant"]
  onAction?: (actionText: string) => void
}) {
  const shouldReduceMotion = useReducedMotion()
  const isUserMessage = message.role === "user"

  if (isUserMessage) {
    return (
      <MotionMessageScrollerItem
        messageId={message.id}
        scrollAnchor={scrollAnchor ?? true}
        variants={animationPreset.variants}
        initial={shouldReduceMotion ? false : "initial"}
        animate="animate"
        exit={shouldReduceMotion ? undefined : "exit"}
        {...props}
      >
        <MessageAnimatedRow
          message={message}
          assistantVariant={assistantVariant}
          userVariant={userVariant}
          onAction={onAction}
        />
      </MotionMessageScrollerItem>
    )
  }

  return (
    <MotionMessageScrollerItem
      messageId={message.id}
      scrollAnchor={scrollAnchor}
      initial={false}
      {...props}
    >
      <MessageAnimatedRow
        message={message}
        assistantVariant={assistantVariant}
        userVariant={userVariant}
        onAction={onAction}
      />
    </MotionMessageScrollerItem>
  )
}

function MessageAnimatedRow({
  message,
  assistantVariant,
  userVariant,
  onAction,
}: {
  assistantVariant: React.ComponentProps<typeof Bubble>["variant"]
  message: MessageAnimatedMessage
  userVariant: React.ComponentProps<typeof Bubble>["variant"]
  onAction?: (actionText: string) => void
}) {
  const isUserMessage = message.role === "user"
  const parts = getMessageAnimatedContentParts(message)

  return (
    <Message align={isUserMessage ? "end" : "start"}>
      <MessageContent>
        {parts.map((part) => {
          if (part.type === "file") {
            return (
              <FilePart
                key={part.key}
                part={part}
                className={cn(isUserMessage && "self-end rounded-ee-none")}
              />
            )
          }

          const paragraphs = part.text
            .split(/\n\s*\n/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)

          if (part.type === "reasoning") {
            return null
          }

          const isPortabilityOffer =
            !isUserMessage &&
            part.text.includes("Posso iniciar a portabilidade?")

          return (
            <React.Fragment key={part.key}>
              <Bubble variant={isUserMessage ? userVariant : assistantVariant}>
                <BubbleContent
                  className={cn("space-y-2", isUserMessage && "rounded-ee-none")}
                >
                  {paragraphs.map((paragraph, paragraphIndex) => (
                    <p
                      key={`${part.key}-${paragraphIndex}`}
                      className="whitespace-pre-wrap"
                    >
                      {paragraph}
                    </p>
                  ))}
                </BubbleContent>
              </Bubble>

              {isPortabilityOffer && onAction && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3, ease: "easeOut" }}
                  type="button"
                  onClick={() => onAction("Sim, por favor.")}
                  className="mt-1 flex w-fit items-center gap-2 rounded-full border bg-background px-3.5 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
                >
                  <CornerUpRightIcon className="size-4 text-muted-foreground" />
                  Sim, por favor
                </motion.button>
              )}
            </React.Fragment>
          )
        })}
      </MessageContent>
    </Message>
  )
}

function getMessageAnimatedContentParts(
  message: MessageAnimatedMessage
): MessageAnimatedContentPart[] {
  if (message.parts) {
    return message.parts.flatMap(
      (part, index): MessageAnimatedContentPart[] => {
        const key = `${message.id}-${index}`

        if (part.type === "file") {
          return typeof part.url === "string" &&
            typeof part.mediaType === "string"
            ? [
              {
                key,
                type: "file",
                url: part.url,
                mediaType: part.mediaType,
                filename:
                  typeof part.filename === "string"
                    ? part.filename
                    : undefined,
              },
            ]
            : []
        }

        const type =
          part.type === "reasoning" || part.type === "thinking"
            ? "reasoning"
            : part.type === "text"
              ? "text"
              : null
        const text =
          typeof part.text === "string"
            ? part.text
            : typeof part.content === "string"
              ? part.content
              : null

        if (!type || text === null) {
          return []
        }

        return [
          {
            key,
            text,
            type,
          },
        ]
      }
    )
  }

  return typeof message.text === "string"
    ? [{ key: `${message.id}-text`, text: message.text, type: "text" }]
    : []
}

/** An image thumbnail or a download chip for a file attached to a message. */
function FilePart({
  part,
  className,
}: {
  className?: string
  part: Extract<MessageAnimatedContentPart, { type: "file" }>
}) {
  if (part.mediaType.startsWith("image")) {
    return (
      <img
        src={part.url}
        alt={part.filename ?? "Imagem anexada"}
        className={cn(
          "max-h-64 w-fit max-w-[80%] rounded-2xl border object-cover",
          className
        )}
      />
    )
  }

  return (
    <a
      href={part.url}
      download={part.filename}
      className={cn(
        "flex w-fit max-w-[80%] items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-sm hover:bg-muted",
        className
      )}
    >
      <PaperclipIcon className="size-4 shrink-0" />
      <span className="truncate">{part.filename ?? "Arquivo"}</span>
    </a>
  )
}

export { MessageAnimated, type MessageAnimatedMessage }
