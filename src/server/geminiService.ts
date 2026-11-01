import { GoogleGenAI, Type } from '@google/genai';

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function chatWithBrainVault(params: {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  contextNotes?: { id: string; title: string; category: string; tags: string[]; content: string }[];
  contextVaultItems?: { id: string; title: string; type: string; category: string; description: string; content?: string; url?: string }[];
}) {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please verify your environment secrets.');
  }

  const { message, history = [], contextNotes = [], contextVaultItems = [] } = params;

  // Build the grounded knowledge context from user's actual notes
  let knowledgeContext = '';
  if (contextNotes.length > 0 || contextVaultItems.length > 0) {
    knowledgeContext = 'USER SAVED KNOWLEDGE ARCHIVE:\n';
    
    if (contextNotes.length > 0) {
      knowledgeContext += '\n--- SAVED NOTES ---\n';
      contextNotes.slice(0, 25).forEach((n, idx) => {
        knowledgeContext += `[Note #${idx + 1}] ID: ${n.id} | Title: "${n.title}" | Category: ${n.category || 'General'} | Tags: ${(n.tags || []).join(', ')}\nContent excerpt:\n${(n.content || '').slice(0, 1500)}\n\n`;
      });
    }

    if (contextVaultItems.length > 0) {
      knowledgeContext += '\n--- SAVED VAULT ITEMS (Links, Articles, Research) ---\n';
      contextVaultItems.slice(0, 25).forEach((v, idx) => {
        knowledgeContext += `[Vault Item #${idx + 1}] ID: ${v.id} | Type: ${v.type} | Title: "${v.title}" | Category: ${v.category || 'General'}${v.url ? ` | URL: ${v.url}` : ''}\nDescription/Content: ${(v.description || '') + ' ' + (v.content || '')}\n\n`;
      });
    }
  } else {
    knowledgeContext = 'USER SAVED KNOWLEDGE ARCHIVE:\n(No notes or vault items currently saved. User vault is empty.)\n';
  }

  const systemInstruction = `You are BrainVault AI, the intelligent Second Brain copilot.
You help the user recall, synthesize, understand, and organize their personal knowledge universe.

CRITICAL INSTRUCTIONS ON KNOWLEDGE INTEGRITY:
1. Always base knowledge-retrieval answers on the actual user notes and vault items provided below.
2. If the user asks about something not found in their saved notes/vault items, be honest: state clearly "I couldn't find information about this in your saved BrainVault items", then offer general assistance if appropriate.
3. When referencing their saved notes or vault items, cite the exact title in quotes like "[Note: <Title>]" so they can identify the source.
4. Maintain a sleek, modern, analytical, and highly structured tone. Format responses with clean Markdown headers, concise bullet points, bold key concepts, and code blocks where applicable.
5. Provide actionable insights and highlight hidden patterns across their ideas whenever relevant.

${knowledgeContext}`;

  const contents: string[] = [];
  if (history.length > 0) {
    history.slice(-6).forEach(h => {
      contents.push(`${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`);
    });
  }
  contents.push(`User: ${message}`);

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: contents.join('\n\n'),
    config: {
      systemInstruction,
    },
  });

  return response.text || 'No response generated.';
}

export async function executeAiAction(params: {
  action: 'summarize' | 'explain' | 'generate_ideas' | 'rewrite' | 'extract_points' | 'generate_questions' | 'study_flashcards' | 'find_connections';
  title?: string;
  content: string;
  allNotesSummary?: { id: string; title: string; category: string; snippet: string }[];
}) {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please verify your environment secrets.');
  }

  const { action, title = 'Untitled', content, allNotesSummary = [] } = params;

  if (action === 'study_flashcards') {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Create high-quality study flashcards based on this content:\nTitle: ${title}\nContent:\n${content}`,
      config: {
        systemInstruction: 'You are an expert cognitive learning assistant. Create 4 to 8 high-impact question & answer flashcard pairs to master this material.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING, description: 'Direct question or prompt' },
              answer: { type: Type.STRING, description: 'Clear, concise factual answer' },
            },
            required: ['id', 'question', 'answer'],
          },
        },
      },
    });

    try {
      const parsed = JSON.parse(response.text || '[]');
      return parsed;
    } catch {
      return [];
    }
  }

  if (action === 'find_connections') {
    const notesList = allNotesSummary.map(n => `- "${n.title}" (${n.category}): ${n.snippet}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Analyze these notes and find non-obvious thematic links, conceptual parallels, and cross-disciplinary connections:\n\nTarget Note:\nTitle: ${title}\nContent:\n${content}\n\nOther Notes in Vault:\n${notesList || 'None'}`,
      config: {
        systemInstruction: 'You are a knowledge graph synthesizer. Discover connections between notes, explain why they connect, and suggest an actionable synergy or new insight.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sourceTitle: { type: Type.STRING },
              targetTitle: { type: Type.STRING },
              connectionReason: { type: Type.STRING },
              suggestedAction: { type: Type.STRING },
            },
            required: ['sourceTitle', 'targetTitle', 'connectionReason'],
          },
        },
      },
    });

    try {
      return JSON.parse(response.text || '[]');
    } catch {
      return [];
    }
  }

  let prompt = '';
  let systemInstruction = 'You are an advanced cognitive assistant for BrainVault.';

  switch (action) {
    case 'summarize':
      prompt = `Provide a comprehensive yet scannable summary for the following text:\nTitle: ${title}\nContent:\n${content}\n\nInclude:\n1. ⚡ TL;DR (2-3 sentences)\n2. 🔑 Core Takeaways (bulleted)\n3. 💡 Practical Implications / Action Steps`;
      systemInstruction = 'You are an executive knowledge synthesizer. Produce sharp, structured, visually pleasing markdown.';
      break;

    case 'explain':
      prompt = `Explain the following topic or note simply, intuitively, and deeply:\nTitle: ${title}\nContent:\n${content}\n\nUse clear analogies, break down complicated jargon, explain why it matters, and provide a 3-step mental model.`;
      systemInstruction = 'You are a master educator who explains complex ideas with crystal clarity like Richard Feynman.';
      break;

    case 'generate_ideas':
      prompt = `Generate 6-8 creative, unorthodox, high-value ideas, extensions, or project concepts stemming from this note:\nTitle: ${title}\nContent:\n${content}`;
      systemInstruction = 'You are an elite creative strategist and lateral thinker. Provide unique, practical, and ambitious brainstormed ideas.';
      break;

    case 'rewrite':
      prompt = `Rewrite and polish this note into a beautifully formatted, clean, publication-grade markdown document with intuitive headers, bullet points, and highlight quotes:\nTitle: ${title}\nContent:\n${content}`;
      systemInstruction = 'You are a world-class editor and technical author. Elevate readability, structure, and clarity while preserving the original meaning and substance.';
      break;

    case 'extract_points':
      prompt = `Extract all key factual assertions, crucial data points, core arguments, and action items from this text:\nTitle: ${title}\nContent:\n${content}`;
      systemInstruction = 'You are an intelligence analyst. Extract precise, high-density facts and key points without fluff.';
      break;

    case 'generate_questions':
      prompt = `Generate 5 deep, thought-provoking questions from this note for reflection, critical analysis, or study mastery:\nTitle: ${title}\nContent:\n${content}`;
      systemInstruction = 'You are a Socratic tutor. Formulate questions that challenge assumptions and test retention.';
      break;

    default:
      prompt = `Analyze this note and provide key insights:\nTitle: ${title}\nContent:\n${content}`;
      break;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction,
    },
  });

  return response.text || '';
}
