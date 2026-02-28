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

interface UseAgentReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  currentStep: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearError: () => void;
  setInitialMessages: (msgs: ChatMessage[]) => void;
}

export function useAgent(): UseAgentReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const assistantBufferRef = useRef("");
  const assistantMsgIdRef = useRef<string | null>(null);
  const agentRef = useRef<HttpAgent | null>(null);

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

      // Build AG-UI messages from chat history
      const agMessages: Message[] = [
        ...messages.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { id: userMsg.id, role: "user" as const, content: text },
      ];

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const agent = new HttpAgent({
        url: AGENT_URL,
        threadId: config?.id || "default",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      agent.setMessages(agMessages);
      agent.setState(config || {});
      agentRef.current = agent;

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
          setMessages((prev) => [
            ...prev,
            { id: event.messageId, role: "assistant", content: "" },
          ]);
        },
        onTextMessageContentEvent: ({ event }) => {
          assistantBufferRef.current += event.delta;
          const buffer = assistantBufferRef.current;
          const msgId = assistantMsgIdRef.current;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId ? { ...m, content: buffer } : m,
            ),
          );
        },
        onTextMessageEndEvent: () => {
          // Strip the JSON block from the displayed message
          const msgId = assistantMsgIdRef.current;
          const buffer = assistantBufferRef.current;
          const clean = buffer.replace(/```json\s*\{[\s\S]*?\}\s*```/g, "").trim();
          if (clean !== buffer) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === msgId ? { ...m, content: clean } : m,
              ),
            );
          }
        },
        onStateSnapshotEvent: ({ event }) => {
          replaceConfig(event.snapshot as import("@/lib/schemas/page-config").PageConfig);
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
  }, []);

  return { messages, isLoading, error, currentStep, sendMessage, clearError, setInitialMessages };
}
