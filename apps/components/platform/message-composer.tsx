"use client";

import * as React from "react";
import { AtSign, FileText, ImagePlus, Paperclip, Plus, Send, Smile, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MessageComposerProps {
  placeholder?: string;
  onSend?: (message: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
}

export interface MessageComposerHandle {
  addDroppedFiles: (files: FileList | File[]) => void;
}

interface DraftAttachment {
  id: string;
  name: string;
  kind: "file" | "image";
}

const quickMentions = ["@Elena", "@Marcus", "@Sarah", "@Noah"];
const quickEmojis = ["👍", "🔥", "🎯", "🚀", "🙂", "👏", "✅", "👀"];

export const MessageComposer = React.forwardRef<MessageComposerHandle, MessageComposerProps>(function MessageComposer(
  {
    placeholder = "Écrire un message",
    onSend,
    onTypingChange,
  },
  ref
) {
  const [message, setMessage] = React.useState("");
  const [attachments, setAttachments] = React.useState<DraftAttachment[]>([]);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const imageInputRef = React.useRef<HTMLInputElement | null>(null);
  const typingTimeoutRef = React.useRef<number | null>(null);
  const isTypingRef = React.useRef(false);

  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current !== null) {
        window.clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        onTypingChange?.(false);
      }
    };
  }, [onTypingChange]);

  function focusTextarea() {
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  function appendText(value: string) {
    setMessage((current) => {
      const next = current.trimEnd().length > 0 ? `${current} ${value}` : value;
      return next;
    });
    focusTextarea();
  }

  function buildAttachments(files: FileList | File[], kind?: DraftAttachment["kind"]) {
    return Array.from(files).map((file, index) => {
      const resolvedKind = kind ?? (file.type.startsWith("image/") ? "image" : "file");

      return {
        id: `${resolvedKind}-${file.name}-${file.lastModified}-${index}`,
        name: file.name,
        kind: resolvedKind,
      };
    });
  }

  function addAttachments(files: FileList | null, kind: DraftAttachment["kind"]) {
    if (!files?.length) return;

    const nextAttachments = buildAttachments(files, kind);

    setAttachments((current) => [...current, ...nextAttachments]);
  }

  React.useImperativeHandle(ref, () => ({
    addDroppedFiles(files) {
      if (!files.length) return;
      setAttachments((current) => [...current, ...buildAttachments(files)]);
      focusTextarea();
    },
  }));

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((attachment) => attachment.id !== id));
    focusTextarea();
  }

  function handleTyping() {
    if (!onTypingChange) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
    }
    onTypingChange(true);

    if (typingTimeoutRef.current !== null) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      isTypingRef.current = false;
      onTypingChange(false);
      typingTimeoutRef.current = null;
    }, 3000);
  }

  function submitMessage() {
    const hasMessage = Boolean(message.trim());
    const hasAttachments = attachments.length > 0;
    if (!hasMessage && !hasAttachments) return;

    const attachmentSuffix = hasAttachments
      ? `\n${attachments
          .map((attachment) =>
            attachment.kind === "image" ? `[Image: ${attachment.name}]` : `[Fichier: ${attachment.name}]`
          )
          .join("\n")}`
      : "";

    onSend?.(`${message.trim()}${attachmentSuffix}`.trim());
    setMessage("");
    setAttachments([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";

    if (typingTimeoutRef.current !== null) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingChange?.(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitMessage();
  }

  const isSendDisabled = !message.trim() && attachments.length === 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-zinc-600/80 bg-[#2a2a2b] px-3 py-2 shadow-sm shadow-black/10"
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        onChange={(event) => addAttachments(event.target.files, "file")}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        multiple
        onChange={(event) => addAttachments(event.target.files, "image")}
      />

      {attachments.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-2 pt-1">
          {attachments.map((attachment) => (
            <span
              key={attachment.id}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-black/15 px-3 py-1 text-xs text-zinc-300"
            >
              {attachment.kind === "image" ? <ImagePlus className="size-3.5" /> : <Paperclip className="size-3.5" />}
              <span className="max-w-44 truncate">{attachment.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                className="rounded-full text-zinc-500 transition-colors hover:text-zinc-200"
                aria-label={`Retirer ${attachment.name}`}
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <label htmlFor="message" className="sr-only">
        Écrire un message
      </label>
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          id="message"
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            handleTyping();
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || event.shiftKey) return;
            event.preventDefault();
            submitMessage();
          }}
          placeholder={placeholder}
          rows={1}
          className="max-h-32 min-h-8 flex-1 resize-none bg-transparent py-1 text-sm outline-none placeholder:text-[#a7a7ad]"
        />

        <div className="flex shrink-0 items-center gap-0.5 text-zinc-300">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-8 rounded-md text-zinc-300 hover:bg-white/5 hover:text-zinc-100"
                aria-label="Mise en forme"
              >
                <FileText className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="border-white/10 bg-[#2b2d31] text-zinc-100">
              <DropdownMenuItem onClick={() => appendText("**texte important**")}>
                Texte important
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => appendText("- point de suivi")}>
                Liste rapide
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => appendText("```note```")}>Bloc de note</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-8 rounded-md text-zinc-300 hover:bg-white/5 hover:text-zinc-100"
                aria-label="Ajouter un emoji"
              >
                <Smile className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 border-white/10 bg-[#2b2d31] p-3 text-zinc-100">
              <div className="grid grid-cols-4 gap-2">
                {quickEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => appendText(emoji)}
                    className="rounded-md bg-white/5 px-2 py-2 text-lg transition-colors hover:bg-white/10"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8 rounded-md text-zinc-300 hover:bg-white/5 hover:text-zinc-100"
            aria-label="Joindre un fichier"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="size-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-8 rounded-md text-zinc-300 hover:bg-white/5 hover:text-zinc-100"
                aria-label="Ajouter une mention"
              >
                <AtSign className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="border-white/10 bg-[#2b2d31] text-zinc-100">
              {quickMentions.map((mention) => (
                <DropdownMenuItem key={mention} onClick={() => appendText(mention)}>
                  {mention}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-8 rounded-md text-zinc-300 hover:bg-white/5 hover:text-zinc-100"
                aria-label="Ajouter du contenu"
              >
                <Plus className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-white/10 bg-[#2b2d31] text-zinc-100">
              <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
                <ImagePlus className="mr-2 size-4" />
                Ajouter une image
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (!message.trim()) return;
                  setMessage((current) => `Peux-tu reformuler ce message de manière claire et concise ?\n\n${current}`);
                  focusTextarea();
                }}
              >
                <Sparkles className="mr-2 size-4" />
                Réécrire avec Aether AI
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="mx-1 h-5 w-px bg-white/12" aria-hidden="true" />

          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            className="size-8 rounded-md text-zinc-300 hover:bg-white/5 hover:text-zinc-100 disabled:opacity-40"
            disabled={isSendDisabled}
            aria-label="Envoyer le message"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </form>
  );
});
