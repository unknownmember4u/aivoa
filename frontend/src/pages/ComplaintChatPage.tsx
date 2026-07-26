import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  ShieldCheck,
  AlertCircle,
  Sparkles,
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
    <div className="space-y-6 max-w-[960px] mx-auto flex flex-col min-h-[calc(100vh-8.5rem)] pb-8">
      {/* PAGE HEADER */}
      <PageHeader
        title="AI Complaint Assistant"
        subtitle="Grounded Q&A assistant trained on this specific complaint record and document text."
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

      {/* GROUNDING NOTICE BANNER */}
      <div className="flex items-center space-x-3 p-3.5 bg-blue-50/80 border border-blue-100/80 rounded-2xl text-xs text-slate-700 shadow-xs">
        <Badge variant="info" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
          Grounded Intelligence
        </Badge>
        <span className="font-medium">
          Responses are generated strictly from the uploaded complaint document and audit history.
        </span>
      </div>

      {/* MAIN CONVERSATION CARD */}
      <Card className="flex-1 border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden min-h-[480px]">
        {/* MESSAGES SCROLL AREA */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* LOADING HISTORY */}
          {isHistoryLoading && (
            <div className="py-16 text-center space-y-3">
              <Spinner size="md" className="text-[#2563EB]" />
              <p className="text-xs font-medium text-[#64748B]">Loading chat history...</p>
            </div>
          )}

          {/* FETCH ERROR */}
          {isError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-800">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-[#EF4444]" />
                <span>
                  {(error as any)?.data?.detail || 'Unable to load chat history for this complaint.'}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          )}

          {/* LOCAL SEND ERROR */}
          {localError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-800">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-[#EF4444]" />
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
              icon={<Sparkles className="w-6 h-6 text-[#2563EB]" />}
              title="Ask AI Assistant About This Case"
              description="Ask questions regarding batch history, defect narrative, FDA recall risk, or customer details."
            />
          )}

          {/* CHAT MESSAGES LIST */}
          {!isHistoryLoading &&
            messages.map((msg) => {
              const isUser = msg.sender === 'USER';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar name={isUser ? 'You' : 'AI Assistant'} size="md" />

                  <div className={`max-w-[78%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-[#2563EB] text-white rounded-tr-none shadow-sm font-medium'
                          : 'bg-slate-100/90 text-[#0F172A] border border-[#E2E8F0] rounded-tl-none'
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
                </motion.div>
              );
            })}

          {/* ASSISTANT TYPING / GENERATING INDICATOR */}
          {isSending && (
            <div className="flex items-start gap-3 flex-row">
              <Avatar name="AI Assistant" size="md" />
              <div className="p-4 rounded-2xl bg-slate-100 border border-[#E2E8F0] text-xs text-[#64748B] flex items-center space-x-2 rounded-tl-none">
                <Spinner size="sm" className="text-[#2563EB]" />
                <span>Analyzing document text & generating response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* BOTTOM STICKY COMPOSER */}
        <div className="p-4 bg-slate-50/80 border-t border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              placeholder="Ask about batch history, defect details, or regulatory risk..."
              className="flex-1 bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 disabled:bg-slate-100 disabled:cursor-not-allowed shadow-xs"
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
