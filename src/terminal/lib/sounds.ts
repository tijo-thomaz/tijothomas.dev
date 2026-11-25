// Sound utility using Web Audio API for terminal effects

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.enabled = localStorage.getItem('tijothomas-sounds') === 'true';
    }
  }

  private async initAudioContext() {
    if (!this.audioContext && typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Resume audio context if it's suspended (required for mobile)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    }
  }

  // Initialize audio context on first user interaction (required for mobile)
  async enableWithUserInteraction() {
    await this.initAudioContext();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Generate typing sound effect
  async playKeypress() {
    if (!this.enabled) return;
    
    await this.initAudioContext();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Typing sound: short, high-pitched click
    oscillator.frequency.setValueAtTime(800 + Math.random() * 200, this.audioContext.currentTime);
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  // Generate command execution sound
  async playCommand() {
    if (!this.enabled) return;
    
    await this.initAudioContext();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Command sound: ascending beep
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  // Generate error sound
  async playError() {
    if (!this.enabled) return;
    
    await this.initAudioContext();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Error sound: low buzz
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  // Generate notification sound for chat
  async playNotification() {
    if (!this.enabled) return;
    
    await this.initAudioContext();
    if (!this.audioContext) return;

    // Two-tone notification
    for (let i = 0; i < 2; i++) {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      const frequency = i === 0 ? 523 : 659; // C and E notes
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime + i * 0.15);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.06, this.audioContext.currentTime + i * 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + i * 0.15 + 0.2);

      oscillator.start(this.audioContext.currentTime + i * 0.15);
      oscillator.stop(this.audioContext.currentTime + i * 0.15 + 0.2);
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('tijothomas-sounds', enabled.toString());
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();
