import React from 'react';
import type { FireData } from '../types';

interface Props {
  fire: FireData | null;
  position?: { x: number; y: number };
}

export const Tooltip: React.FC<Props> = ({ fire, position }) => {
  if (!fire || !position) return null;

  return (
    <div
      className="fire-tooltip"
      style={{ left: position.x + 15, top: position.y - 30 }}
    >
      <strong>{fire.name}</strong>
      <br />
      {fire.description.slice(0, 60)}…
    </div>
  );
};