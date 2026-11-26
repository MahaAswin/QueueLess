// Global Network & Loading Activity Tracker
// Provides real-time event streaming for global progress bars and server slowdown/cold-start warnings.

type LoadingStatus = 'idle' | 'loading' | 'slow' | 'cold-start' | 'success';

type Listener = (state: LoadingStateSnapshot) => void;

export interface LoadingStateSnapshot {
  activeCount: number;
  status: LoadingStatus;
  progress: number; // 0 to 100
  elapsedSeconds: number;
}

class LoadingTracker {
  private activeCount = 0;
  private status: LoadingStatus = 'idle';
  private progress = 0;
  private elapsedSeconds = 0;
  private listeners: Set<Listener> = new Set();

  private slowTimer: any = null;
  private coldStartTimer: any = null;
  private progressInterval: any = null;
  private elapsedInterval: any = null;
  private successTimer: any = null;

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getSnapshot(): LoadingStateSnapshot {
    return {
      activeCount: this.activeCount,
      status: this.status,
      progress: this.progress,
      elapsedSeconds: this.elapsedSeconds,
    };
  }

  private notify() {
    const snap = this.getSnapshot();
    this.listeners.forEach((fn) => {
      try {
        fn(snap);
      } catch {
        // Safe fail
      }
    });
  }

  public start() {
    if (this.successTimer) {
      clearTimeout(this.successTimer);
      this.successTimer = null;
    }

    this.activeCount++;

    if (this.activeCount === 1) {
      // First request started
      this.status = 'loading';
      this.progress = 18;
      this.elapsedSeconds = 0;

      // Progress trickler
      this.progressInterval = setInterval(() => {
        if (this.progress < 90) {
          const diff = (90 - this.progress) * 0.12;
          this.progress = Math.min(90, this.progress + Math.max(1, diff));
          this.notify();
        }
      }, 250);

      // Elapsed seconds counter
      this.elapsedInterval = setInterval(() => {
        this.elapsedSeconds += 1;
        this.notify();
      }, 1000);

      // Slow timer (after 2s)
      this.slowTimer = setTimeout(() => {
        if (this.activeCount > 0 && this.status === 'loading') {
          this.status = 'slow';
          this.notify();
        }
      }, 2000);

      // Cold start timer (after 4.5s)
      this.coldStartTimer = setTimeout(() => {
        if (this.activeCount > 0) {
          this.status = 'cold-start';
          this.notify();
        }
      }, 4500);
    }

    this.notify();
  }

  public stop() {
    this.activeCount = Math.max(0, this.activeCount - 1);

    if (this.activeCount === 0) {
      // All requests finished
      clearInterval(this.progressInterval);
      clearInterval(this.elapsedInterval);
      clearTimeout(this.slowTimer);
      clearTimeout(this.coldStartTimer);

      this.progress = 100;

      const wasSlow = this.status === 'slow' || this.status === 'cold-start';

      if (wasSlow) {
        this.status = 'success';
        this.notify();

        this.successTimer = setTimeout(() => {
          this.status = 'idle';
          this.progress = 0;
          this.elapsedSeconds = 0;
          this.notify();
        }, 1200);
      } else {
        this.notify();
        this.successTimer = setTimeout(() => {
          this.status = 'idle';
          this.progress = 0;
          this.elapsedSeconds = 0;
          this.notify();
        }, 350);
      }
    } else {
      this.notify();
    }
  }

  public reset() {
    clearInterval(this.progressInterval);
    clearInterval(this.elapsedInterval);
    clearTimeout(this.slowTimer);
    clearTimeout(this.coldStartTimer);
    clearTimeout(this.successTimer);
    this.activeCount = 0;
    this.status = 'idle';
    this.progress = 0;
    this.elapsedSeconds = 0;
    this.notify();
  }
}

export const loadingTracker = new LoadingTracker();
