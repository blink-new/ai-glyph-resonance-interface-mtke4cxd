export interface VoiceRecordingOptions {
  maxDuration?: number; // in seconds
  sampleRate?: number;
  channels?: number;
}

export interface VoiceAnalysis {
  duration: number;
  averageVolume: number;
  peakVolume: number;
  silencePeriods: number[];
  speechRate: number; // words per minute estimate
  emotionalTone: 'calm' | 'excited' | 'stressed' | 'neutral';
}

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private isRecording = false;
  private startTime = 0;
  private volumeData: number[] = [];

  async startRecording(options: VoiceRecordingOptions = {}): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: options.sampleRate || 44100,
          channelCount: options.channels || 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });

      // Set up audio analysis
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      source.connect(this.analyser);
      
      this.analyser.fftSize = 256;
      this.startVolumeAnalysis();

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];
      this.startTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;

      // Auto-stop after max duration
      if (options.maxDuration) {
        setTimeout(() => {
          if (this.isRecording) {
            this.stopRecording();
          }
        }, options.maxDuration * 1000);
      }

    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Could not access microphone. Please check permissions.');
    }
  }

  async stopRecording(): Promise<{ audioBlob: Blob; analysis: VoiceAnalysis }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const duration = (Date.now() - this.startTime) / 1000;
        
        const analysis = this.analyzeVoiceData(duration);
        
        this.cleanup();
        resolve({ audioBlob, analysis });
      };

      this.mediaRecorder.stop();
      this.isRecording = false;
    });
  }

  private startVolumeAnalysis(): void {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyze = () => {
      if (!this.isRecording || !this.analyser) return;

      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const sum = dataArray.reduce((a, b) => a + b, 0);
      const average = sum / bufferLength;
      this.volumeData.push(average);

      requestAnimationFrame(analyze);
    };

    analyze();
  }

  private analyzeVoiceData(duration: number): VoiceAnalysis {
    if (this.volumeData.length === 0) {
      return {
        duration,
        averageVolume: 0,
        peakVolume: 0,
        silencePeriods: [],
        speechRate: 0,
        emotionalTone: 'neutral'
      };
    }

    const averageVolume = this.volumeData.reduce((a, b) => a + b, 0) / this.volumeData.length;
    const peakVolume = Math.max(...this.volumeData);
    
    // Detect silence periods (volume below threshold)
    const silenceThreshold = averageVolume * 0.3;
    const silencePeriods: number[] = [];
    let silenceStart = -1;
    
    this.volumeData.forEach((volume, index) => {
      const timeStamp = (index / this.volumeData.length) * duration;
      
      if (volume < silenceThreshold && silenceStart === -1) {
        silenceStart = timeStamp;
      } else if (volume >= silenceThreshold && silenceStart !== -1) {
        silencePeriods.push(timeStamp - silenceStart);
        silenceStart = -1;
      }
    });

    // Estimate speech rate (rough approximation)
    const speechPeriods = duration - silencePeriods.reduce((a, b) => a + b, 0);
    const estimatedWords = speechPeriods * 2.5; // Average 2.5 words per second
    const speechRate = (estimatedWords / duration) * 60; // Words per minute

    // Determine emotional tone based on volume patterns
    const volumeVariance = this.calculateVariance(this.volumeData);
    const emotionalTone = this.determineEmotionalTone(averageVolume, peakVolume, volumeVariance);

    return {
      duration,
      averageVolume: Math.round(averageVolume),
      peakVolume: Math.round(peakVolume),
      silencePeriods,
      speechRate: Math.round(speechRate),
      emotionalTone
    };
  }

  private calculateVariance(data: number[]): number {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const squaredDiffs = data.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
  }

  private determineEmotionalTone(avg: number, peak: number, variance: number): VoiceAnalysis['emotionalTone'] {
    const intensity = peak / (avg || 1);
    
    if (variance > 500 && intensity > 2) return 'excited';
    if (variance > 300 && avg > 50) return 'stressed';
    if (variance < 100 && avg < 30) return 'calm';
    return 'neutral';
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.mediaRecorder = null;
    this.volumeData = [];
  }

  getRecordingState(): boolean {
    return this.isRecording;
  }

  getCurrentVolume(): number {
    return this.volumeData.length > 0 ? this.volumeData[this.volumeData.length - 1] : 0;
  }
}

// Speech-to-text utility using Web Speech API
export class SpeechToText {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;

  constructor() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
    }

    if (this.recognition) {
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  async startListening(onResult: (text: string, isFinal: boolean) => void): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    return new Promise((resolve, reject) => {
      if (!this.recognition) return reject(new Error('Speech recognition not available'));

      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        onResult(finalTranscript || interimTranscript, !!finalTranscript);
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onstart = () => {
        this.isListening = true;
        resolve();
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
    });
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  isActive(): boolean {
    return this.isListening;
  }
}