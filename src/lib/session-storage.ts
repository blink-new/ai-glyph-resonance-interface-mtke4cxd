import { ResonanceAnalysis } from './ai-providers';
import { VoiceAnalysis } from './voice-recorder';

export interface SessionEntry {
  id: string;
  timestamp: number;
  inputType: 'text' | 'voice' | 'symbol';
  inputData: string;
  analysis: ResonanceAnalysis;
  voiceAnalysis?: VoiceAnalysis;
  glyphSnapshot?: string; // Base64 encoded image
  tags: string[];
  notes?: string;
}

export interface UserSession {
  id: string;
  startTime: number;
  entries: SessionEntry[];
  totalAnalyses: number;
  favoriteGlyphs: string[];
  preferences: {
    aiProvider: string;
    autoAnalyze: boolean;
    saveHistory: boolean;
    darkMode: boolean;
  };
}

export class SessionManager {
  private static readonly STORAGE_KEY = 'glyphmind_session';
  private static readonly MAX_ENTRIES = 100;
  private currentSession: UserSession;

  constructor() {
    this.currentSession = this.loadSession() || this.createNewSession();
  }

  private createNewSession(): UserSession {
    return {
      id: this.generateId(),
      startTime: Date.now(),
      entries: [],
      totalAnalyses: 0,
      favoriteGlyphs: [],
      preferences: {
        aiProvider: 'Groq',
        autoAnalyze: true,
        saveHistory: true,
        darkMode: true
      }
    };
  }

  private generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadSession(): UserSession | null {
    try {
      const stored = localStorage.getItem(SessionManager.STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        // Validate session structure
        if (session.id && session.entries && Array.isArray(session.entries)) {
          return session;
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
    return null;
  }

  private saveSession(): void {
    try {
      localStorage.setItem(SessionManager.STORAGE_KEY, JSON.stringify(this.currentSession));
    } catch (error) {
      console.error('Error saving session:', error);
      // Handle storage quota exceeded
      if (error instanceof DOMException && error.code === 22) {
        this.cleanupOldEntries();
        try {
          localStorage.setItem(SessionManager.STORAGE_KEY, JSON.stringify(this.currentSession));
        } catch (retryError) {
          console.error('Failed to save session after cleanup:', retryError);
        }
      }
    }
  }

  private cleanupOldEntries(): void {
    // Keep only the most recent entries
    const keepCount = Math.floor(SessionManager.MAX_ENTRIES * 0.7);
    this.currentSession.entries = this.currentSession.entries
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, keepCount);
  }

  addEntry(
    inputType: SessionEntry['inputType'],
    inputData: string,
    analysis: ResonanceAnalysis,
    voiceAnalysis?: VoiceAnalysis,
    glyphSnapshot?: string
  ): SessionEntry {
    const entry: SessionEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      inputType,
      inputData,
      analysis,
      voiceAnalysis,
      glyphSnapshot,
      tags: this.generateTags(analysis),
      notes: ''
    };

    this.currentSession.entries.unshift(entry); // Add to beginning
    this.currentSession.totalAnalyses++;

    // Limit entries to prevent storage overflow
    if (this.currentSession.entries.length > SessionManager.MAX_ENTRIES) {
      this.currentSession.entries = this.currentSession.entries.slice(0, SessionManager.MAX_ENTRIES);
    }

    if (this.currentSession.preferences.saveHistory) {
      this.saveSession();
    }

    return entry;
  }

  private generateTags(analysis: ResonanceAnalysis): string[] {
    const tags: string[] = [];

    // Add intensity tags
    if (analysis.cognitiveLoad > 70) tags.push('complex');
    if (analysis.emotionalIntensity > 70) tags.push('intense');
    if (analysis.symbolicDensity > 70) tags.push('symbolic');
    if (analysis.temporalFlow > 70) tags.push('dynamic');

    // Add glyph shape tag
    tags.push(analysis.glyphData.shape);

    // Add emergence tag if significant points found
    if (analysis.emergencePoints.length > 2) tags.push('emergent');

    return tags;
  }

  getEntries(limit?: number): SessionEntry[] {
    const entries = this.currentSession.entries;
    return limit ? entries.slice(0, limit) : entries;
  }

  getEntry(id: string): SessionEntry | null {
    return this.currentSession.entries.find(entry => entry.id === id) || null;
  }

  updateEntry(id: string, updates: Partial<SessionEntry>): boolean {
    const index = this.currentSession.entries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      this.currentSession.entries[index] = { ...this.currentSession.entries[index], ...updates };
      this.saveSession();
      return true;
    }
    return false;
  }

  deleteEntry(id: string): boolean {
    const index = this.currentSession.entries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      this.currentSession.entries.splice(index, 1);
      this.saveSession();
      return true;
    }
    return false;
  }

  addToFavorites(glyphSnapshot: string): void {
    if (!this.currentSession.favoriteGlyphs.includes(glyphSnapshot)) {
      this.currentSession.favoriteGlyphs.push(glyphSnapshot);
      this.saveSession();
    }
  }

  removeFromFavorites(glyphSnapshot: string): void {
    const index = this.currentSession.favoriteGlyphs.indexOf(glyphSnapshot);
    if (index !== -1) {
      this.currentSession.favoriteGlyphs.splice(index, 1);
      this.saveSession();
    }
  }

  getFavorites(): string[] {
    return [...this.currentSession.favoriteGlyphs];
  }

  updatePreferences(preferences: Partial<UserSession['preferences']>): void {
    this.currentSession.preferences = { ...this.currentSession.preferences, ...preferences };
    this.saveSession();
  }

  getPreferences(): UserSession['preferences'] {
    return { ...this.currentSession.preferences };
  }

  getSessionStats(): {
    totalEntries: number;
    totalAnalyses: number;
    sessionDuration: number;
    averageAnalysisTime: number;
    topTags: Array<{ tag: string; count: number }>;
    glyphShapeDistribution: Array<{ shape: string; count: number }>;
  } {
    const sessionDuration = Date.now() - this.currentSession.startTime;
    const averageAnalysisTime = this.currentSession.entries.length > 0 
      ? sessionDuration / this.currentSession.entries.length 
      : 0;

    // Calculate tag frequency
    const tagCounts = new Map<string, number>();
    this.currentSession.entries.forEach(entry => {
      entry.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    const topTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate glyph shape distribution
    const shapeCounts = new Map<string, number>();
    this.currentSession.entries.forEach(entry => {
      const shape = entry.analysis.glyphData.shape;
      shapeCounts.set(shape, (shapeCounts.get(shape) || 0) + 1);
    });

    const glyphShapeDistribution = Array.from(shapeCounts.entries())
      .map(([shape, count]) => ({ shape, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalEntries: this.currentSession.entries.length,
      totalAnalyses: this.currentSession.totalAnalyses,
      sessionDuration,
      averageAnalysisTime,
      topTags,
      glyphShapeDistribution
    };
  }

  exportSession(): string {
    return JSON.stringify(this.currentSession, null, 2);
  }

  importSession(sessionData: string): boolean {
    try {
      const imported = JSON.parse(sessionData);
      if (imported.id && imported.entries && Array.isArray(imported.entries)) {
        this.currentSession = imported;
        this.saveSession();
        return true;
      }
    } catch (error) {
      console.error('Error importing session:', error);
    }
    return false;
  }

  clearSession(): void {
    this.currentSession = this.createNewSession();
    localStorage.removeItem(SessionManager.STORAGE_KEY);
  }

  searchEntries(query: string, filters?: {
    inputType?: SessionEntry['inputType'];
    tags?: string[];
    dateRange?: { start: number; end: number };
  }): SessionEntry[] {
    let results = this.currentSession.entries;

    // Text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      results = results.filter(entry => 
        entry.inputData.toLowerCase().includes(searchTerm) ||
        entry.analysis.meaningSignature.toLowerCase().includes(searchTerm) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Apply filters
    if (filters) {
      if (filters.inputType) {
        results = results.filter(entry => entry.inputType === filters.inputType);
      }

      if (filters.tags && filters.tags.length > 0) {
        results = results.filter(entry => 
          filters.tags!.some(tag => entry.tags.includes(tag))
        );
      }

      if (filters.dateRange) {
        results = results.filter(entry => 
          entry.timestamp >= filters.dateRange!.start && 
          entry.timestamp <= filters.dateRange!.end
        );
      }
    }

    return results;
  }
}