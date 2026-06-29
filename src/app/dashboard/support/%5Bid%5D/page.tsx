'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Paperclip, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/store/hooks';
import supportService from '@/services/support.service';
import Card from '@/components/Card';
import Button from '@/components/Button';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { formatDate, cn } from '@/utils';

export default function TicketDetailsThreadPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAppSelector((state) => state.auth);

  const [ticket, setTicket] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [replyMessage, setReplyMessage] = useState('');
  const [attachmentFiles, setAttachmentFiles] = useState<FileList | null>(null);
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchTicketDetails = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const data = await supportService.getTicketDetails(id);
      setTicket(data.ticket);
      const uniqueMessages = (data.messages || []).filter(
        (m: any, index: number, self: any[]) => self.findIndex((x) => x.id === m.id) === index
      );
      setMessages(uniqueMessages);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load support ticket details.');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails(true);
  }, [id]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSubmittingReply(true);
    try {
      const formData = new FormData();
      formData.append('message', replyMessage);
      if (attachmentFiles) {
        Array.from(attachmentFiles).forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const msg = await supportService.replyToTicket(id, formData);
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === msg.id);
        if (exists) return prev;
        return [...prev, msg];
      });
      setReplyMessage('');
      setAttachmentFiles(null);
      toast.success('Reply submitted successfully!');
      fetchTicketDetails(false); // reload silently to sync status
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      await supportService.closeTicket(id);
      toast.success('Ticket closed successfully!');
      fetchTicketDetails();
    } catch (err: any) {
      toast.error(err.message || 'Failed to close ticket.');
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchTicketDetails} />;
  if (!ticket) return <ErrorState message="Ticket not found." />;

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/support"
            className="p-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-lg text-gray-400 hover:text-white transition-all duration-200"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-wider">
              Ticket #{ticket.id ? (ticket.id.length > 8 ? ticket.id.substring(ticket.id.length - 8) : ticket.id) : ''}
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              {ticket.title}
            </p>
          </div>
        </div>

        {ticket.status !== 'CLOSED' && (
          <Button variant="danger" size="sm" onClick={handleCloseTicket} className="font-bold uppercase text-xs">
            Mark as Resolved (Close)
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Messages feed */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Messages Logs Area */}
          <Card className="flex flex-col gap-4 max-h-[500px] overflow-y-auto">
            {messages.map((msg) => {
              const isMe = msg.senderId?.id === user?.id;

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex flex-col gap-1.5 p-3 rounded-lg max-w-[85%] border text-xs font-semibold leading-relaxed',
                    isMe
                      ? 'self-end bg-gamePurple/20 border-gamePurple/30 text-white rounded-br-none'
                      : 'self-start bg-white/[0.02] border-white/5 text-gray-300 rounded-bl-none'
                  )}
                >
                  <div className="flex items-center justify-between gap-6 border-b border-white/5 pb-1 text-[9px] text-gray-500 font-bold uppercase">
                    <span>{msg.senderId?.name} ({msg.senderRole})</span>
                    <span>{formatDate(msg.createdAt)}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.message}</p>

                  {/* Attachments preview */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-white/5">
                      {msg.attachments.map((url: string, index: number) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-[9px] text-gameAccent bg-gameAccent/10 px-2 py-1 rounded hover:underline"
                        >
                          <Paperclip size={10} />
                          <span>Proof {index + 1}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </Card>

          {/* Reply Form Box */}
          {ticket.status !== 'CLOSED' ? (
            <Card>
              <form onSubmit={handleReplySubmit} className="flex flex-col gap-4">
                <textarea
                  rows={3}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response to support moderators..."
                  className="w-full px-4 py-2.5 bg-gameCard/50 border border-white/5 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gameAccent/50 transition-colors duration-200"
                />

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 relative">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setAttachmentFiles(e.target.files)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                    <Button variant="secondary" size="sm" type="button" className="flex items-center gap-1.5 text-xs">
                      <Paperclip size={14} />
                      <span>{attachmentFiles ? `${attachmentFiles.length} files` : 'Attach Files'}</span>
                    </Button>
                  </div>

                  <Button type="submit" variant="primary" size="sm" isLoading={submittingReply} className="flex items-center gap-1.5 text-xs font-bold uppercase py-2">
                    <Send size={14} />
                    <span>Send Message</span>
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <div className="flex items-center justify-center p-4 border border-dashed border-white/10 rounded-xl text-xs text-gray-500 font-bold uppercase tracking-wider">
              This ticket thread has been closed.
            </div>
          )}
        </div>

        {/* Support Sidebar details */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
              Ticket Details
            </h3>
            <div className="flex flex-col gap-2 text-xs font-semibold text-gray-400">
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="text-white">{ticket.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Priority:</span>
                <span className="text-white">{ticket.priority}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-white">{ticket.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span className="text-white">{formatDate(ticket.createdAt)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
