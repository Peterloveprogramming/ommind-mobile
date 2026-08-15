import * as Sentry from "@sentry/react-native";

type ChatBreadcrumbData = Record<string, string | number | boolean | null | undefined>;

// Thin wrapper so chat call sites stay terse and Sentry stays the single
// place this is wired to. All breadcrumbs live under the "chat" category so
// a session's timeline can be reconstructed from Sentry alone.
export const addChatBreadcrumb = (message: string, data?: ChatBreadcrumbData) => {
  Sentry.addBreadcrumb({
    category: "chat",
    message,
    level: "info",
    data,
  });
};

export const setChatSessionContext = (sessionId: string | null) => {
  Sentry.setTag("session_id", sessionId ?? undefined);
  Sentry.setContext("chat_session", sessionId ? { session_id: sessionId } : null);
};

export const captureChatException = (error: unknown, data?: ChatBreadcrumbData) => {
  Sentry.captureException(error, {
    extra: data,
    tags: {
      request_id: data?.request_id ? String(data.request_id) : undefined,
      session_id: data?.session_id ? String(data.session_id) : undefined,
    },
  });
};
