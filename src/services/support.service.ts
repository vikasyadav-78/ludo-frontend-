import apiClient from './axios';
import { ApiResponse, SupportTicket, SupportMessage } from '@/types';

export const supportService = {
  createTicket: async (ticketData: {
    title: string;
    description: string;
    category: string;
    priority: string;
  }): Promise<SupportTicket> => {
    const response = await apiClient.post<ApiResponse<{ ticket: SupportTicket }>>('/support/tickets', ticketData);
    return response.data.data.ticket;
  },

  getMyTickets: async (): Promise<SupportTicket[]> => {
    const response = await apiClient.get<ApiResponse<{ tickets: SupportTicket[] }>>('/support/tickets');
    return response.data.data.tickets;
  },

  getTicketDetails: async (ticketId: string): Promise<{ ticket: SupportTicket; messages: SupportMessage[] }> => {
    const response = await apiClient.get<ApiResponse<{ ticket: SupportTicket; messages: SupportMessage[] }>>(
      `/support/tickets/${ticketId}`
    );
    return response.data.data;
  },

  replyToTicket: async (ticketId: string, formData: FormData): Promise<SupportMessage> => {
    const response = await apiClient.post<ApiResponse<{ message: SupportMessage }>>(
      `/support/tickets/${ticketId}/reply`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data.message;
  },

  closeTicket: async (ticketId: string): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>(`/support/tickets/${ticketId}/close`);
    return response.data;
  },
};

export default supportService;
