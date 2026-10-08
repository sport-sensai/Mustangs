import type { PhaseDefinition } from '../domain/types';
import type { Clock } from '../viewer/clock';
import { useClock } from './hooks';

interface Props {
  clock: Clock;
  phases: PhaseDefinition[];
  duration: number;
  onRate: (r: number) => void;
}

const RATES = [0.1, 0.25, 0.5, 1];

export function Transport({ clock, phases, duration, onRate }: Props) {
  useClock(clock);
  const t = clock.time;
  const current = phases.find((p) => t >= p.start && t < p.end) ?? phases[phases.length - 1];
  const step = (d: number) => {
    clock.setPlaying(false);
    clock.set((((clock.time + d) % 1) + 1) % 1);
  };
  return (
    <div className="transport" role="group" aria-label="Playback">
      <button
        className="play"
        onClick={() => {
          // Non-looping clips (skills) restart from the beginning once finished.
          if (!clock.playing && !clock.loop && clock.time >= 0.999) clock.set(0);
          clock.setPlaying(!clock.playing);
        }} aria-label={clock.playing ? 'Pause' : 'Play'}>
        {clock.playing ? '❚❚' : '▶'}
      </button>
      <button className="icon-btn" onClick={() => step(-0.01)} aria-label="Step back one frame">‹</button>
      <button className="icon-btn" onClick={() => step(0.01)} aria-label="Step forward one frame">›</button>
      <div className="timeline">
        <div className="timeline__track">
          {phases.map((p) => (
            <span
              key={p.id}
              className={`timeline__phase${p.id === current.id ? ' is-current' : ''}`}
              style={{ left: `${p.start * 100}%`, width: `${Math.max(0, p.end - p.start) * 100}%` }}
              aria-hidden="true"
            />
          ))}
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={t}
            onChange={(e) => {
              clock.setPlaying(false);
              clock.set(Number(e.target.value));
            }}
            aria-label="Scrub movement time"
            aria-valuetext={`${current.name}, ${(t * duration).toFixed(2)} of ${duration.toFixed(2)} seconds modeled time`}
          />
        </div>
        <div className="timeline__phases">
          {phases.filter((p) => p.end > p.start).map((p) => (
            <button
              key={p.id}
              className={`phase-btn${p.id === current.id ? ' is-current' : ''}`}
              onClick={() => {
                clock.setPlaying(false);
                clock.set(p.start + (p.end - p.start) * 0.5);
              }}
              aria-current={p.id === current.id ? 'step' : undefined}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
      <div className="transport__meta">
        <span className="mono" title="Modeled execution time (changes only with tempo parameters)">
          {(t * duration).toFixed(2)} / {duration.toFixed(2)} s
        </span>
        <label>
          <span className="sr-only">Playback rate</span>
          <select value={clock.rate} onChange={(e) => onRate(Number(e.target.value))} aria-label="Playback rate (viewing only)">
            {RATES.map((r) => <option key={r} value={r}>{r}×</option>)}
          </select>
        </label>
      </div>
    </div>
  );
}
