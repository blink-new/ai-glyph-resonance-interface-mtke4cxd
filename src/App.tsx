import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Textarea } from './components/ui/textarea';
import { Slider } from './components/ui/slider';
import { Switch } from './components/ui/switch';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { 
  Mic, 
  MicOff, 
  Upload, 
  Play, 
  Pause, 
  Settings, 
  History, 
  Star, 
  Download,
  Zap,
  Brain,
  Heart,
  Clock,
  Sparkles,
  Volume2,
  FileText,
  Image as ImageIcon,
  Moon,
  Sun
} from 'lucide-react';

// Import our new utilities
import { GlyphAnalyzer, AI_PROVIDERS, ResonanceAnalysis } from './lib/ai-providers';
import { VoiceRecorder, SpeechToText, VoiceAnalysis } from './lib/voice-recorder';
import { SessionManager, SessionEntry } from './lib/session-storage';
import { GlyphRenderer } from './lib/glyph-renderer';

function App() {
  // Core state
  const [inputText, setInputText] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState<ResonanceAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('input');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);

  // Biometric simulation state
  const [pulseRate, setPulseRate] = useState([72]);
  const [breathRate, setBreathRate] = useState([16]);

  // Session and history state
  const [sessionEntries, setSessionEntries] = useState<SessionEntry[]>([]);
  const [selectedProvider, setSelectedProvider] = useState(AI_PROVIDERS[0]);

  // Settings state
  const [liveTyping, setLiveTyping] = useState(false);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [showResonanceField, setShowResonanceField] = useState(true);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glyphRendererRef = useRef<GlyphRenderer | null>(null);
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);
  const speechToTextRef = useRef<SpeechToText | null>(null);
  const sessionManagerRef = useRef<SessionManager | null>(null);
  const analyzerRef = useRef<GlyphAnalyzer | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize services
  useEffect(() => {
    // Initialize session manager
    sessionManagerRef.current = new SessionManager();
    const entries = sessionManagerRef.current.getEntries(10);
    setSessionEntries(entries);

    // Initialize AI analyzer
    analyzerRef.current = new GlyphAnalyzer(selectedProvider);

    // Initialize voice services
    voiceRecorderRef.current = new VoiceRecorder();
    speechToTextRef.current = new SpeechToText();

    // Initialize glyph renderer
    if (canvasRef.current) {
      glyphRendererRef.current = new GlyphRenderer(canvasRef.current);
    }

    // Load preferences
    const preferences = sessionManagerRef.current.getPreferences();
    setIsDarkMode(preferences.darkMode);
    setAutoAnalyze(preferences.autoAnalyze);

    return () => {
      if (glyphRendererRef.current) {
        glyphRendererRef.current.stopAnimation();
      }
    };
  }, [selectedProvider]);

  // Handle live typing analysis
  useEffect(() => {
    if (liveTyping && inputText.trim() && autoAnalyze) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        handleAnalyze();
      }, 1000); // Analyze after 1 second of no typing
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [inputText, liveTyping, autoAnalyze, handleAnalyze]);

  // Update glyph renderer when analysis changes
  useEffect(() => {
    if (currentAnalysis && glyphRendererRef.current && canvasRef.current) {
      glyphRendererRef.current.render(currentAnalysis, {
        width: canvasRef.current.width,
        height: canvasRef.current.height,
        animate: true,
        showParticles,
        showResonanceField,
        complexity: currentAnalysis.glyphData.complexity
      });
    }
  }, [currentAnalysis, showParticles, showResonanceField]);

  const handleAnalyze = useCallback(async () => {
    if (!inputText.trim() || !analyzerRef.current) return;

    setIsAnalyzing(true);
    try {
      const analysis = await analyzerRef.current.analyzeText(inputText);
      setCurrentAnalysis(analysis);

      // Save to session
      if (sessionManagerRef.current) {
        const entry = sessionManagerRef.current.addEntry(
          'text',
          inputText,
          analysis,
          voiceAnalysis || undefined
        );
        setSessionEntries(prev => [entry, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [inputText, voiceAnalysis]);

  const handleVoiceRecord = async () => {
    if (!voiceRecorderRef.current) return;

    if (isRecording) {
      try {
        const { audioBlob, analysis } = await voiceRecorderRef.current.stopRecording();
        setIsRecording(false);
        setVoiceAnalysis(analysis);
        
        // Convert audio to text if speech recognition is available
        if (speechToTextRef.current) {
          // For demo purposes, we'll simulate transcription
          const simulatedText = "Voice input detected - analyzing acoustic patterns and emotional resonance...";
          setInputText(prev => prev + (prev ? ' ' : '') + simulatedText);
        }
      } catch (error) {
        console.error('Recording failed:', error);
        setIsRecording(false);
      }
    } else {
      try {
        await voiceRecorderRef.current.startRecording({ maxDuration: 60 });
        setIsRecording(true);
      } catch (error) {
        console.error('Could not start recording:', error);
      }
    }
  };

  const handleSpeechToText = async () => {
    if (!speechToTextRef.current) return;

    if (isListening) {
      speechToTextRef.current.stopListening();
      setIsListening(false);
    } else {
      try {
        await speechToTextRef.current.startListening((text, isFinal) => {
          if (isFinal) {
            setInputText(prev => prev + (prev ? ' ' : '') + text);
          }
        });
        setIsListening(true);
      } catch (error) {
        console.error('Speech recognition failed:', error);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (file.type.startsWith('text/')) {
        setInputText(content);
      } else {
        // For non-text files, add a description
        setInputText(`Uploaded file: ${file.name} (${file.type}) - analyzing symbolic content and metadata patterns...`);
      }
    };
    reader.readAsText(file);
  };

  const exportSession = () => {
    if (!sessionManagerRef.current) return;
    
    const sessionData = sessionManagerRef.current.exportSession();
    const blob = new Blob([sessionData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glyphmind-session-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (sessionManagerRef.current) {
      sessionManagerRef.current.updatePreferences({ darkMode: !isDarkMode });
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'dark bg-obsidian' : 'bg-gray-50'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="neural-grid opacity-20"></div>
        <div className="particle-trails"></div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="sacred-mandala"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 12}%`,
              animationDelay: `${i * 0.5}s`
            }}
          ></div>
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 border-b border-cyan/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="glyph-morph w-12 h-12 bg-gradient-to-br from-cyan to-violet rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan to-violet bg-clip-text text-transparent">
                GlyphMind
              </h1>
              <p className="text-sm text-gray-400">AI Symbolic Resonance Interpreter</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-cyan/30 text-cyan">
              {selectedProvider.name} • Free Tier
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-gray-400 hover:text-white"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Input & Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Multi-Modal Input Hub */}
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Input Hub</h2>
              <div className="flex space-x-2">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={handleVoiceRecord}
                  className="border-cyan/30"
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button
                  variant={isListening ? "default" : "outline"}
                  size="sm"
                  onClick={handleSpeechToText}
                  className="border-cyan/30"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="border-cyan/30"
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".txt,.md,.json,image/*"
                />
              </div>
            </div>

            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your stream of consciousness, upload a symbol, or speak your thoughts..."
              className="min-h-32 bg-obsidian/50 border-cyan/20 text-white placeholder-gray-400 resize-none"
            />

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={liveTyping}
                    onCheckedChange={setLiveTyping}
                  />
                  <span className="text-sm text-gray-400">Live Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={autoAnalyze}
                    onCheckedChange={setAutoAnalyze}
                  />
                  <span className="text-sm text-gray-400">Auto-Analyze</span>
                </div>
              </div>
              
              <Button
                onClick={handleAnalyze}
                disabled={!inputText.trim() || isAnalyzing}
                className="bg-gradient-to-r from-cyan to-violet hover:from-cyan/80 hover:to-violet/80"
              >
                {isAnalyzing ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Analyze</span>
                  </div>
                )}
              </Button>
            </div>
          </Card>

          {/* Biometric Emulator */}
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Biometric Emulator</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Pulse Rate</span>
                  <span className="text-sm text-cyan">{pulseRate[0]} BPM</span>
                </div>
                <Slider
                  value={pulseRate}
                  onValueChange={setPulseRate}
                  min={40}
                  max={120}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Breath Rate</span>
                  <span className="text-sm text-violet">{breathRate[0]} RPM</span>
                </div>
                <Slider
                  value={breathRate}
                  onValueChange={setBreathRate}
                  min={8}
                  max={30}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </Card>

          {/* Live Resonance Clock */}
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Resonance Clock</h3>
              <div className="resonance-pulse w-4 h-4 bg-cyan rounded-full"></div>
            </div>
            
            {currentAnalysis && (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan">{Math.round(currentAnalysis.cognitiveLoad)}</div>
                  <div className="text-xs text-gray-400">Cognitive</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-violet">{Math.round(currentAnalysis.emotionalIntensity)}</div>
                  <div className="text-xs text-gray-400">Emotional</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gold">{Math.round(currentAnalysis.symbolicDensity)}</div>
                  <div className="text-xs text-gray-400">Symbolic</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan">{Math.round(currentAnalysis.temporalFlow)}</div>
                  <div className="text-xs text-gray-400">Temporal</div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Center Panel - Glyph Canvas */}
        <div className="lg:col-span-1">
          <Card className="glass-card p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Glyph Canvas</h2>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowParticles(!showParticles)}
                  className="border-cyan/30"
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResonanceField(!showResonanceField)}
                  className="border-cyan/30"
                >
                  <Brain className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="w-full h-auto border border-cyan/20 rounded-lg bg-obsidian/30"
              />
              
              {!currentAnalysis && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Enter text to generate your glyph</p>
                  </div>
                </div>
              )}
            </div>

            {currentAnalysis && (
              <div className="mt-4 p-4 bg-obsidian/30 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2">Meaning Signature</h4>
                <p className="text-sm text-gray-300">{currentAnalysis.meaningSignature}</p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline" className="border-cyan/30 text-cyan">
                    {currentAnalysis.glyphData.shape}
                  </Badge>
                  <Badge variant="outline" className="border-violet/30 text-violet">
                    {currentAnalysis.emergencePoints.length} emergence points
                  </Badge>
                  <Badge variant="outline" className="border-gold/30 text-gold">
                    Complexity: {currentAnalysis.glyphData.complexity}
                  </Badge>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Panel - Analysis & History */}
        <div className="lg:col-span-1">
          <Card className="glass-card p-6 h-full">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-obsidian/50">
                <TabsTrigger value="input" className="text-xs">
                  <FileText className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="history" className="text-xs">
                  <History className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="symbols" className="text-xs">
                  <ImageIcon className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs">
                  <Settings className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="input" className="mt-4">
                {currentAnalysis && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-obsidian/30 rounded-lg">
                        <Brain className="w-6 h-6 mx-auto mb-2 text-cyan" />
                        <div className="text-lg font-bold text-white">{Math.round(currentAnalysis.cognitiveLoad)}</div>
                        <div className="text-xs text-gray-400">Cognitive Load</div>
                      </div>
                      <div className="text-center p-3 bg-obsidian/30 rounded-lg">
                        <Heart className="w-6 h-6 mx-auto mb-2 text-violet" />
                        <div className="text-lg font-bold text-white">{Math.round(currentAnalysis.emotionalIntensity)}</div>
                        <div className="text-xs text-gray-400">Emotional Intensity</div>
                      </div>
                    </div>

                    {voiceAnalysis && (
                      <div className="p-4 bg-obsidian/30 rounded-lg">
                        <h4 className="text-sm font-semibold text-white mb-2">Voice Analysis</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Duration: {voiceAnalysis.duration.toFixed(1)}s</div>
                          <div>Tone: {voiceAnalysis.emotionalTone}</div>
                          <div>Speech Rate: {voiceAnalysis.speechRate} WPM</div>
                          <div>Avg Volume: {voiceAnalysis.averageVolume}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sessionEntries.map((entry) => (
                    <div key={entry.id} className="p-3 bg-obsidian/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {entry.inputType}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 truncate">{entry.inputData}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="symbols" className="mt-4">
                <div className="text-center text-gray-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Favorite glyphs will appear here</p>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Show Particles</span>
                    <Switch
                      checked={showParticles}
                      onCheckedChange={setShowParticles}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Resonance Field</span>
                    <Switch
                      checked={showResonanceField}
                      onCheckedChange={setShowResonanceField}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Auto-Analyze</span>
                    <Switch
                      checked={autoAnalyze}
                      onCheckedChange={setAutoAnalyze}
                    />
                  </div>
                  
                  <Button
                    onClick={exportSession}
                    variant="outline"
                    className="w-full border-cyan/30"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Session
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Floating Dock */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="glass-dock flex items-center space-x-4 px-6 py-3 rounded-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('history')}
            className={`text-gray-400 hover:text-white ${activeTab === 'history' ? 'text-cyan' : ''}`}
          >
            <History className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('symbols')}
            className={`text-gray-400 hover:text-white ${activeTab === 'symbols' ? 'text-violet' : ''}`}
          >
            <Star className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('settings')}
            className={`text-gray-400 hover:text-white ${activeTab === 'settings' ? 'text-gold' : ''}`}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;