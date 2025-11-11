"use client";
import { useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Plus, Trash2 } from "lucide-react";
import Card from "@/components/card";
import { Button } from "@/components/card";

const LOCAL_KEY = "palettes";

export default function HomePage() {
  const [palettes, setPalettes] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      try {
        setPalettes(JSON.parse(raw));
      } catch (e) {
        console.error("No se pudo parsear palettes:", e);
        setPalettes([]);
      }
    } else {
      // defaults (ejemplo)
      const defaultPalettes = [
        {
          id: Date.now(),
          title: "Paleta 1 - Naturaleza",
          sections: [
            {
              id: 1,
              title: "Fondos",
              colors: ["#45C4B0", "#9AEBA3", "#13678A", "#DAFDBA", "#012030"]
            },
            {
              id: 2,
              title: "Header",
              colors: ["#012030", "#13678A"]
            }
          ]
        },
        {
          id: Date.now() + 1,
          title: "Paleta 2 - Atardecer",
          sections: [
            {
              id: 11,
              title: "Primarios",
              colors: ["#FFB347", "#FFCC33", "#FF7E5F", "#FEB47B"]
            }
          ]
        }
      ];
      setPalettes(defaultPalettes);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(defaultPalettes));
    }
  }, []);

  const savePalettes = (newPalettes) => {
    setPalettes(newPalettes);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(newPalettes));
  };

  const addPalette = () => {
    const newPalette = {
      id: Date.now(),
      title: `Paleta ${palettes.length + 1}`,
      sections: []
    };
    const updated = [...palettes, newPalette];
    savePalettes(updated);
  };

  const updatePalette = (updatedPalette) => {
    const updated = palettes.map(p => (p.id === updatedPalette.id ? updatedPalette : p));
    savePalettes(updated);
  };

  const deletePalette = (paletteId) => {
    const updated = palettes.filter(p => p.id !== paletteId);
    savePalettes(updated);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(palettes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "palettes.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        alert("El JSON debe ser un array de paletas.");
        return;
      }
      savePalettes(parsed);
    } catch (err) {
      console.error(err);
      alert("Error leyendo el archivo JSON.");
    } finally {
      e.target.value = ""; // reset file input
    }
  };

  return (
    <main>
      <nav className="bg-(--color-dark) p-5 flex gap-3 items-center justify-between">
        <div className="flex gap-3">
          <label>
            <input type="file" accept="application/json" onChange={importJSON} className="hidden" id="import-file" />
            <Button
              color="warning"
              title="Importar JSON"
              icon={<ArrowUpFromLine />}
              onClick={() => document.getElementById("import-file")?.click()}
            />
          </label>

          <Button
            color="success"
            title="Exportar JSON"
            icon={<ArrowDownToLine />}
            onClick={exportJSON}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            color="info"
            text="Agregar Paleta"
            icon={<Plus />}
            onClick={addPalette}
          />
          {palettes.length > 0 && (
            <Button
              color="error"
              title="Eliminar todas las paletas"
              icon={<Trash2 />}
              onClick={() => {
                if (confirm("¿Eliminar todas las paletas? Esta acción no se puede deshacer.")) {
                  savePalettes([]);
                }
              }}
            />
          )}
        </div>
      </nav>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        {palettes.length === 0 && (
          <div className="col-span-full text-center text-gray-400">No hay paletas. Agrega una nueva.</div>
        )}

        {palettes.map((palette) => (
          <Card
            key={palette.id}
            palette={palette}
            onUpdatePalette={updatePalette}
            onDeletePalette={deletePalette}
          />
        ))}
      </div>
    </main>
  );
}
