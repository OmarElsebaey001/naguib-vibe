"use client";

import { useRef, useEffect, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type ChatMessage, type ToolCallState } from "@/lib/agent/use-agent";
import { OperationsBlock } from "@/components/console/operations-block";
import { Send, Loader2, AlertCircle, Sparkles } from "lucide-react";

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  currentStep: string | null;
  onSendMessage: (text: string) => void;
  onClearError: () => void;
  toolCalls: Map<string, ToolCallState>;
}

const STEP_LABELS: Record<string, string> = {
  building_prompt: "Preparing...",
  generating_response: "Thinking...",
  applying_operations: "Applying changes...",
};

export function ChatPanel({
  messages,
  isLoading,
  error,
  currentStep,
  onSendMessage,
  onClearError,
  toolCalls,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isLoading, currentStep]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    onSendMessage(text);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
        <Sparkles className="w-5 h-5 text-violet-400" />
        <span className="font-semibold text-sm text-zinc-100">Naguib</span>
        <span className="text-xs text-zinc-500">AI Page Builder</span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0">
        <div ref={scrollRef} className="p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-sm font-medium text-zinc-200 mb-1">
                Describe your landing page
              </h3>
              <p className="text-xs text-zinc-500 max-w-[260px]">
                Tell me about your product and I&apos;ll assemble a complete
                landing page in seconds.
              </p>
              <div className="mt-6 space-y-2 w-full max-w-[280px]">
                {[
                  "Build a landing page for a SaaS project management tool",
                  "Create a page for a fitness app with a bold theme",
                  "Make a minimal portfolio page for a designer",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      textareaRef.current?.focus();
                    }}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300 transition-colors border border-zinc-800"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-medium ${
                  msg.role === "user"
                    ? "bg-zinc-700 text-zinc-300"
                    : "bg-violet-500/20 text-violet-400"
                }`}
              >
                {msg.role === "user" ? "U" : "N"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-400 mb-1">
                  {msg.role === "user" ? "You" : "Naguib"}
                </p>
                <div className="text-sm text-zinc-200 whitespace-pre-wrap break-words leading-relaxed">
                  {msg.content || (
                    <span className="text-zinc-500 italic">...</span>
                  )}
                </div>
                {msg.role === "assistant" &&
                  (() => {
                    const tc = Array.from(toolCalls.values()).find(
                      (t) => t.parentMessageId === msg.id,
                    );
                    return tc ? <OperationsBlock toolCall={tc} /> : null;
                  })()}
              </div>
            </div>
          ))}

          {/* Loading/Step indicator */}
          {isLoading && currentStep && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              {STEP_LABELS[currentStep] || currentStep}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/50 border border-red-900/50">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-red-300">{error}</p>
                <button
                  onClick={onClearError}
                  className="text-xs text-red-400 underline mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-zinc-800">
        <div className="flex items-end gap-2 bg-zinc-900 rounded-xl border border-zinc-800 px-3 py-2 focus-within:border-violet-500/50 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Describe your landing page..."
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 resize-none outline-none min-h-[24px] max-h-[160px]"
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-7 w-7 p-0 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-30"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
