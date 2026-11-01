import { chatWithBrainVault, executeAiAction } from './geminiService.ts';

export async function handleApiRequest(path: string, body: any): Promise<{ status: number; data: any }> {
  try {
    if (path === '/ai/chat' || path === '/chat') {
      const { message, history, contextNotes, contextVaultItems } = body;
      if (!message || typeof message !== 'string') {
        return { status: 400, data: { error: 'Message is required' } };
      }
      const reply = await chatWithBrainVault({
        message,
        history,
        contextNotes,
        contextVaultItems,
      });
      return { status: 200, data: { reply } };
    }

    if (path === '/ai/action' || path === '/action') {
      const { action, title, content, allNotesSummary } = body;
      if (!action || !content) {
        return { status: 400, data: { error: 'Action and content are required' } };
      }
      const result = await executeAiAction({
        action,
        title,
        content,
        allNotesSummary,
      });
      return { status: 200, data: { result } };
    }

    if (path === '/health') {
      return { status: 200, data: { status: 'healthy', timestamp: new Date().toISOString() } };
    }

    return { status: 404, data: { error: `Endpoint not found: ${path}` } };
  } catch (error: any) {
    console.error('API Error:', error);
    return {
      status: 500,
      data: {
        error: error?.message || 'Internal server error while processing AI request',
      },
    };
  }
}
