"use client";

import * as React from "react";
import { AtSign, FileText, ImagePlus, Paperclip, Send, Smile, Sparkles, X } from "lucide-react";

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
}

interface DraftAttachment {
  id: string;
  name: string;
  kind: "file" | "image";
}

const quickMentions = ["@Elena", "@Marcus", "@Sarah", "@Noah"];
const quickEmojis = ["👍", "🔥", "🎯", "🚀", "🙂", "👏", "✅", "👀"];

export function MessageComposer({
  placeholder = "Écrire un message",
  onSend,
}: MessageComposerProps) {
  const [message, setMessage] = React.useState("");
  const [attachments, setAttachments] = React.useState<DraftAttachment[]>([]);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const imageInputRef = React.useRef<HTMLInputElement | null>(null);

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

  function addAttachments(files: FileList | null, kind: DraftAttachment["kind"]) {
    if (!files?.length) return;

    const nextAttachments = Array.from(files).map((file, index) => ({
      id: `${kind}-${file.name}-${file.lastModified}-${index}`,
      name: file.name,
      kind,
    }));

    setAttachments((current) => [...current, ...nextAttachments]);
  }

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((attachment) => attachment.id !== id));
    focusTextarea();
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
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitMessage();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-zinc-600/80 bg-[#292a2c] p-2 shadow-sm shadow-black/10"
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
        <div className="mb-2 flex flex-wrap gap-2 px-2 pt-1">
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
      <textarea
        ref={textareaRef}
        id="message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || event.shiftKey) return;
          event.preventDefault();
          submitMessage();
        }}
        placeholder={placeholder}
        rows={2}
        className="max-h-40 min-h-14 w-full resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-md"
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

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-md"
            aria-label="Joindre un fichier"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="hidden rounded-md sm:inline-flex"
            aria-label="Joindre une image"
            onClick={() => imageInputRef.current?.click()}
          >
            <ImagePlus className="size-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-md"
                aria-label="Mentionner une personne"
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

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-md"
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
            className="hidden rounded-md sm:inline-flex"
            aria-label="Améliorer avec Aether AI"
            onClick={() => {
              if (!message.trim()) return;
              setMessage((current) => `Peux-tu reformuler ce message de manière claire et concise ?\n\n${current}`);
              focusTextarea();
            }}
          >
            <Sparkles className="size-4" />
          </Button>
        </div>
        <Button
          type="submit"
          size="icon-sm"
          className="rounded-md"
          disabled={!message.trim() && attachments.length === 0}
          aria-label="Envoyer le message"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </form>
  );
}
