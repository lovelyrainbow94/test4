// Service für die automatische Anordnung von Diagrammen
import { getNodes, getEdges, setNodes, renderAll } from '../components/WorkspaceComponent.js';

/**
 * Führt eine automatische Anordnung der Knoten auf der Arbeitsfläche durch.
 * (Dummy-Implementierung)
 */
export function applyAutoLayout() {
    let currentNodes = getNodes();
    // let currentEdges = getEdges(); // Kanten könnten für komplexere Layouts benötigt werden

    if (!currentNodes || currentNodes.length === 0) {
        console.log("Keine Knoten zum Anordnen vorhanden.");
        return;
    }

    console.log("Automatische Anordnung wird durchgeführt (Dummy-Implementierung)...");

    // Dummy-Implementierung: Einfache Kaskadierung basierend auf Index
    // Diese Implementierung ignoriert Kanten und hierarchische Strukturen.
    let currentX = 50;
    let currentY = 50;
    const xSpacing = 250; // Mehr Platz zwischen Knoten
    const ySpacing = 150;
    const nodesPerRow = Math.max(1, Math.floor(document.getElementById('workspace-area').clientWidth / xSpacing) -1 ); // Versuche, Breite auszunutzen


    const laidOutNodes = currentNodes.map((node, index) => {
        return {
            ...node, // Behalte andere Eigenschaften des Knotens
            x: currentX + (index % nodesPerRow) * xSpacing,
            y: currentY + Math.floor(index / nodesPerRow) * ySpacing
        };
    });

    setNodes(laidOutNodes); // Aktualisiere die Knoten im WorkspaceComponent
    renderAll(); // Zeichne die Arbeitsfläche neu

    console.log("Layout-Algorithmus abgeschlossen (Dummy).");
}

console.log("layoutService.js geladen - Zuständig für die automatische Anordnung.");
