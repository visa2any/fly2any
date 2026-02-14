import { v4 as uuidv4 } from 'uuid';

// In-memory store for session metadata (files are stored on disk)
// structure: { sessionId: [ { url, caption, category } ] }
const sessionStore = new Map<string, any[]>();

// Use global to persist across hot reloads in dev
const g = globalThis as any;
if (!g.__mobileUploadSessions) {
  g.__mobileUploadSessions = sessionStore;
}
const sessions = g.__mobileUploadSessions as Map<string, any[]>;

export const mobileUploadService = {
  createSession: () => {
    const id = uuidv4();
    sessions.set(id, []);
    return id;
  },

  getSession: (id: string) => {
    return sessions.get(id);
  },

  addPhoto: (id: string, photo: any) => {
    const existing = sessions.get(id) || [];
    sessions.set(id, [...existing, photo]);
  },
  
  clearSession: (id: string) => {
      sessions.delete(id);
  }
};
