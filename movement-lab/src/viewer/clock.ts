// Shared playback clock. The viewer advances it every animation frame; React UI
// subscribes at a throttled rate. Playback rate is purely a viewing control and is
// independent of the modeled execution speed (VIEW-02).

export class Clock {
  time = 0; // normalised 0..1
  playing = false;
  rate = 1;
  duration = 1; // modeled seconds per cycle
  loop = true;
  private listeners = new Set<() => void>();
  private lastEmit = 0;

  advance(dtReal: number) {
    if (!this.playing) return;
    let t = this.time + (dtReal * this.rate) / this.duration;
    if (t >= 1) {
      if (this.loop) t %= 1;
      else {
        t = 1;
        this.playing = false;
      }
    }
    this.time = t;
    const now = performance.now();
    if (now - this.lastEmit > 66) {
      this.lastEmit = now;
      this.emit();
    }
  }

  set(t: number) {
    this.time = Math.min(1, Math.max(0, t));
    this.emit();
  }

  setPlaying(p: boolean) {
    this.playing = p;
    this.emit();
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit() {
    this.listeners.forEach((l) => l());
  }
}
