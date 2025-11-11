"use client";
import { useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Plus, Trash2 } from "lucide-react";
import Card from "@/components/card";
import { Button } from "@/components/card";

const LOCAL_KEY = "palettes";

export default function HomePage() {
  const [palettes, setPalettes] = useState([]);
  const [importMode, setImportMode] = useState("add"); // "add" o "replace"

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
      const defaultPalettes = [
        {
          id: Date.now(),
          title: "Paleta 1",
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
          title: "Paleta 2",
          sections: [
            {
              id: 11,
              title: "Primarios",
              colors: ["#FF0000", "#FFFF00", "#0000FF", "#FFFFFF"]
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

      let newPalettes;

      if (importMode === "replace") {
        // Reemplazar todas las paletas
        if (!Array.isArray(parsed)) {
          alert("El JSON debe ser un array de paletas para reemplazar todo.");
          return;
        }
        newPalettes = parsed;
      } else {
        // Agregar paleta(s) a las existentes
        if (Array.isArray(parsed)) {
          // Si es un array, agregar todas las paletas
          newPalettes = [...palettes, ...parsed];
        } else {
          // Si es un objeto individual, agregarlo como paleta
          newPalettes = [...palettes, parsed];
        }
      }

      // Actualizar IDs para evitar duplicados
      newPalettes = updatePaletteIds(newPalettes);

      savePalettes(newPalettes);
      alert(importMode === "replace" ? "Todas las paletas han sido reemplazadas." : "Paleta(s) agregada(s) correctamente.");

    } catch (err) {
      console.error(err);
      alert("Error leyendo el archivo JSON.");
    } finally {
      e.target.value = ""; // reset file input
    }
  };

  // Función para actualizar IDs y evitar duplicados
  const updatePaletteIds = (palettesArray) => {
    const idMap = new Map();

    return palettesArray.map(palette => {
      // Generar nuevo ID si ya existe
      if (idMap.has(palette.id) || palettes.some(p => p.id === palette.id)) {
        palette.id = Date.now() + Math.random();
      }
      idMap.set(palette.id, true);

      // Actualizar IDs de secciones
      const sectionIdMap = new Map();
      palette.sections = palette.sections?.map(section => {
        if (sectionIdMap.has(section.id)) {
          section.id = Date.now() + Math.random();
        }
        sectionIdMap.set(section.id, true);
        return section;
      }) || [];

      return palette;
    });
  };

  return (
    <main>
      <nav className="bg-(--color-dark) p-5 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex gap-3 items-center">
          {/* Selector de modo de importación */}
          <div className="flex items-center gap-2 text-white">
            <span className="text-sm">Importar:</span>
            <select
              value={importMode}
              onChange={(e) => setImportMode(e.target.value)}
              className="bg-gray-700 text-white px-2 py-1 rounded text-sm border border-gray-600"
            >
              <option value="add">Agregar</option>
              <option value="replace">Reemplazar todo</option>
            </select>
          </div>

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
          <div className="col-span-full text-center text-gray-400">
            No hay paletas. Agrega una nueva o importa un archivo JSON.
          </div>
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