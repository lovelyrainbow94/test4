import { LegalNode, LegalEdge } from '../core/dataModels.js';
import { generateId } from '../utils/helpers.js';
import { createNodeElement, updateNodeElement } from './NodeComponent.js';
// Import für EdgeComponent (Linien zeichnen) wird später benötigt
// import { createEdgeElement, updateEdgeElement } from './EdgeComponent.js';


// Globale Zustandsvariablen für die Arbeitsfläche (werden jetzt intern verwaltet)
let _nodes = [];
let _edges = [];
let scale = 1.0;
let panX = 0;
let panY = 0;

let isPanning = false;
let lastPanX, lastPanY;

let activeDragNodeId = null;
let dragOffsetX, dragOffsetY;

// DOM-Elemente
let workspaceArea;
let canvasContainer;

/**
 * Initialisiert die Arbeitsfläche, setzt Event-Listener.
 */
export function initializeWorkspace() {
    workspaceArea = document.getElementById('workspace-area');
    canvasContainer = document.getElementById('canvas-container');

    if (!workspaceArea || !canvasContainer) {
        console.error("Workspace-Elemente nicht im DOM gefunden!");
        return;
    }

    // Event Listener für Panning
    workspaceArea.addEventListener('mousedown', startPan);
    workspaceArea.addEventListener('mousemove', pan);
    workspaceArea.addEventListener('mouseup', endPan);
    workspaceArea.addEventListener('mouseleave', endPan); // Auch wenn Maus Bereich verlässt

    // Event Listener für Zoom
    workspaceArea.addEventListener('wheel', zoom);

    // Keine Standard-Knoten mehr hier, das kann die index.js oder eine Vorlage übernehmen
    // addNode(new LegalNode(generateId(), "Startpunkt", "<p>Dies ist der erste Prüfungspunkt.</p>", 100, 100));
    // addNode(new LegalNode(generateId(), "Folgepunkt", "<p>Ein weiterer Punkt mit <b>Fett</b> und <i>Kursiv</i>.</p>", 350, 150, "result-positive"));

    renderAll(); // Initial leeres Rendern oder Rendern einer geladenen Vorlage
    console.log("WorkspaceComponent.js: Arbeitsfläche initialisiert.");
}

function applyTransform() {
    canvasContainer.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
}

function startPan(event) {
    // Pan nur starten, wenn direkt auf die Arbeitsfläche geklickt wird (nicht auf einen Knoten)
    if (event.target === workspaceArea || event.target === canvasContainer) {
        isPanning = true;
        lastPanX = event.clientX;
        lastPanY = event.clientY;
        workspaceArea.classList.add('grabbing');
    }
}

function pan(event) {
    if (isPanning) {
        const dx = event.clientX - lastPanX;
        const dy = event.clientY - lastPanY;
        panX += dx;
        panY += dy;
        lastPanX = event.clientX;
        lastPanY = event.clientY;
        applyTransform();
    } else if (activeDragNodeId) {
        // Knoten verschieben
        const node = nodes.find(n => n.id === activeDragNodeId);
        if (node) {
            // Mausposition relativ zum gezoomten und gepannten Canvas-Container umrechnen
            const containerRect = canvasContainer.getBoundingClientRect();
            node.x = (event.clientX - containerRect.left - dragOffsetX) / scale;
            node.y = (event.clientY - containerRect.top - dragOffsetY) / scale;

            const nodeElement = document.getElementById(node.id);
            if (nodeElement) {
                nodeElement.style.left = `${node.x}px`;
                nodeElement.style.top = `${node.y}px`;
            }
            // TODO: Kanten neu zeichnen, die mit diesem Knoten verbunden sind
            // renderEdgesForNode(node.id);
        }
    }
}

function endPan() {
    if (isPanning) {
        isPanning = false;
        workspaceArea.classList.remove('grabbing');
    }
    if (activeDragNodeId) {
        // const node = _nodes.find(n => n.id === activeDragNodeId);
        // console.log(`Node ${activeDragNodeId} dragging finished at x:${node?.x}, y:${node?.y}.`);
        activeDragNodeId = null;
    }
}

function zoom(event) {
    event.preventDefault(); // Standard-Scrollen verhindern
    const zoomIntensity = 0.1;
    const wheel = event.deltaY < 0 ? 1 : -1; // Mausrad hoch oder runter
    const newScale = scale * (1 + wheel * zoomIntensity);

    // Zoom-Limits (optional)
    // if (newScale < 0.2 || newScale > 3) return;

    const workspaceRect = workspaceArea.getBoundingClientRect();
    // Mausposition relativ zur Arbeitsfläche
    const mouseX = event.clientX - workspaceRect.left;
    const mouseY = event.clientY - workspaceRect.top;

    // Berechne den Punkt auf dem Canvas, auf den gezoomt wird (vor dem Zoom)
    const pointX = (mouseX - panX) / scale;
    const pointY = (mouseY - panY) / scale;

    // Aktualisiere panX und panY, um den Zoom-Mittelpunkt beizubehalten
    panX = mouseX - pointX * newScale;
    panY = mouseY - pointY * newScale;
    scale = newScale;

    applyTransform();
}

/**
 * Fügt einen neuen Knoten zum Workspace hinzu.
 * @param {LegalNode} nodeData
 */
export function addNode(nodeData) {
    if (!(nodeData instanceof LegalNode)) {
        console.error("Ungültige Knotendaten:", nodeData);
        return;
    }
    // Prüfen ob Knoten mit gleicher ID schon existiert
    if (_nodes.some(n => n.id === nodeData.id)) {
        console.warn(`Knoten mit ID ${nodeData.id} existiert bereits. Überspringe Hinzufügen.`);
        // Optional: updateNode stattdessen aufrufen
        // updateNode(nodeData.id, nodeData); // Erfordert eine updateNode Funktion
        return null;
    }
    _nodes.push(nodeData);
    const nodeElement = createNodeElement(nodeData, { onNodeMouseDown, onNodeDoubleClick });
    if (canvasContainer) { // Sicherstellen, dass canvasContainer existiert
        canvasContainer.appendChild(nodeElement);
    } else {
        console.error("canvasContainer ist nicht verfügbar beim Hinzufügen des Knotens.");
    }
    return nodeData;
}

// Event-Handler für Knoten-Interaktionen
function onNodeMouseDown(event, nodeId) {
    activeDragNodeId = nodeId;
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
        // Mausposition relativ zur oberen linken Ecke des Knotens
        // Diese Berechnung muss die aktuelle Skalierung und Verschiebung berücksichtigen
        const nodeElementRect = event.target.closest('.node').getBoundingClientRect();
        const canvasRect = canvasContainer.getBoundingClientRect();

        dragOffsetX = (event.clientX - nodeElementRect.left);
        dragOffsetY = (event.clientY - nodeElementRect.top);

        // Verhindern, dass das Panning der Arbeitsfläche ausgelöst wird
        event.stopPropagation();
    }
}

function onNodeDoubleClick(event, nodeId) {
    console.log(`Doppelklick auf Knoten ${nodeId}. Hier Editor öffnen.`);
    // Logik zum Öffnen eines Editors für den Knoten (Titel, Text)
    // Nach Bearbeitung müsste `updateNodeElement` und ggf. `renderAll` aufgerufen werden.
}


/**
 * Fügt eine neue Kante zum Workspace hinzu.
 * @param {LegalEdge} edgeData
 */
export function addEdge(edgeData) {
    if (!(edgeData instanceof LegalEdge)) {
        console.error("Ungültige Kantendaten:", edgeData);
        return;
    }
    if (_edges.some(e => e.id === edgeData.id)) {
        console.warn(`Kante mit ID ${edgeData.id} existiert bereits. Überspringe Hinzufügen.`);
        return null;
    }
    _edges.push(edgeData);
    // Hier würde die Kante gezeichnet (z.B. mit SVG oder Canvas API)
    // const edgeElement = createEdgeElement(edgeData, _nodes);
    // if (edgeElement) canvasContainer.appendChild(edgeElement); // Oder in einem separaten SVG-Layer
    console.log("Kante hinzugefügt (visuelle Implementierung fehlt):", edgeData);
    return edgeData;
}

/**
 * Löscht alle Knoten und Kanten von der Arbeitsfläche und aus den Datenmodellen.
 */
export function clearWorkspace() {
    _nodes = [];
    _edges = [];
    if (canvasContainer) {
        while (canvasContainer.firstChild) {
            canvasContainer.removeChild(canvasContainer.firstChild);
        }
    }
    // Ggf. Zoom/Pan zurücksetzen
    // scale = 1.0;
    // panX = 0;
    // panY = 0;
    // applyTransform();
    console.log("WorkspaceComponent.js: Arbeitsfläche geleert.");
}

/**
 * Rendert alle Knoten und Kanten neu.
 * Nützlich nach größeren Änderungen (Laden, Import, Layout-Anpassung).
 */
export function renderAll() {
    if (!canvasContainer) {
        console.error("renderAll: canvasContainer ist nicht initialisiert.");
        return;
    }
    // Bestehende Knoten-DOM-Elemente entfernen
    while (canvasContainer.firstChild) {
        canvasContainer.removeChild(canvasContainer.firstChild);
    }

    // Knoten neu erstellen und hinzufügen
    _nodes.forEach(nodeData => {
        const nodeElement = createNodeElement(nodeData, { onNodeMouseDown, onNodeDoubleClick });
        canvasContainer.appendChild(nodeElement);
    });

    // Kanten neu erstellen und hinzufügen (Platzhalter)
    _edges.forEach(edgeData => {
        // const edgeElement = createEdgeElement(edgeData, _nodes);
        // if (edgeElement) canvasContainer.appendChild(edgeElement);
    });

    applyTransform(); // Sicherstellen, dass Zoom/Pan angewendet wird
    console.log("WorkspaceComponent.js: Alles neu gerendert.");
}

// Getter für Knoten und Kanten (nützlich für externe Module wie LayoutService)
export function getNodes() {
    return _nodes;
}

export function getEdges() {
    return _edges;
}

// Setter um Knoten von außen zu aktualisieren (z.B. durch LayoutService)
export function setNodes(updatedNodes) {
    _nodes = updatedNodes;
    // Es wird davon ausgegangen, dass renderAll() danach separat aufgerufen wird.
}


// ---- Platzhalter für Kantenzeichnung ----
// In einer echten Implementierung würde man hier z.B. SVG verwenden.
// function createEdgeElement(edgeData, nodeList) {
//     const sourceNode = nodeList.find(n => n.id === edgeData.sourceNodeId);
//     const targetNode = nodeList.find(n => n.id === edgeData.targetNodeId);
//     if (!sourceNode || !targetNode) return null;
//     // ... (wie zuvor)
// }

// function renderEdgesForNode(nodeId) {
//     // ... (wie zuvor)
// }

console.log("WorkspaceComponent.js geladen - Logik für Arbeitsfläche, Zoom, Pan, Knoten-Interaktion.");
