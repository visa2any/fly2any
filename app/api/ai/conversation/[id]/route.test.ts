/**
 * Conversation API Route - Comprehensive Test Suite
 * Tests GET and DELETE endpoints for conversation management
 */

import { GET, DELETE } from './route';
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import {
  loadConversationFromDB,
  deleteConversationFromDB,
} from '@/lib/ai/conversation-db';

// Mock the auth module
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

// Mock the conversation-db module
jest.mock('@/lib/ai/conversation-db', () => ({
  loadConversationFromDB: jest.fn(),
  deleteConversationFromDB: jest.fn(),
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockLoadConversation = loadConversationFromDB as jest.MockedFunction<
  typeof loadConversationFromDB
>;
const mockDeleteConversation = deleteConversationFromDB as jest.MockedFunction<
  typeof deleteConversationFromDB
>;

describe('Conversation API Route - GET /api/ai/conversation/:id', () => {
  const mockSession = {
    user: {
      email: 'test@example.com',
      name: 'Test User',
      id: 'test-user-id',
    },
  };

  const mockConversation = {
    id: 'conv-123',
    sessionId: 'sess-123',
    userId: 'test@example.com',
    messages: [
      {
        role: 'user',
        content: 'Hello',
        timestamp: Date.now(),
      },
      {
        role: 'assistant',
        content: 'Hi there!',
        timestamp: Date.now(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    test('should return 401 when user not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123');
      const params = { params: { id: 'conv-123' } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });

    test('should return 401 when session has no user', async () => {
      mockAuth.mockResolvedValue({ user: null } as any);

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123');
      const params = { params: { id: 'conv-123' } };

      const response = await GET(request, params);

      expect(response.status).toBe(401);
    });

    test('should return 401 when user has no email', async () => {
      mockAuth.mockResolvedValue({
        user: { name: 'Test User' },
      } as any);

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123');
      const params = { params: { id: 'conv-123' } };

      const response = await GET(request, params);

      expect(response.status).toBe(401);
    });
  });

  describe('Input Validation', () => {
    test('should return 400 when session ID is missing', async () => {
      mockAuth.mockResolvedValue(mockSession as any);

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/');
      const params = { params: { id: '' } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Session ID is required');
    });

    test('should handle malformed session IDs', async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      mockLoadConversation.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/invalid-id');
      const params = { params: { id: 'invalid-id' } };

      const response = await GET(request, params);

      expect(response.status).toBe(404);
    });
  });

  describe('Conversation Loading', () => {
    test('should load conversation successfully', async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      mockLoadConversation.mockResolvedValue(mockConversation as any);

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123');
      const params = { params: { id: 'conv-123' } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.conversation).toEqual(mockConversation);
      expect(mockLoadConversation).toHaveBeenCalledWith('conv-123');
    });

    test('should return 404 when conversation not found', async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      mockLoadConversation.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/nonexistent');
      const params = { params: { id: 'nonexistent' } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('Conversation not found');
    });

    test('should verify conversation ownership', async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      mockLoadConversation.mockResolvedValue({
        ...mockConversation,
        userId: 'different-user@example.com',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123');
      const params = { params: { id: 'conv-123' } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Forbidden');
    });

    test('should allow access to own conversations', async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      mockLoadConversation.mockResolvedValue(mockConversation as any);

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123');
      const params = { params: { id: 'conv-123' } };

      const response = await GET(request, params);

      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      mockLoadConversation.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123');
      const params = { params: { id: 'conv-123' } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to load conversation');
      expect(data.details).toContain('Database connection failed');
    });

    test('should handle auth errors', async () => {
      mockAuth.mockRejectedValue(new Error('Auth service unavailable'));

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123');
      const params = { params: { id: 'conv-123' } };

      await expect(GET(request, params)).rejects.toThrow('Auth service unavailable');
    });

    test('should handle unknown errors', async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      mockLoadConversation.mockRejectedValue('Unknown error');

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123');
      const params = { params: { id: 'conv-123' } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.details).toBe('Unknown error');
    });
  });

  describe('Response Format', () => {
    test('should return correct response structure', async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      mockLoadConversation.mockResolvedValue(mockConversation as any);

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123');
      const params = { params: { id: 'conv-123' } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('conversation');
      expect(data.conversation).toHaveProperty('id');
      expect(data.conversation).toHaveProperty('sessionId');
      expect(data.conversation).toHaveProperty('userId');
      expect(data.conversation).toHaveProperty('messages');
    });

    test('should include all conversation fields', async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      mockLoadConversation.mockResolvedValue(mockConversation as any);

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123');
      const params = { params: { id: 'conv-123' } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(data.conversation.messages).toHaveLength(2);
      expect(data.conversation.createdAt).toBeDefined();
      expect(data.conversation.updatedAt).toBeDefined();
    });
  });
});

describe('Conversation API Route - DELETE /api/ai/conversation/:id', () => {
  const mockSession = {
    user: {
      email: 'test@example.com',
      name: 'Test User',
      id: 'test-user-id',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    test('should return 401 when user not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123', {
        method: 'DELETE',
      });
      const params = { params: { id: 'conv-123' } };

      const response = await DELETE(request, params);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });

    test('should require user email', async () => {
      mockAuth.mockResolvedValue({ user: { name: 'Test' } } as any);

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123', {
        method: 'DELETE',
      });
      const params = { params: { id: 'conv-123' } };

      const response = await DELETE(request, params);

      expect(response.status).toBe(401);
    });
  });

  describe('Input Validation', () => {
    test('should return 400 when conversation ID is missing', async () => {
      mockAuth.mockResolvedValue(mockSession as any);

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/', {
        method: 'DELETE',
      });
      const params = { params: { id: '' } };

      const response = await DELETE(request, params);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Conversation ID is required');
    });
  });

  describe('Conversation Deletion', () => {
    test('should delete conversation successfully', async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      mockDeleteConversation.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123', {
        method: 'DELETE',
      });
      const params = { params: { id: 'conv-123' } };

      const response = await DELETE(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('deleted successfully');
      expect(mockDeleteConversation).toHaveBeenCalledWith('conv-123', 'test@example.com');
    });

    test('should return 404 when conversation not found', async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      mockDeleteConversation.mockRejectedValue(new Error('Conversation not found'));

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/nonexistent', {
        method: 'DELETE',
      });
      const params = { params: { id: 'nonexistent' } };

      const response = await DELETE(request, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('Conversation not found');
    });

    test('should return 403 when trying to delete another user\'s conversation', async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      mockDeleteConversation.mockRejectedValue(new Error('Forbidden - not your conversation'));

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv-456', {
        method: 'DELETE',
      });
      const params = { params: { id: 'conv-456' } };

      const response = await DELETE(request, params);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Forbidden');
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors', async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      mockDeleteConversation.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123', {
        method: 'DELETE',
      });
      const params = { params: { id: 'conv-123' } };

      const response = await DELETE(request, params);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to delete conversation');
    });

    test('should handle unknown error types', async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      mockDeleteConversation.mockRejectedValue('String error');

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123', {
        method: 'DELETE',
      });
      const params = { params: { id: 'conv-123' } };

      const response = await DELETE(request, params);

      expect(response.status).toBe(500);
    });
  });

  describe('Response Format', () => {
    test('should return correct success response', async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      mockDeleteConversation.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123', {
        method: 'DELETE',
      });
      const params = { params: { id: 'conv-123' } };

      const response = await DELETE(request, params);
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('message');
      expect(typeof data.message).toBe('string');
    });

    test('should return consistent error response format', async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      mockDeleteConversation.mockRejectedValue(new Error('Test error'));

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123', {
        method: 'DELETE',
      });
      const params = { params: { id: 'conv-123' } };

      const response = await DELETE(request, params);
      const data = await response.json();

      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('details');
    });
  });
});

describe('Conversation API Route - Integration Tests', () => {
  const mockSession = {
    user: {
      email: 'test@example.com',
      name: 'Test User',
      id: 'test-user-id',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET and DELETE Workflow', () => {
    test('should be able to get then delete a conversation', async () => {
      const mockConversation = {
        id: 'conv-123',
        sessionId: 'sess-123',
        userId: 'test@example.com',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuth.mockResolvedValue(mockSession as any);

      // First, GET the conversation
      mockLoadConversation.mockResolvedValue(mockConversation as any);

      const getRequest = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123');
      const params = { params: { id: 'conv-123' } };

      const getResponse = await GET(getRequest, params);
      const getData = await getResponse.json();

      expect(getResponse.status).toBe(200);
      expect(getData.conversation.id).toBe('conv-123');

      // Then, DELETE the conversation
      mockDeleteConversation.mockResolvedValue(undefined);

      const deleteRequest = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123', {
        method: 'DELETE',
      });

      const deleteResponse = await DELETE(deleteRequest, params);
      const deleteData = await deleteResponse.json();

      expect(deleteResponse.status).toBe(200);
      expect(deleteData.success).toBe(true);
    });
  });

  describe('Concurrent Requests', () => {
    test('should handle multiple GET requests', async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      mockLoadConversation.mockResolvedValue({
        id: 'conv-123',
        sessionId: 'sess-123',
        userId: 'test@example.com',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const request1 = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123');
      const request2 = new NextRequest('http://localhost:3000/api/ai/conversation/conv-123');
      const params = { params: { id: 'conv-123' } };

      const [response1, response2] = await Promise.all([
        GET(request1, params),
        GET(request2, params),
      ]);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });
  });

  describe('Special Characters in IDs', () => {
    test('should handle IDs with hyphens', async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      mockLoadConversation.mockResolvedValue({
        id: 'conv-abc-123-xyz',
        sessionId: 'sess-abc-123',
        userId: 'test@example.com',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv-abc-123-xyz');
      const params = { params: { id: 'conv-abc-123-xyz' } };

      const response = await GET(request, params);

      expect(response.status).toBe(200);
    });

    test('should handle IDs with underscores', async () => {
      mockAuth.mockResolvedValue(mockSession as any);
      mockLoadConversation.mockResolvedValue({
        id: 'conv_123',
        sessionId: 'sess_123',
        userId: 'test@example.com',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv_123');
      const params = { params: { id: 'conv_123' } };

      const response = await GET(request, params);

      expect(response.status).toBe(200);
    });
  });

  describe('Large Conversations', () => {
    test('should handle conversations with many messages', async () => {
      const largeMessages = Array.from({ length: 1000 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        timestamp: Date.now(),
      }));

      mockAuth.mockResolvedValue(mockSession as any);
      mockLoadConversation.mockResolvedValue({
        id: 'conv-large',
        sessionId: 'sess-large',
        userId: 'test@example.com',
        messages: largeMessages,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/ai/conversation/conv-large');
      const params = { params: { id: 'conv-large' } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.conversation.messages).toHaveLength(1000);
    });
  });
});
