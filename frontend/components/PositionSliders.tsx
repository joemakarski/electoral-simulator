'use client';

type PositionSlidersProps = {
  axes: string[];
  positions: Record<string, number>;
  id: string;
  colorClass?: string; // optional override for slider color
  onPositionChange: (id: string, axis: string, value: number) => void;
};

export default function PositionSliders({
  axes,
  positions,
  id,
  colorClass = "accent-gray-700",
  onPositionChange
}: PositionSlidersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
      {axes.map(axis => (
        <div key={axis} className="text-sm">
          <div className="flex justify-between font-semibold mb-1.5 text-gray-600">
            <span>{axis}</span>
            <span className="text-gray-500">
              {(positions[axis] || 0).toFixed(2)}
            </span>
          </div>

          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={positions[axis] || 0}
            onChange={(e) =>
              onPositionChange(id, axis, parseFloat(e.target.value))
            }
            className={`w-full ${colorClass} h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer`}
          />
        </div>
      ))}
    </div>
  );
}
