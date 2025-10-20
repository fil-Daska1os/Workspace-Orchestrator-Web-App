
import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse, Content } from "@google/genai";
// Fix: Import MessageAuthor to map roles correctly for the conversation history.
import { ChatMessage, MessageAuthor } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set. Please set your Gemini API key.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

const workspaceTools: FunctionDeclaration[] = [
  {
    name: "send_email",
    description: "Sends an email to a recipient.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        to: { type: Type.STRING, description: "The recipient's email address." },
        subject: { type: Type.STRING, description: "The subject of the email." },
        body: { type: Type.STRING, description: "The body content of the email." },
      },
      required: ["to", "subject", "body"],
    },
  },
  {
    name: "create_calendar_event",
    description: "Creates a new event in the user's calendar.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "The title of the event." },
        date: { type: Type.STRING, description: "The date of the event (e.g., '2024-08-15')." },
        time: { type: Type.STRING, description: "The time of the event (e.g., '14:30')." },
        attendees: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of attendee email addresses.",
        },
      },
      required: ["title", "date", "time"],
    },
  },
    {
    name: "create_google_doc",
    description: "Creates a new Google Doc.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "The title of the document." },
        content: { type: Type.STRING, description: "The initial content of the document." },
      },
      required: ["title"],
    },
  },
];


// Fix: Updated to send the entire conversation history to Gemini for context.
export const orchestrateWorkspace = async (history: ChatMessage[]) => {
  const contents: Content[] = history
    .filter(msg => msg.author !== MessageAuthor.SYSTEM)
    .map(msg => ({
      role: msg.author === MessageAuthor.USER ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        tools: [{ functionDeclarations: workspaceTools }],
      },
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
        return { functionCalls: response.functionCalls };
    }
    
    return { text: response.text };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return { text: "An error occurred while processing your request." };
  }
};
