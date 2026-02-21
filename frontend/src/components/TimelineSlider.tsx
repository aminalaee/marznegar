import { useCallback, useEffect, useRef, useState } from "react";
import { years } from "../data/years";

interface TimelineSliderProps {
  value: number;
  onChange: (index: number) => void;
}

const TICK_INDICES = [0, 9, 24, 40, 51];
const PLAY_INTERVAL = 1500;

export function TimelineSlider({ value, onChange }: TimelineSliderProps) {
  const [playing, setPlaying] = useState(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  const pct = useCallback(
    (idx: number) => (idx / (years.length - 1)) * 100,
    []
  );

  useEffect(() => {
    if (!playing) return;

    const id = setInterval(() => {
      const next = valueRef.current + 1;
      if (next > years.length) {
        setPlaying(false);
        return;
      }
      onChange(next);
    }, PLAY_INTERVAL);

    return () => clearInterval(id);
  }, [playing, onChange]);

  const togglePlay = () => {
    if (value >= years.length) {
      onChange(1);
    }
    setPlaying((p) => !p);
  };

  return (
    <div className="timeline-slider">
      <p className="slider-value">{years[value - 1].label}</p>
      <div className="slider-row">
        <button className="play-btn" onClick={togglePlay} title={playing ? "توقف" : "پخش"}>
          {playing ? "⏸" : "▶"}
        </button>
        <div className="slider-wrapper">
          <input
            type="range"
            min={1}
            max={years.length}
            value={value}
            onChange={(e) => {
              setPlaying(false);
              onChange(Number(e.target.value));
            }}
          />
          <div className="slider-ticks">
            {TICK_INDICES.map((idx) => (
              <span
                key={idx}
                className="slider-tick"
                style={{ left: `${pct(idx)}%` }}
                onClick={() => {
                  setPlaying(false);
                  onChange(idx + 1);
                }}
              >
                <span className="tick-mark" />
                <span className="tick-label">{years[idx].label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
