import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  Badge,
  Button,
  Spinner,
  Avatar,
  EmptyState,
} from '@/components/ui';
import { useGetChatHistoryQuery, useSendChatMessageMutation } from '@/services/chatApi';

export const ComplaintChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const complaintId = id || '';

  const {
    data: messages = [],
    isLoading: isHistoryLoading,
    isError,
    error,
    refetch,
  } = useGetChatHistoryQuery(complaintId, { skip: !complaintId });

  const [sendChatMessage, { isLoading: isSending }] = useSendChatMessageMutation();

  const [inputQuestion, setInputQuestion] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSend = async () => {
    if (!inputQuestion.trim() || isSending) return;

    const question = inputQuestion.trim();
    setInputQuestion('');
    setLocalError(null);

    try {
      await sendChatMessage({
        complaintId,
        question,
      }).unwrap();
    } catch (err: unknown) {
      const errorObj = err as { status?: number | string; data?: { detail?: string } };
      setLocalError(
        errorObj?.data?.detail || 'Failed to generate AI response. Please try again.'
      );
      setInputQuestion(question); // Restore text on failure
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-[900px] mx-auto flex flex-col min-h-[calc(100vh-8rem)]">
      {/* PAGE HEADER */}
      <PageHeader
        title="AI Complaint Assistant"
        subtitle="Grounded AI assistant for this complaint record."
        actions={
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(`/complaints/${complaintId}`)}
          >
            Complaint Details
          </Button>
        }
      />

      {/* GROUNDING NOTICE BADGE BAR */}
      <div className="flex items-center space-x-3 p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-slate-700">
        <Badge variant="info" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
          Grounded Responses
        </Badge>
        <span>Responses are generated only from this complaint and uploaded documents.</span>
      </div>

      {/* MAIN CONVERSATION CARD */}
      <Card className="flex-1 border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden min-h-[480px]">
        {/* MESSAGES SCROLL AREA */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* LOADING HISTORY */}
          {isHistoryLoading && (
            <div className="py-16 text-center space-y-3">
              <Spinner size="md" className="text-[#2563EB]" />
              <p className="text-xs font-medium text-[#64748B]">Loading conversation history...</p>
            </div>
          )}

          {/* FETCH ERROR */}
          {isError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-[#DC2626]" />
                <span>
                  {(error as any)?.data?.detail || 'Unable to load message history for this complaint.'}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          )}

          {/* LOCAL SEND ERROR */}
          {localError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-[#DC2626]" />
                <span>{localError}</span>
              </div>
              <button onClick={() => setLocalError(null)} className="font-semibold underline">
                Dismiss
              </button>
            </div>
          )}

          {/* EMPTY CONVERSATION STATE */}
          {!isHistoryLoading && !isError && messages.length === 0 && (
            <EmptyState
              icon={<MessageSquare className="w-6 h-6 text-[#2563EB]" />}
              title="Ask the AI about this complaint"
              description="Inquire about batch history, defect details, customer narratives, or regulatory risk scores."
            />
          )}

          {/* CHAT MESSAGES LIST */}
          {!isHistoryLoading &&
            messages.map((msg) => {
              const isUser = msg.sender === 'USER';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar name={isUser ? 'You' : 'AI Assistant'} size="md" />

                  <div className={`max-w-[75%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-[#2563EB] text-white rounded-tr-none shadow-sm'
                          : 'bg-slate-100 text-[#0F172A] border border-[#E2E8F0] rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.message_text}</p>
                    </div>

                    <span
                      className={`block text-[11px] text-[#64748B] ${
                        isUser ? 'text-right pr-1' : 'text-left pl-1'
                      }`}
                    >
                      {msg.created_at
                        ? new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Just now'}
                    </span>
                  </div>
                </div>
              );
            })}

          {/* ASSISTANT TYPING / GENERATING INDICATOR */}
          {isSending && (
            <div className="flex items-start gap-3 flex-row">
              <Avatar name="AI Assistant" size="md" />
              <div className="p-4 rounded-2xl bg-slate-100 border border-[#E2E8F0] text-xs text-[#64748B] flex items-center space-x-2 rounded-tl-none">
                <Spinner size="sm" className="text-[#2563EB]" />
                <span>Searching complaint context & generating response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* BOTTOM STICKY COMPOSER */}
        <div className="p-4 bg-slate-50 border-t border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              placeholder="Ask about this complaint..."
              className="flex-1 bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
            <Button
              variant="primary"
              disabled={!inputQuestion.trim() || isSending}
              isLoading={isSending}
              onClick={handleSend}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
