'use client';

import { clear } from "console";
import { useState } from "react";

type Tile = { id: number; district_id: string };

export default function Home() {

  // The map
  const [grid, setGrid] = useState<Tile[]>(
    Array.from({ length: 100 }, (_, i) => ({ id: i, district_id: "d0" }))
  );
  // The paintbrush (default: @d1)
  const [activeBrush, setActiveBrush] = useState<string>("d1");
  
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Return a new grid, but the clicked grid becomes the brush's colour
  const paintTile = (tileId: number) => {
    setGrid(prevGrid =>
      prevGrid.map(tile =>
        tile.id === tileId
          ? {
              ...tile,
              district_id: tile.district_id === "d0" ? "d1" : "d0"
            }
          : tile
      )
    );
  };

  const clearGrid = () => {
    setGrid(prevGrid =>
      prevGrid.map(tile => ({
        ...tile,
        district_id: "d0"
      }))
    );
  };

  //TODO: return statement
  

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-5xl mx-auto grid grid-cols-2 gap-12">
        
        {/* LEFT COLUMN: Map area */}
        <div>
          <h1 className="text-3xl font-bold mb-4">Electoral Map</h1>
          {/* The CSS Grid Map */}
          <div className="grid grid-cols-10 gap-1 bg-blue-100 p-2 w-fit">
            {grid.map((tile) => (
              <div
                key={tile.id}
                onClick={() => paintTile(tile.id)}
                className={`w-10 h-10 ${
                  tile.district_id === "d0" ? "bg-blue-200" : "bg-emerald-600"
                } hover:brightness-90`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Controls */}
        <div className="flex flex-col gap-y-3 w-max">
          <h2 className="text-2xl font-bold mb-4">Simulation Engine</h2>
          <button className="bg-green-600 text-white p-3 rounded hover:brightness-90">
            Run Election
          </button>
          <button className="bg-red-600 text-white p-3 rounded hover:brightness-90" onClick={clearGrid}>
            Clear Grid
          </button>
        </div>

      </div>
    </div>
  );
}
