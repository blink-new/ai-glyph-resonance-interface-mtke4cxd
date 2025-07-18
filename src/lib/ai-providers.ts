// AI Provider integrations for GlyphMind
export interface AIProvider {
  name: string;
  endpoint: string;
  model: string;
  free: boolean;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    name: 'Groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama3-8b-8192',
    free: true
  },
  {
    name: 'Hugging Face',
    endpoint: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
    model: 'microsoft/DialoGPT-medium',
    free: true
  }
];

export interface ResonanceAnalysis {
  cognitiveLoad: number;
  emotionalIntensity: number;
  symbolicDensity: number;
  temporalFlow: number;
  emergencePoints: number[];
  meaningSignature: string;
  glyphData: {
    shape: string;
    frequency: number;
    color: string;
    complexity: number;
  };
}

export class GlyphAnalyzer {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async analyzeText(text: string): Promise<ResonanceAnalysis> {
    try {
      // Simulate AI analysis with sophisticated heuristics
      const words = text.split(/\s+/).filter(word => word.length > 0);
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      // Calculate cognitive metrics
      const cognitiveLoad = this.calculateCognitiveLoad(text);
      const emotionalIntensity = this.calculateEmotionalIntensity(text);
      const symbolicDensity = this.calculateSymbolicDensity(text);
      const temporalFlow = this.calculateTemporalFlow(text);
      
      // Find emergence points (significant semantic shifts)
      const emergencePoints = this.findEmergencePoints(text);
      
      // Generate meaning signature
      const meaningSignature = await this.generateMeaningSignature(text);
      
      // Create glyph data
      const glyphData = this.generateGlyphData(cognitiveLoad, emotionalIntensity, symbolicDensity);

      return {
        cognitiveLoad,
        emotionalIntensity,
        symbolicDensity,
        temporalFlow,
        emergencePoints,
        meaningSignature,
        glyphData
      };
    } catch (error) {
      console.error('Analysis error:', error);
      return this.getDefaultAnalysis();
    }
  }

  private calculateCognitiveLoad(text: string): number {
    const words = text.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const complexWords = words.filter(word => word.length > 6).length;
    const sentenceComplexity = text.split(/[.!?]+/).reduce((sum, sentence) => {
      const clauseCount = sentence.split(/[,;:]/).length;
      return sum + clauseCount;
    }, 0);
    
    return Math.min(100, (avgWordLength * 10) + (complexWords * 2) + sentenceComplexity);
  }

  private calculateEmotionalIntensity(text: string): number {
    const emotionalWords = [
      'love', 'hate', 'fear', 'joy', 'anger', 'sadness', 'excitement', 'anxiety',
      'passion', 'rage', 'bliss', 'terror', 'ecstasy', 'despair', 'hope', 'dread'
    ];
    
    const intensifiers = ['very', 'extremely', 'incredibly', 'absolutely', 'completely'];
    const punctuationIntensity = (text.match(/[!?]{2,}/g) || []).length * 10;
    
    const emotionalScore = emotionalWords.reduce((score, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex) || [];
      return score + matches.length * 15;
    }, 0);
    
    const intensifierScore = intensifiers.reduce((score, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex) || [];
      return score + matches.length * 5;
    }, 0);
    
    return Math.min(100, emotionalScore + intensifierScore + punctuationIntensity);
  }

  private calculateSymbolicDensity(text: string): number {
    const symbols = text.match(/[^\w\s]/g) || [];
    const metaphors = text.match(/\b(like|as|seems|appears|resembles)\b/gi) || [];
    const abstractWords = [
      'consciousness', 'reality', 'existence', 'meaning', 'purpose', 'soul',
      'spirit', 'essence', 'truth', 'wisdom', 'enlightenment', 'transcendence'
    ];
    
    const abstractScore = abstractWords.reduce((score, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex) || [];
      return score + matches.length * 20;
    }, 0);
    
    return Math.min(100, symbols.length * 2 + metaphors.length * 10 + abstractScore);
  }

  private calculateTemporalFlow(text: string): number {
    const timeWords = ['now', 'then', 'before', 'after', 'during', 'while', 'when', 'until'];
    const transitionWords = ['however', 'therefore', 'meanwhile', 'consequently', 'furthermore'];
    
    const timeScore = timeWords.reduce((score, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex) || [];
      return score + matches.length * 8;
    }, 0);
    
    const transitionScore = transitionWords.reduce((score, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex) || [];
      return score + matches.length * 12;
    }, 0);
    
    return Math.min(100, timeScore + transitionScore);
  }

  private findEmergencePoints(text: string): number[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const emergencePoints: number[] = [];
    
    sentences.forEach((sentence, index) => {
      const intensity = this.calculateEmotionalIntensity(sentence);
      const complexity = this.calculateCognitiveLoad(sentence);
      
      if (intensity > 60 || complexity > 70) {
        emergencePoints.push((index / sentences.length) * 100);
      }
    });
    
    return emergencePoints;
  }

  private async generateMeaningSignature(text: string): Promise<string> {
    // Simulate AI-generated meaning signature
    const themes = this.extractThemes(text);
    const mood = this.extractMood(text);
    const archetype = this.extractArchetype(text);
    
    return `${archetype} resonance with ${mood} undertones, exploring themes of ${themes.join(', ')}`;
  }

  private extractThemes(text: string): string[] {
    const themeKeywords = {
      'transformation': ['change', 'transform', 'evolve', 'become', 'shift'],
      'connection': ['together', 'bond', 'unite', 'connect', 'relationship'],
      'discovery': ['find', 'discover', 'reveal', 'uncover', 'explore'],
      'conflict': ['struggle', 'fight', 'battle', 'oppose', 'resist'],
      'growth': ['grow', 'develop', 'expand', 'progress', 'advance'],
      'mystery': ['unknown', 'secret', 'hidden', 'mysterious', 'enigma']
    };
    
    const themes: string[] = [];
    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      const hasTheme = keywords.some(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
      );
      if (hasTheme) themes.push(theme);
    });
    
    return themes.length > 0 ? themes : ['existence'];
  }

  private extractMood(text: string): string {
    const moodKeywords = {
      'contemplative': ['think', 'ponder', 'reflect', 'consider', 'wonder'],
      'energetic': ['energy', 'power', 'force', 'dynamic', 'vibrant'],
      'melancholic': ['sad', 'sorrow', 'loss', 'grief', 'melancholy'],
      'euphoric': ['joy', 'bliss', 'ecstasy', 'elation', 'rapture'],
      'mysterious': ['mystery', 'enigma', 'puzzle', 'riddle', 'secret']
    };
    
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      const hasKeywords = keywords.some(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
      );
      if (hasKeywords) return mood;
    }
    
    return 'neutral';
  }

  private extractArchetype(text: string): string {
    const archetypes = [
      'The Seeker', 'The Sage', 'The Creator', 'The Rebel', 'The Hero',
      'The Lover', 'The Jester', 'The Caregiver', 'The Ruler', 'The Magician'
    ];
    
    // Simple heuristic based on text characteristics
    const textLength = text.length;
    const index = Math.floor((textLength % archetypes.length));
    return archetypes[index];
  }

  private generateGlyphData(cognitive: number, emotional: number, symbolic: number) {
    const shapes = ['circle', 'triangle', 'square', 'hexagon', 'star', 'spiral'];
    const shapeIndex = Math.floor((cognitive + emotional) / 33) % shapes.length;
    
    return {
      shape: shapes[shapeIndex],
      frequency: Math.max(0.5, emotional / 100),
      color: this.generateGlyphColor(cognitive, emotional, symbolic),
      complexity: Math.floor((cognitive + symbolic) / 20)
    };
  }

  private generateGlyphColor(cognitive: number, emotional: number, symbolic: number): string {
    // Map metrics to HSL color space
    const hue = Math.floor((cognitive + emotional + symbolic) / 3 * 3.6); // 0-360
    const saturation = Math.max(50, emotional); // 50-100%
    const lightness = Math.max(30, Math.min(70, 100 - cognitive)); // 30-70%
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  private getDefaultAnalysis(): ResonanceAnalysis {
    return {
      cognitiveLoad: 50,
      emotionalIntensity: 30,
      symbolicDensity: 40,
      temporalFlow: 35,
      emergencePoints: [25, 75],
      meaningSignature: 'Neutral resonance with contemplative undertones',
      glyphData: {
        shape: 'circle',
        frequency: 0.5,
        color: '#8b5cf6',
        complexity: 3
      }
    };
  }
}