"use client";
import { Plus, Trash2, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Card component:
 * - palette: { id, title, sections }
 * - onUpdatePalette(updatedPalette)
 * - onDeletePalette(paletteId)
 */

export default function Card({ palette, onUpdatePalette, onDeletePalette }) {
    const [expandedSections, setExpandedSections] = useState({});
    const [newColorInputs, setNewColorInputs] = useState({});
    const [localPalette, setLocalPalette] = useState(palette);

    useEffect(() => {
        setLocalPalette(palette);
    }, [palette]);

    const setAndSync = (nextPalette) => {
        setLocalPalette(nextPalette);
        onUpdatePalette?.(nextPalette);
    };

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    const addSection = () => {
        const id = Date.now();
        const newSection = { id, title: "Nueva Sección", colors: [] };
        const updated = { ...localPalette, sections: [...(localPalette.sections || []), newSection] };
        setAndSync(updated);
        // no focus automático aquí, pero el input ya estará editable
    };

    const updateSectionTitle = (sectionId, newTitle) => {
        const safeTitle = (newTitle || "").trim();
        const updatedSections = (localPalette.sections || []).map(section =>
            section.id === sectionId ? { ...section, title: safeTitle } : section
        );
        setAndSync({ ...localPalette, sections: updatedSections });
    };

    const deleteSection = (sectionId) => {
        const updatedSections = (localPalette.sections || []).filter(section => section.id !== sectionId);
        setAndSync({ ...localPalette, sections: updatedSections });
    };

    const addColorToSection = (sectionId, color) => {
        if (!color) return;
        const safeColor = color.startsWith("#") ? color : `#${color}`;
        const updatedSections = (localPalette.sections || []).map(section =>
            section.id === sectionId ? { ...section, colors: [...section.colors, safeColor] } : section
        );
        setAndSync({ ...localPalette, sections: updatedSections });
        setNewColorInputs(prev => ({ ...prev, [sectionId]: "" }));
    };

    const removeColorFromSection = (sectionId, colorIndex) => {
        const updatedSections = (localPalette.sections || []).map(section =>
            section.id === sectionId ? { ...section, colors: section.colors.filter((_, i) => i !== colorIndex) } : section
        );
        setAndSync({ ...localPalette, sections: updatedSections });
    };

    const handleNewColorChange = (sectionId, value) => {
        setNewColorInputs(prev => ({ ...prev, [sectionId]: value }));
    };

    const updatePaletteTitle = (value) => {
        setAndSync({ ...localPalette, title: value });
    };

    const removePalette = () => {
        if (confirm("Eliminar esta paleta?")) {
            onDeletePalette?.(localPalette.id);
        }
    };

    return (
        <div className="rounded-xl overflow-hidden border border-white bg-gray-800">
            <div className="bg-(--color-dark) flex flex-col md:flex-row items-start md:items-center justify-between gap-5 py-5 px-4">
                <div className="flex items-center gap-3 w-full">
                    <input
                        type="text"
                        value={localPalette.title || ""}
                        onChange={(e) => updatePaletteTitle(e.target.value)}
                        placeholder="Título de la paleta"
                        className="px-2 py-1 bg-transparent text-white font-bold text-2xl border border-transparent focus:border-sky-500 rounded w-full"
                    />
                </div>

                <div className="flex items-center justify-center gap-2">
                    <Button
                        icon={<Plus className="h-5 w-5" />}
                        text="Sección"
                        color="info"
                        onClick={addSection}
                    />
                    <Button
                        icon={<Trash2 />}
                        color="error"
                        onClick={removePalette}
                        title="Eliminar paleta"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-5 p-5">
                {(localPalette.sections || []).map((section, sectionIndex) => {
                    const sectionId = section.id ?? sectionIndex;
                    const isExpanded = !!expandedSections[sectionId];
                    const colorsToShow = isExpanded ? section.colors : (section.colors || []).slice(0, 5);
                    const hasMoreColors = (section.colors?.length || 0) > 5;
                    const currentNewColor = newColorInputs[sectionId] ?? "#ffffff";

                    return (
                        <div key={sectionId} className="flex flex-col gap-3 p-4 border border-gray-600 rounded-lg">
                            <div className="flex items-center justify-between gap-3">
                                <input
                                    type="text"
                                    value={section.title || ""}
                                    onChange={(e) => updateSectionTitle(sectionId, e.target.value)}
                                    onBlur={(e) => {
                                        if (!(e.target.value || "").trim()) updateSectionTitle(sectionId, "Nueva Sección");
                                    }}
                                    className="w-10 py-1 bg-transparent text-white font-semibold text-xl border border-transparent focus:border-sky-500 rounded flex-1"
                                    placeholder="Título de sección"
                                />

                                <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="flex w-full justify-end items-center">
                                        <Button
                                            color="error"
                                            icon={<Trash2 />}
                                            title="Eliminar sección"
                                            onClick={() => deleteSection(sectionId)}
                                        />
                                    </div>

                                    {hasMoreColors && (
                                        <button
                                            onClick={() => toggleSection(sectionId)}
                                            className="flex items-center gap-1 text-sm text-white hover:text-sky-500 font-medium cursor-pointer mt-2"
                                        >
                                            {isExpanded ? (
                                                <>
                                                    <ChevronUp size={16} />
                                                    Ver menos
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown size={16} />
                                                    Ver todos ({section.colors.length})
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={currentNewColor}
                                    onChange={(e) => handleNewColorChange(sectionId, e.target.value)}
                                    className="h-8 w-8 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={currentNewColor}
                                    onChange={(e) => handleNewColorChange(sectionId, e.target.value)}
                                    placeholder="#FFFFFF"
                                    className="px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 text-sm flex-1"
                                />
                                <Button
                                    color="success"
                                    icon={<Plus />}
                                    onClick={() => addColorToSection(sectionId, currentNewColor)}
                                />
                            </div>

                            <div className="grid grid-cols-5 gap-3">
                                {colorsToShow.map((color, colorIndex) => (
                                    <Color
                                        key={colorIndex}
                                        color={color}
                                        onRemove={() => removeColorFromSection(sectionId, colorIndex)}
                                    />
                                ))}

                                {(section.colors || []).length === 0 && (
                                    <p className="text-gray-400 text-sm">No hay colores en esta sección</p>
                                )}
                            </div>
                        </div>
                    );
                })}

                {(localPalette.sections || []).length === 0 && (
                    <div className="text-center py-8 text-gray-400">No hay secciones. Agrega una nueva.</div>
                )}

                <div className="flex w-full items-center justify-center gap-5">
                    <Button color="success" text="Exportar Secciones" onClick={() => {
                        const blob = new Blob([JSON.stringify(localPalette, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${localPalette.title || "palette"}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                    }} />
                </div>
            </div>
        </div>
    );
}

/* Button exportado para reuso desde HomePage */
export function Button({ color = "primary", icon, text, onClick, title }) {
    const colors = {
        primary: "text-white bg-blue-500 hover:bg-blue-600",
        ghost: "text-gray-700 bg-gray-200 hover:bg-gray-300",
        success: "text-white bg-emerald-500 hover:bg-emerald-700",
        warning: "text-white bg-amber-500 hover:bg-yellow-600",
        info: "text-white bg-sky-500 hover:bg-sky-600",
        error: "text-white bg-red-500 hover:bg-red-600",
    };

    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm cursor-pointer ${colors[color] ?? colors.primary} transition-all duration-150`}
        >
            {icon}
            {text}
        </button>
    );
}

/* Color box */
function Color({ color = "#FFFFFF", onRemove }) {
    const [hover, setHover] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyColor = async () => {
        try {
            await navigator.clipboard.writeText(color);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error("No se pudo copiar", err);
        }
    };

    return (
        <div
            className="h-[45px] w-[45px] rounded-md relative"
            style={{ backgroundColor: color }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            role="button"
            aria-label={`Color ${color}`}
        >
            {hover && (
                <div className="flex items-center justify-center w-full h-full bg-black/50 rounded-md">
                    <div className="flex flex-col gap-1">
                        <button
                            aria-label={`Copiar ${color}`}
                            onClick={(e) => { e.stopPropagation(); copyColor(); }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium cursor-pointer bg-white text-gray-800"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                        {onRemove && (
                            <button
                                aria-label={`Eliminar ${color}`}
                                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium cursor-pointer bg-red-500 text-white"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
