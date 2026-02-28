"use client";

import { useCallback, useRef, useState } from "react";
import { HttpAgent } from "@ag-ui/client";
import type { AgentSubscriber, Message } from "@ag-ui/client";
import { type Operation } from "fast-json-patch";
import { usePageConfigStore } from "@/lib/stores/page-config";

const AGENT_URL =
  process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:8002/api/agent";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ToolCallState {
  id: string;
  name: string;
  buffer: string;
  isComplete: boolean;
  parentMessageId: string | null;
}

interface UseAgentReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  currentStep: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearError: () => void;
  setInitialMessages: (msgs: ChatMessage[]) => void;
  toolCalls: Map<string, ToolCallState>;
}

const FENCE_OPEN = "```json";
const FENCE_CLOSE = "```";

export function useAgent(): UseAgentReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [toolCalls, setToolCalls] = useState<Map<string, ToolCallState>>(
    new Map(),
  );
  const assistantBufferRef = useRef("");
  const assistantMsgIdRef = useRef<string | null>(null);
  const agentRef = useRef<HttpAgent | null>(null);

  // Fence-aware parsing state (lives in refs to avoid stale closures)
  const inFenceRef = useRef(false);
  const textPortionRef = useRef("");
  const jsonPortionRef = useRef("");
  const tcIdRef = useRef<string | null>(null);

  const config = usePageConfigStore((s) => s.config);
  const replaceConfig = usePageConfigStore((s) => s.replaceConfig);
  const applyPatches = usePageConfigStore((s) => s.applyPatches);

  const sendMessage = useCallback(
    async (text: string) => {
      if (isLoading) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setError(null);
      setCurrentStep(null);
      assistantBufferRef.current = "";
      assistantMsgIdRef.current = null;
      inFenceRef.current = false;
      textPortionRef.current = "";
      jsonPortionRef.current = "";
      tcIdRef.current = null;

      // Build AG-UI messages from chat history
      const agMessages: Message[] = [
        ...messages.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { id: userMsg.id, role: "user" as const, content: text },
      ];

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;
      const agent = new HttpAgent({
        url: AGENT_URL,
        threadId: config?.id || "default",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      agent.setMessages(agMessages);
      agent.setState(config || {});
      agentRef.current = agent;

      /** Update the visible chat message with text-only portion */
      const flushText = () => {
        const msgId = assistantMsgIdRef.current;
        const display = textPortionRef.current;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId ? { ...m, content: display } : m,
          ),
        );
      };

      /** Start or update the operations card */
      const flushJson = () => {
        const msgId = assistantMsgIdRef.current;
        let id = tcIdRef.current;
        if (!id) {
          id = `ops-${Date.now()}`;
          tcIdRef.current = id;
          setToolCalls((prev) => {
            const next = new Map(prev);
            next.set(id!, {
              id: id!,
              name: "apply_operations",
              buffer: "",
              isComplete: false,
              parentMessageId: msgId,
            });
            return next;
          });
        }
        const buf = jsonPortionRef.current;
        setToolCalls((prev) => {
          const next = new Map(prev);
          const tc = next.get(id!);
          if (tc) {
            next.set(id!, { ...tc, buffer: buf });
          }
          return next;
        });
      };

      const subscriber: AgentSubscriber = {
        onStepStartedEvent: ({ event }) => {
          setCurrentStep(event.stepName);
        },
        onStepFinishedEvent: () => {
          setCurrentStep(null);
        },
        onTextMessageStartEvent: ({ event }) => {
          assistantMsgIdRef.current = event.messageId;
          assistantBufferRef.current = "";
          textPortionRef.current = "";
          jsonPortionRef.current = "";
          inFenceRef.current = false;
          tcIdRef.current = null;
          setMessages((prev) => [
            ...prev,
            { id: event.messageId, role: "assistant", content: "" },
          ]);
        },
        onTextMessageContentEvent: ({ event }) => {
          assistantBufferRef.current += event.delta;
          let pending = event.delta;

          while (pending) {
            if (!inFenceRef.current) {
              const fencePos = (textPortionRef.current + pending).indexOf(FENCE_OPEN);
              const combined = textPortionRef.current + pending;

              if (fencePos === -1) {
                // No fence found — but keep last few chars in case fence is split across chunks
                const lookback = FENCE_OPEN.length - 1;
                textPortionRef.current = combined;
                // Show all but lookback tail (to avoid flashing partial fence)
                if (combined.length > lookback) {
                  // Just update the display with the full accumulated text
                }
                pending = "";
                flushText();
              } else {
                // Found fence — everything before it is text
                textPortionRef.current = combined.substring(0, fencePos);
                flushText();
                inFenceRef.current = true;
                // Skip past the "```json" marker
                pending = combined.substring(fencePos + FENCE_OPEN.length);
                jsonPortionRef.current = "";
              }
            } else {
              // Inside JSON fence — look for closing ```
              const combined = jsonPortionRef.current + pending;
              const closePos = combined.indexOf(FENCE_CLOSE);

              if (closePos === -1) {
                jsonPortionRef.current = combined;
                pending = "";
                flushJson();
              } else {
                // Found closing fence
                jsonPortionRef.current = combined.substring(0, closePos);
                flushJson();
                // Mark tool call complete
                const id = tcIdRef.current;
                if (id) {
                  setToolCalls((prev) => {
                    const next = new Map(prev);
                    const tc = next.get(id);
                    if (tc) {
                      next.set(id, { ...tc, isComplete: true });
                    }
                    return next;
                  });
                }
                inFenceRef.current = false;
                pending = combined.substring(closePos + FENCE_CLOSE.length);
              }
            }
          }
        },
        onTextMessageEndEvent: () => {
          // Final cleanup: strip any remaining fence artifacts from display text
          const msgId = assistantMsgIdRef.current;
          const cleanText = textPortionRef.current
            .replace(/```json[\s\S]*?```/g, "")
            .trim();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId ? { ...m, content: cleanText } : m,
            ),
          );

          // If we were still in a fence (incomplete), mark complete anyway
          const id = tcIdRef.current;
          if (id) {
            setToolCalls((prev) => {
              const next = new Map(prev);
              const tc = next.get(id);
              if (tc && !tc.isComplete) {
                next.set(id, { ...tc, isComplete: true });
              }
              return next;
            });
          }
        },
        onStateSnapshotEvent: ({ event }) => {
          replaceConfig(
            event.snapshot as import("@/lib/schemas/page-config").PageConfig,
          );
        },
        onStateDeltaEvent: ({ event }) => {
          applyPatches(event.delta as Operation[]);
        },
        onRunErrorEvent: ({ event }) => {
          setError(event.message);
          setIsLoading(false);
        },
        onRunFinalized: () => {
          setIsLoading(false);
          setCurrentStep(null);
          agentRef.current = null;
        },
        onRunFailed: ({ error: err }) => {
          setError(err.message || "Connection failed");
          setIsLoading(false);
          agentRef.current = null;
        },
      };

      try {
        await agent.runAgent({}, subscriber);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        setIsLoading(false);
        agentRef.current = null;
      }
    },
    [isLoading, messages, config, replaceConfig, applyPatches],
  );

  const clearError = useCallback(() => setError(null), []);

  const setInitialMessages = useCallback((msgs: ChatMessage[]) => {
    setMessages(msgs);
    setToolCalls(new Map());
    setError(null);
    setCurrentStep(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    currentStep,
    sendMessage,
    clearError,
    setInitialMessages,
    toolCalls,
  };
}
