import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  
  // In development mode, backend handles all data
  // No database queries needed - backend manages sessions and history
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // For development, create a minimal chat object
  // Backend will handle actual session management
  const chat = isDevelopment ? {
    id,
    visibility: 'public' as const,
    userId: 'dev-user',
    title: 'Development Chat'
  } : null;

  if (!chat) {
    // In production, would fetch from backend API
    // For now, allow all chats in development
    if (!isDevelopment) {
      notFound();
    }
  }

  // Skip auth in development - backend handles it
  const session = isDevelopment ? {
    user: { id: 'dev-user', email: 'dev@cargeek.com' }
  } : await auth();

  if (!session && !isDevelopment) {
    redirect('/api/auth/guest');
  }

  // No database queries - backend handles message history
  const uiMessages = [];

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');

  // Use the same progressive layout Chat component for consistency
  const chatModel = chatModelFromCookie?.value || DEFAULT_CHAT_MODEL;

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={uiMessages}
        initialChatModel={chatModel}
        initialVisibilityType={chat.visibility}
        isReadonly={false}
        autoResume={true}
      />
      <DataStreamHandler />
    </>
  );
}
