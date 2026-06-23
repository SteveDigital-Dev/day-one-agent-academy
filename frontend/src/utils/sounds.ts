// Sound effects using Web Audio API - no external files needed

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Play a tone with given frequency and duration
  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.enabled) return;
    
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      // Silently fail if audio context is not available
    }
  }

  // Correct answer sound - ascending two-note chime
  playCorrect() {
    this.playTone(523.25, 0.15, 'sine', 0.25); // C5
    setTimeout(() => this.playTone(659.25, 0.15, 'sine', 0.25), 100); // E5
  }

  // Wrong answer sound - descending buzz
  playWrong() {
    this.playTone(233.08, 0.2, 'sawtooth', 0.15); // Bb3
    setTimeout(() => this.playTone(196.00, 0.2, 'sawtooth', 0.15), 150); // G3
  }

  // Level up sound - triumphant fanfare
  playLevelUp() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.2), i * 100);
    });
  }

  // Achievement unlock sound - sparkle
  playAchievement() {
    this.playTone(1318.51, 0.3, 'sine', 0.2); // E6
    setTimeout(() => this.playTone(1567.98, 0.3, 'sine', 0.2), 150); // G6
    setTimeout(() => this.playTone(2093.00, 0.4, 'sine', 0.2), 300); // C7
  }

  // Click sound - subtle tap
  playClick() {
    this.playTone(800, 0.05, 'sine', 0.1);
  }

  // Complete sound - happy jingle
  playComplete() {
    const notes = [523.25, 587.33, 659.25, 783.99, 1046.50]; // C5, D5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'sine', 0.2), i * 120);
    });
  }
}

// Singleton instance
export const sounds = new SoundManager();
