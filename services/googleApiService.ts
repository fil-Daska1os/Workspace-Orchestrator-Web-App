import { EmailPayload, EventPayload, DocPayload, WorkspaceItem, WorkspaceItemType } from '../types';
import { formatDistanceToNow } from 'date-fns';

const API_BASE = 'https://www.googleapis.com';

// IMPORTANT SECURITY NOTE:
// In a production application, the access token must NEVER be handled on the client-side.
// The correct flow is to send the one-time authorization code to a secure backend server,
// which then exchanges it for a refresh token and access token. The server stores the refresh
// token securely (e.g., in a database with encryption) and uses it to generate new access
// tokens for API calls. All API calls should be proxied through this secure backend.
//
// This client-side implementation is for demonstration and testing purposes ONLY.

const apiFetch = async (url: string, token: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message || 'Google API request failed');
    }
    return response.json();
};

// --- WRITE APIS ---

const btoa_utf8 = (str: string) => {
    return btoa(unescape(encodeURIComponent(str)));
}

export const sendEmail = async (payload: EmailPayload, token: string) => {
    const rawEmail = [
        `To: ${payload.to}`,
        `Subject: ${payload.subject}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        payload.body
    ].join('\n');
    
    const base64EncodedEmail = btoa_utf8(rawEmail).replace(/\+/g, '-').replace(/\//g, '_');
    
    return apiFetch(`${API_BASE}/gmail/v1/users/me/messages/send`, token, {
        method: 'POST',
        body: JSON.stringify({ raw: base64EncodedEmail })
    });
};

export const createCalendarEvent = async (payload: EventPayload, token: string) => {
    const event = {
        summary: payload.title,
        start: {
            dateTime: `${payload.date}T${payload.time}:00`,
            // This should be dynamic based on user's timezone in a real app
            timeZone: 'America/Los_Angeles', 
        },
        end: {
            // Defaulting to a 1-hour event for simplicity
            dateTime: new Date(new Date(`${payload.date}T${payload.time}:00`).getTime() + 60 * 60 * 1000).toISOString(),
            timeZone: 'America/Los_Angeles',
        },
        attendees: payload.attendees?.map(email => ({ email })),
    };
    return apiFetch(`${API_BASE}/calendar/v3/calendars/primary/events`, token, {
        method: 'POST',
        body: JSON.stringify(event),
    });
};

export const createGoogleDoc = async (payload: DocPayload, token: string) => {
    const doc = {
        title: payload.title,
    };
    // The initial content is added in a subsequent call if provided.
    // This is a simplification; a more robust implementation would handle this.
    return apiFetch(`${API_BASE}/v1/documents`, token, {
        method: 'POST',
        body: JSON.stringify(doc),
    });
};


// --- READ APIS (for Feed) ---

const getRecentEmails = async (token: string): Promise<WorkspaceItem[]> => {
    const listResponse = await apiFetch(`${API_BASE}/gmail/v1/users/me/messages?maxResults=5&q=-category:promotions -category:social`, token);
    if (!listResponse.messages) return [];

    const emailPromises = listResponse.messages.map(async (message: any) => {
        const emailData = await apiFetch(`${API_BASE}/gmail/v1/users/me/messages/${message.id}?format=metadata`, token);
        const headers = emailData.payload.headers;
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
        const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
        const date = headers.find((h: any) => h.name === 'Date')?.value;

        return {
            id: emailData.id,
            type: WorkspaceItemType.EMAIL,
            title: subject,
            snippet: `From: ${from.replace(/<.*?>/g, '').trim()}`,
            context: `Regarding email with ID ${emailData.id} and subject "${subject}"`,
            timestamp: date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : 'Recently',
        };
    });
    return Promise.all(emailPromises);
};

const getUpcomingEvents = async (token: string): Promise<WorkspaceItem[]> => {
    const now = new Date().toISOString();
    const eventsResponse = await apiFetch(`${API_BASE}/calendar/v3/calendars/primary/events?maxResults=2&timeMin=${now}&singleEvents=true&orderBy=startTime`, token);
    if (!eventsResponse.items) return [];

    return eventsResponse.items.map((event: any) => {
        const startTime = event.start.dateTime || event.start.date;
        return {
            id: event.id,
            type: WorkspaceItemType.EVENT,
            title: event.summary,
            snippet: new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            context: `About my upcoming event "${event.summary}"`,
            timestamp: formatDistanceToNow(new Date(startTime), { addSuffix: true }),
        };
    });
};

const getRecentFiles = async (token: string): Promise<WorkspaceItem[]> => {
    const filesResponse = await apiFetch(`${API_BASE}/drive/v3/files?pageSize=3&orderBy=modifiedTime desc`, token);
    if (!filesResponse.files) return [];

    return filesResponse.files.map((file: any) => ({
        id: file.id,
        type: WorkspaceItemType.DOCUMENT,
        title: file.name,
        snippet: `Last modified by ${file.lastModifyingUser?.displayName || 'Unknown'}`,
        context: `About the document named "${file.name}" with ID ${file.id}`,
        timestamp: formatDistanceToNow(new Date(file.modifiedTime), { addSuffix: true }),
    }));
};


export const getFeedData = async (token: string): Promise<WorkspaceItem[]> => {
    const [emails, events, files] = await Promise.all([
        getRecentEmails(token),
        getUpcomingEvents(token),
        getRecentFiles(token),
    ]);

    return [...events, ...emails, ...files].sort((a, b) => {
        // A simple sort to bring upcoming events to the top.
        // A more sophisticated sort would be needed for a real app.
        if (a.type === WorkspaceItemType.EVENT && b.type !== WorkspaceItemType.EVENT) return -1;
        if (a.type !== WorkspaceItemType.EVENT && b.type === WorkspaceItemType.EVENT) return 1;
        return 0;
    });
};