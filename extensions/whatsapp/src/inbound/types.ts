import type { AnyMessageContent, MiscMessageGenerationOptions, proto } from "baileys";
import type { NormalizedLocation } from "openclaw/plugin-sdk/channel-inbound";
import type { PollInput } from "openclaw/plugin-sdk/poll-runtime";
import type { WhatsAppIdentity, WhatsAppReplyContext, WhatsAppSelfIdentity } from "../identity.js";
import type { WhatsAppSendResult } from "./send-result.js";

/**
 * Send options for the reply/sendMedia closures attached to inbound messages.
 *
 * Adds `quotedContextInfo` on top of Baileys' `MiscMessageGenerationOptions`.
 * When set, the channel attaches it directly to the outbound payload's
 * content (`contextInfo`) instead of routing through Baileys' `quoted`
 * option, which always synthesises `contextInfo.quotedMessage` from a fake
 * `WAMessage` and breaks the threaded-quote affordance on mobile clients
 * when the fabricated `quotedMessage` is empty or wrong type. This matches
 * the wire shape produced by whatsmeow / wacli.
 */
export type WhatsAppReplyOptions = MiscMessageGenerationOptions & {
  quotedContextInfo?: proto.IContextInfo;
};

export type WebListenerCloseReason = {
  status?: number;
  isLoggedOut: boolean;
  error?: unknown;
};

export type ActiveWebSendOptions = {
  quotedMessageKey?: {
    id: string;
    remoteJid: string;
    fromMe: boolean;
    participant?: string;
    messageText?: string;
  };
  gifPlayback?: boolean;
  accountId?: string;
  fileName?: string;
};

export type ActiveWebListener = {
  sendMessage: (
    to: string,
    text: string,
    mediaBuffer?: Buffer,
    mediaType?: string,
    options?: ActiveWebSendOptions,
  ) => Promise<WhatsAppSendResult>;
  sendPoll: (to: string, poll: PollInput) => Promise<WhatsAppSendResult>;
  sendReaction: (
    chatJid: string,
    messageId: string,
    emoji: string,
    fromMe: boolean,
    participant?: string,
  ) => Promise<WhatsAppSendResult>;
  sendComposingTo: (to: string) => Promise<void>;
  close?: () => Promise<void>;
};

export type WhatsAppStructuredContactContext = {
  kind: "contact" | "contacts";
  total: number;
  contacts: Array<{
    name?: string;
    phones?: string[];
  }>;
};

export type WebInboundMessage = {
  id?: string;
  from: string; // conversation id: E.164 for direct chats, group JID for groups
  conversationId: string; // alias for clarity (same as from)
  to: string;
  accountId: string;
  /** Set by the real inbound monitor after access-control / pairing checks pass. */
  accessControlPassed?: boolean;
  body: string;
  pushName?: string;
  timestamp?: number;
  chatType: "direct" | "group";
  chatId: string;
  sender?: WhatsAppIdentity;
  senderJid?: string;
  senderE164?: string;
  senderName?: string;
  replyTo?: WhatsAppReplyContext;
  replyToId?: string;
  replyToBody?: string;
  replyToSender?: string;
  replyToSenderJid?: string;
  replyToSenderE164?: string;
  groupSubject?: string;
  groupParticipants?: string[];
  mentions?: string[];
  mentionedJids?: string[];
  self?: WhatsAppSelfIdentity;
  selfJid?: string | null;
  selfLid?: string | null;
  selfE164?: string | null;
  fromMe?: boolean;
  location?: NormalizedLocation;
  sendComposing: () => Promise<void>;
  reply: (text: string, options?: WhatsAppReplyOptions) => Promise<WhatsAppSendResult>;
  sendMedia: (
    payload: AnyMessageContent,
    options?: WhatsAppReplyOptions,
  ) => Promise<WhatsAppSendResult>;
  mediaPath?: string;
  mediaType?: string;
  mediaFileName?: string;
  mediaUrl?: string;
  untrustedStructuredContext?: Array<{
    label: string;
    source?: string;
    type?: string;
    payload: unknown;
  }>;
  wasMentioned?: boolean;
  isBatched?: boolean;
};
