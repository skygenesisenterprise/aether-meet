"use client";

import * as React from "react";
import { AtSign, FileText, ImagePlus, Paperclip, Send, Smile, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function MessageComposer() {
  const [message, setMessage] = React.useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-zinc-600/80 bg-[#292a2c] p-2 shadow-sm shadow-black/10"
    >
      <label htmlFor="message" className="sr-only">
        Écrire un message
      </label>
      <textarea
        id="message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Écrire un message à Équipe produit"
        rows={2}
        className="max-h-40 min-h-14 w-full resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-md"
            aria-label="Mise en forme"
          >
            <FileText className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-md"
            aria-label="Joindre un fichier"
          >
            <Paperclip className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="hidden rounded-md sm:inline-flex"
            aria-label="Joindre une image"
          >
            <ImagePlus className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-md"
            aria-label="Mentionner une personne"
          >
            <AtSign className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-md"
            aria-label="Ajouter un emoji"
          >
            <Smile className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="hidden rounded-md sm:inline-flex"
            aria-label="Améliorer avec Aether AI"
          >
            <Sparkles className="size-4" />
          </Button>
        </div>
        <Button
          type="submit"
          size="icon-sm"
          className="rounded-md"
          disabled={!message.trim()}
          aria-label="Envoyer le message"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </form>
  );
}
