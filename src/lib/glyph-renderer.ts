import { ResonanceAnalysis } from './ai-providers';

export interface GlyphRenderOptions {
  width: number;
  height: number;
  animate: boolean;
  showParticles: boolean;
  showResonanceField: boolean;
  complexity: number;
}

export class GlyphRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number | null = null;
  private startTime: number = 0;
  private particles: Particle[] = [];
  private resonanceField: ResonanceField;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;
    this.resonanceField = new ResonanceField(canvas.width, canvas.height);
  }

  render(analysis: ResonanceAnalysis, options: GlyphRenderOptions): void {
    this.canvas.width = options.width;
    this.canvas.height = options.height;
    this.resonanceField.resize(options.width, options.height);

    if (options.animate) {
      this.startAnimation(analysis, options);
    } else {
      this.renderStatic(analysis, options);
    }
  }

  private startAnimation(analysis: ResonanceAnalysis, options: GlyphRenderOptions): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.startTime = performance.now();
    this.initializeParticles(analysis, options);

    const animate = (currentTime: number) => {
      const elapsed = (currentTime - this.startTime) / 1000;
      this.renderFrame(analysis, options, elapsed);
      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  private renderFrame(analysis: ResonanceAnalysis, options: GlyphRenderOptions, time: number): void {
    // Clear canvas with fade effect
    this.ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Render resonance field
    if (options.showResonanceField) {
      this.renderResonanceField(analysis, time);
    }

    // Render main glyph
    this.renderMainGlyph(analysis, centerX, centerY, time);

    // Render particles
    if (options.showParticles) {
      this.updateAndRenderParticles(analysis, time);
    }

    // Render emergence points
    this.renderEmergencePoints(analysis, time);

    // Render frequency rings
    this.renderFrequencyRings(analysis, centerX, centerY, time);
  }

  private renderStatic(analysis: ResonanceAnalysis, options: GlyphRenderOptions): void {
    this.ctx.fillStyle = '#0a0a0f';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    this.renderMainGlyph(analysis, centerX, centerY, 0);
    this.renderEmergencePoints(analysis, 0);
  }

  private renderMainGlyph(analysis: ResonanceAnalysis, x: number, y: number, time: number): void {
    const { glyphData } = analysis;
    const size = Math.min(this.canvas.width, this.canvas.height) * 0.3;
    const rotation = time * glyphData.frequency * 0.5;
    const pulse = 1 + Math.sin(time * glyphData.frequency * 2) * 0.1;

    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation);
    this.ctx.scale(pulse, pulse);

    // Set glyph color with opacity based on emotional intensity
    const opacity = 0.7 + (analysis.emotionalIntensity / 100) * 0.3;
    this.ctx.strokeStyle = this.hexToRgba(glyphData.color, opacity);
    this.ctx.fillStyle = this.hexToRgba(glyphData.color, opacity * 0.3);
    this.ctx.lineWidth = 2 + (analysis.symbolicDensity / 100) * 3;

    // Render shape based on glyph data
    switch (glyphData.shape) {
      case 'circle':
        this.renderCircleGlyph(size, analysis);
        break;
      case 'triangle':
        this.renderTriangleGlyph(size, analysis);
        break;
      case 'square':
        this.renderSquareGlyph(size, analysis);
        break;
      case 'hexagon':
        this.renderHexagonGlyph(size, analysis);
        break;
      case 'star':
        this.renderStarGlyph(size, analysis);
        break;
      case 'spiral':
        this.renderSpiralGlyph(size, analysis, time);
        break;
      default:
        this.renderCircleGlyph(size, analysis);
    }

    this.ctx.restore();
  }

  private renderCircleGlyph(size: number, analysis: ResonanceAnalysis): void {
    const rings = Math.max(1, Math.floor(analysis.glyphData.complexity / 2));
    
    for (let i = 0; i < rings; i++) {
      const radius = (size / 2) * (1 - i * 0.2);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
      this.ctx.stroke();
      
      if (i === 0) {
        this.ctx.fill();
      }
    }
  }

  private renderTriangleGlyph(size: number, analysis: ResonanceAnalysis): void {
    const height = size * 0.866; // Equilateral triangle height
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, -height / 2);
    this.ctx.lineTo(-size / 2, height / 2);
    this.ctx.lineTo(size / 2, height / 2);
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.fill();

    // Add inner triangles based on complexity
    for (let i = 1; i < analysis.glyphData.complexity; i++) {
      const scale = 1 - (i * 0.3);
      this.ctx.save();
      this.ctx.scale(scale, scale);
      this.ctx.beginPath();
      this.ctx.moveTo(0, -height / 2);
      this.ctx.lineTo(-size / 2, height / 2);
      this.ctx.lineTo(size / 2, height / 2);
      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  private renderSquareGlyph(size: number, analysis: ResonanceAnalysis): void {
    const halfSize = size / 2;
    
    this.ctx.beginPath();
    this.ctx.rect(-halfSize, -halfSize, size, size);
    this.ctx.stroke();
    this.ctx.fill();

    // Add rotated inner squares
    for (let i = 1; i < analysis.glyphData.complexity; i++) {
      const scale = 1 - (i * 0.2);
      const rotation = (i * Math.PI) / 4;
      
      this.ctx.save();
      this.ctx.rotate(rotation);
      this.ctx.scale(scale, scale);
      this.ctx.beginPath();
      this.ctx.rect(-halfSize, -halfSize, size, size);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  private renderHexagonGlyph(size: number, analysis: ResonanceAnalysis): void {
    const radius = size / 2;
    
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.fill();

    // Add inner patterns
    for (let i = 1; i < analysis.glyphData.complexity; i++) {
      const innerRadius = radius * (1 - i * 0.25);
      this.ctx.beginPath();
      for (let j = 0; j < 6; j++) {
        const angle = (j * Math.PI) / 3;
        const x = innerRadius * Math.cos(angle);
        const y = innerRadius * Math.sin(angle);
        
        if (j === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.closePath();
      this.ctx.stroke();
    }
  }

  private renderStarGlyph(size: number, analysis: ResonanceAnalysis): void {
    const outerRadius = size / 2;
    const innerRadius = outerRadius * 0.4;
    const points = 5 + Math.floor(analysis.glyphData.complexity);
    
    this.ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = radius * Math.cos(angle - Math.PI / 2);
      const y = radius * Math.sin(angle - Math.PI / 2);
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.fill();
  }

  private renderSpiralGlyph(size: number, analysis: ResonanceAnalysis, time: number): void {
    const maxRadius = size / 2;
    const turns = 3 + analysis.glyphData.complexity;
    const points = 100;
    
    this.ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const t = i / points;
      const angle = t * turns * Math.PI * 2 + time;
      const radius = maxRadius * t;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.stroke();
  }

  private renderEmergencePoints(analysis: ResonanceAnalysis, time: number): void {
    analysis.emergencePoints.forEach((point, index) => {
      const angle = (point / 100) * Math.PI * 2;
      const distance = Math.min(this.canvas.width, this.canvas.height) * 0.4;
      const x = this.canvas.width / 2 + distance * Math.cos(angle);
      const y = this.canvas.height / 2 + distance * Math.sin(angle);
      
      const pulse = 1 + Math.sin(time * 3 + index) * 0.3;
      const size = 8 * pulse;
      
      this.ctx.save();
      this.ctx.fillStyle = '#F5A623';
      this.ctx.shadowColor = '#F5A623';
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  private renderFrequencyRings(analysis: ResonanceAnalysis, x: number, y: number, time: number): void {
    const maxRadius = Math.min(this.canvas.width, this.canvas.height) * 0.6;
    const rings = 3;
    
    for (let i = 0; i < rings; i++) {
      const radius = maxRadius * (0.3 + i * 0.2) + Math.sin(time * 2 + i) * 20;
      const opacity = 0.1 + (analysis.temporalFlow / 100) * 0.2;
      
      this.ctx.save();
      this.ctx.strokeStyle = this.hexToRgba('#00FFFF', opacity);
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  private renderResonanceField(analysis: ResonanceAnalysis, time: number): void {
    this.resonanceField.update(analysis, time);
    this.resonanceField.render(this.ctx);
  }

  private initializeParticles(analysis: ResonanceAnalysis, options: GlyphRenderOptions): void {
    this.particles = [];
    const particleCount = Math.floor(analysis.symbolicDensity / 10) + 10;
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push(new Particle(
        Math.random() * this.canvas.width,
        Math.random() * this.canvas.height,
        analysis.glyphData.color
      ));
    }
  }

  private updateAndRenderParticles(analysis: ResonanceAnalysis, time: number): void {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    this.particles.forEach(particle => {
      particle.update(centerX, centerY, analysis.glyphData.frequency, time);
      particle.render(this.ctx);
    });
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  captureSnapshot(): string {
    return this.canvas.toDataURL('image/png');
  }
}

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.color = color;
    this.size = Math.random() * 3 + 1;
    this.maxLife = Math.random() * 100 + 50;
    this.life = this.maxLife;
  }

  update(centerX: number, centerY: number, frequency: number, time: number): void {
    // Attract to center with some randomness
    const dx = centerX - this.x;
    const dy = centerY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      const force = 0.001 * frequency;
      this.vx += (dx / distance) * force;
      this.vy += (dy / distance) * force;
    }
    
    // Add some orbital motion
    const angle = Math.atan2(dy, dx) + Math.PI / 2;
    this.vx += Math.cos(angle) * 0.01 * frequency;
    this.vy += Math.sin(angle) * 0.01 * frequency;
    
    // Apply velocity with damping
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.99;
    this.vy *= 0.99;
    
    // Update life
    this.life--;
    if (this.life <= 0) {
      this.respawn();
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.fillStyle = this.hexToRgba(this.color, alpha * 0.6);
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private respawn(): void {
    this.x = Math.random() * 800; // Assuming canvas width
    this.y = Math.random() * 600; // Assuming canvas height
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.life = this.maxLife;
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

class ResonanceField {
  private width: number;
  private height: number;
  private field: number[][];
  private gridSize: number = 20;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initializeField();
  }

  private initializeField(): void {
    const cols = Math.ceil(this.width / this.gridSize);
    const rows = Math.ceil(this.height / this.gridSize);
    
    this.field = [];
    for (let i = 0; i < rows; i++) {
      this.field[i] = [];
      for (let j = 0; j < cols; j++) {
        this.field[i][j] = 0;
      }
    }
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.initializeField();
  }

  update(analysis: ResonanceAnalysis, time: number): void {
    const cols = this.field[0].length;
    const rows = this.field.length;
    const centerX = cols / 2;
    const centerY = rows / 2;
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const dx = j - centerX;
        const dy = i - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Create wave patterns based on analysis
        const wave1 = Math.sin(distance * 0.3 - time * analysis.glyphData.frequency * 2) * analysis.emotionalIntensity / 100;
        const wave2 = Math.cos(distance * 0.2 + time * analysis.temporalFlow / 50) * analysis.cognitiveLoad / 100;
        
        this.field[i][j] = (wave1 + wave2) * 0.5;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cols = this.field[0].length;
    const rows = this.field.length;
    
    ctx.save();
    for (let i = 0; i < rows - 1; i++) {
      for (let j = 0; j < cols - 1; j++) {
        const value = Math.abs(this.field[i][j]);
        const opacity = Math.min(0.3, value * 0.5);
        
        if (opacity > 0.05) {
          const x = j * this.gridSize;
          const y = i * this.gridSize;
          
          ctx.fillStyle = `rgba(0, 255, 255, ${opacity})`;
          ctx.fillRect(x, y, this.gridSize, this.gridSize);
        }
      }
    }
    ctx.restore();
  }
}