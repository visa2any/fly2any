/**
 * Database Conversation Service
 * Handles AI conversation persistence to PostgreSQL via Prisma
 */

import { prisma } from '@/lib/db/prisma';
import type { ConversationState } from './conversation-persistence';

/**
 * Save conversation to database
 * Creates or updates conversation and all messages
 */
export async function saveConversationToDB(
  conversation: ConversationState,
  userId?: string
): Promise<void> {
  if (!prisma) {
    console.warn('Database not configured - skipping DB save');
    return;
  }

  try {
    // Upsert conversation
    await prisma.aIConversation.upsert({
      where: { sessionId: conversation.sessionId },
      create: {
        sessionId: conversation.sessionId,
        userId: userId || conversation.userId,
        status: conversation.status,
        currentConsultantTeam: conversation.currentConsultantTeam,
        conversationContext: conversation.conversationContext as any,
        searchHistory: conversation.searchHistory as any,
        metadata: conversation.metadata as any,
      },
      update: {
        userId: userId || conversation.userId,
        status: conversation.status,
        currentConsultantTeam: conversation.currentConsultantTeam,
        conversationContext: conversation.conversationContext as any,
        searchHistory: conversation.searchHistory as any,
        metadata: conversation.metadata as any,
        updatedAt: new Date(),
      },
    });

    // Get conversation ID
    const dbConversation = await prisma.aIConversation.findUnique({
      where: { sessionId: conversation.sessionId },
      select: { id: true },
    });

    if (!dbConversation) {
      throw new Error('Failed to create/find conversation');
    }

    // Save all messages
    for (const message of conversation.messages) {
      await prisma.aIMessage.upsert({
        where: { id: message.id },
        create: {
          id: message.id,
          conversationId: dbConversation.id,
          role: message.role,
          content: message.content,
          consultantName: message.consultant?.name,
          consultantTeam: message.consultant?.team,
          consultantEmoji: message.consultant?.emoji,
          flightResults: message.flightResults as any,
          hotelResults: message.hotelResults as any,
          timestamp: BigInt(message.timestamp),
        },
        update: {
          content: message.content,
          consultantName: message.consultant?.name,
          consultantTeam: message.consultant?.team,
          consultantEmoji: message.consultant?.emoji,
          flightResults: message.flightResults as any,
          hotelResults: message.hotelResults as any,
        },
      });
    }
  } catch (error) {
    console.error('Failed to save conversation to database:', error);
    throw error;
  }
}

/**
 * Load conversation from database by session ID
 */
export async function loadConversationFromDB(
  sessionId: string
): Promise<ConversationState | null> {
  if (!prisma) {
    console.warn('Database not configured - skipping DB load');
    return null;
  }

  try {
    const conversation = await prisma.aIConversation.findUnique({
      where: { sessionId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!conversation) {
      return null;
    }

    // Transform database conversation to ConversationState
    return {
      id: conversation.id,
      sessionId: conversation.sessionId,
      userId: conversation.userId,
      status: conversation.status as 'active' | 'completed' | 'abandoned',
      currentConsultantTeam: conversation.currentConsultantTeam || undefined,
      conversationContext: conversation.conversationContext as any,
      searchHistory: conversation.searchHistory as any,
      metadata: conversation.metadata as any,
      messages: conversation.messages.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: Number(msg.timestamp),
        consultant: msg.consultantName
          ? {
              name: msg.consultantName,
              team: msg.consultantTeam!,
              emoji: msg.consultantEmoji!,
            }
          : undefined,
        flightResults: msg.flightResults as any,
        hotelResults: msg.hotelResults as any,
      })),
    };
  } catch (error) {
    console.error('Failed to load conversation from database:', error);
    return null;
  }
}

/**
 * Load all conversations for a user
 */
export async function loadUserConversations(
  userId: string,
  limit: number = 10
): Promise<ConversationState[]> {
  if (!prisma) {
    console.warn('Database not configured - skipping DB load');
    return [];
  }

  try {
    const conversations = await prisma.aIConversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    return conversations.map(conversation => ({
      id: conversation.id,
      sessionId: conversation.sessionId,
      userId: conversation.userId,
      status: conversation.status as 'active' | 'completed' | 'abandoned',
      currentConsultantTeam: conversation.currentConsultantTeam || undefined,
      conversationContext: conversation.conversationContext as any,
      searchHistory: conversation.searchHistory as any,
      metadata: conversation.metadata as any,
      messages: conversation.messages.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: Number(msg.timestamp),
        consultant: msg.consultantName
          ? {
              name: msg.consultantName,
              team: msg.consultantTeam!,
              emoji: msg.consultantEmoji!,
            }
          : undefined,
        flightResults: msg.flightResults as any,
        hotelResults: msg.hotelResults as any,
      })),
    }));
  } catch (error) {
    console.error('Failed to load user conversations:', error);
    return [];
  }
}

/**
 * Associate conversation with user (when user logs in)
 */
export async function associateConversationWithUser(
  sessionId: string,
  userId: string
): Promise<void> {
  if (!prisma) {
    console.warn('Database not configured - skipping DB update');
    return;
  }

  try {
    await prisma.aIConversation.update({
      where: { sessionId },
      data: { userId },
    });
  } catch (error) {
    console.error('Failed to associate conversation with user:', error);
    throw error;
  }
}

/**
 * Mark conversation as completed
 */
export async function markConversationComplete(
  sessionId: string
): Promise<void> {
  if (!prisma) {
    console.warn('Database not configured - skipping DB update');
    return;
  }

  try {
    const conversation = await prisma.aIConversation.findUnique({
      where: { sessionId },
      select: { metadata: true },
    });

    if (!conversation) return;

    const metadata = conversation.metadata as any;
    metadata.completedAt = Date.now();

    await prisma.aIConversation.update({
      where: { sessionId },
      data: {
        status: 'completed',
        metadata: metadata as any,
      },
    });
  } catch (error) {
    console.error('Failed to mark conversation complete:', error);
    throw error;
  }
}

/**
 * Delete a specific conversation by ID
 * Verifies ownership before deletion
 */
export async function deleteConversationFromDB(
  conversationId: string,
  userId: string
): Promise<void> {
  if (!prisma) {
    throw new Error('Database not configured');
  }

  try {
    // First, verify the conversation exists and belongs to the user
    const conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId },
      select: { userId: true },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new Error('Forbidden - not your conversation');
    }

    // Delete the conversation (messages will be cascade deleted)
    await prisma.aIConversation.delete({
      where: { id: conversationId },
    });

    console.log(`Deleted conversation ${conversationId} for user ${userId}`);
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    throw error;
  }
}

/**
 * Delete old conversations (cleanup job)
 */
export async function deleteOldConversations(
  daysOld: number = 90
): Promise<number> {
  if (!prisma) {
    console.warn('Database not configured - skipping cleanup');
    return 0;
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.aIConversation.deleteMany({
      where: {
        updatedAt: {
          lt: cutoffDate,
        },
        status: {
          in: ['completed', 'abandoned'],
        },
      },
    });

    return result.count;
  } catch (error) {
    console.error('Failed to delete old conversations:', error);
    return 0;
  }
}
