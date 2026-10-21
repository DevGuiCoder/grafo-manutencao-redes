import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";
import type { Playback } from "../hooks/usePlayback";
export function PathAnimation({
  playback: p,
  total,
  from,
  to,
}: {
  playback: Playback;
  total: number;
  from: string;
  to: string;
}) {
  return (
    <div className="playback">
      <div className="playback-buttons">
        <button
          className="primary"
          onClick={p.toggle}
          aria-label={p.playing ? "Pausar percurso" : "Visualizar percurso"}
          title={p.playing ? "Pausar" : "Visualizar percurso"}
        >
          {p.playing ? <Pause size={19} /> : <Play size={19} />}
        </button>
        <button
          onClick={() => p.seek(p.step - 1)}
          disabled={p.step === 0}
          aria-label="Anterior"
          title="Anterior"
        >
          <SkipBack size={17} />
        </button>
        <button
          onClick={() => p.seek(p.step + 1)}
          disabled={p.step === total}
          aria-label="Próximo"
          title="Próximo"
        >
          <SkipForward size={17} />
        </button>
        <button onClick={p.reset} aria-label="Reiniciar" title="Reiniciar">
          <RotateCcw size={17} />
        </button>
      </div>
      <div className="playback-track">
        <div>
          <span>
            {p.step === total ? "Inspeção concluída" : `${from} → ${to}`}
          </span>
          <span>
            Etapa {p.step} de {total}
          </span>
        </div>
        <input
          aria-label="Etapa do percurso"
          type="range"
          min={0}
          max={total}
          value={p.step}
          onChange={(e) => p.seek(Number(e.target.value))}
        />
      </div>
      <select
        aria-label="Velocidade da animação"
        value={p.speed}
        onChange={(e) => p.setSpeed(Number(e.target.value))}
      >
        {[0.5, 1, 1.5, 2].map((v) => (
          <option key={v} value={v}>
            {v}x
          </option>
        ))}
      </select>
    </div>
  );
}
