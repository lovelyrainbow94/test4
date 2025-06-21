import { LegalNode, LegalEdge } from '../core/dataModels.js';
import { generateId } from '../utils/helpers.js';
import { createNodeElement, updateNodeElement } from './NodeComponent.js';
import { createSvgEdgeElement, updateSvgEdgeElement, getArrowheadDefinition } from './EdgeComponent.js';


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
let svgLayer;
let edgesGroup;

/**
 * Initialisiert die Arbeitsfläche, setzt Event-Listener.
 */
export function initializeWorkspace() {
    workspaceArea = document.getElementById('workspace-area');
    canvasContainer = document.getElementById('canvas-container');
    svgLayer = document.getElementById('svg-layer');
    edgesGroup = document.getElementById('edges-group');

    if (!workspaceArea || !canvasContainer || !svgLayer || !edgesGroup) {
        console.error("Wichtige Workspace- oder SVG-Elemente nicht im DOM gefunden!");
        return;
    }

    // Pfeilspitzen-Definition zum SVG hinzufügen
    const defs = svgLayer.querySelector('defs') || document.createElementNS("http://www.w3.org/2000/svg", "defs");
    if (!svgLayer.contains(defs)) { // Nur hinzufügen, wenn nicht schon da (obwohl es im HTML ist)
        svgLayer.insertBefore(defs, svgLayer.firstChild);
    }
    const arrowhead = getArrowheadDefinition();
    if (!defs.querySelector(`#${arrowhead.id}`)) { // Verhindert doppeltes Hinzufügen bei versehentlichem Mehrfachaufruf
        defs.appendChild(arrowhead);
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

            // Verbundene Kanten aktualisieren
            _edges.forEach(edgeData => {
                if (edgeData.sourceNodeId === activeDragNodeId || edgeData.targetNodeId === activeDragNodeId) {
                    const edgeGroupElement = document.getElementById(`edge-group-${edgeData.id}`);
                    if (edgeGroupElement) {
                        const sourceN = _nodes.find(n => n.id === edgeData.sourceNodeId);
                        const targetN = _nodes.find(n => n.id === edgeData.targetNodeId);
                        if (sourceN && targetN) {
                            updateSvgEdgeElement(edgeGroupElement, sourceN, targetN, edgeData);
                        }
                    }
                }
            });
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

    const edgeElement = createSvgEdgeElement(edgeData, _nodes);
    if (edgeElement && edgesGroup) {
        edgesGroup.appendChild(edgeElement);
    } else {
        console.warn("Konnte SVG-Element für Kante nicht erstellen oder edgesGroup nicht gefunden.", edgeData);
    }

    console.log("Kante hinzugefügt und versucht zu zeichnen:", edgeData);
    return edgeData;
}

/**
 * Löscht alle Knoten und Kanten von der Arbeitsfläche und aus den Datenmodellen.
 */
export function clearWorkspace() {
    _nodes = [];
    _edges = [];
    if (canvasContainer) { // Knoten-DIVs entfernen
        const nodesToRemove = canvasContainer.querySelectorAll('.node');
        nodesToRemove.forEach(nodeEl => canvasContainer.removeChild(nodeEl));
    }
    if (edgesGroup) { // SVG-Kanten entfernen
        while (edgesGroup.firstChild) {
            edgesGroup.removeChild(edgesGroup.firstChild);
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
    if (!canvasContainer || !edgesGroup) {
        console.error("renderAll: canvasContainer oder edgesGroup ist nicht initialisiert.");
        return;
    }

    // Bestehende Knoten-DOM-Elemente entfernen
    const existingNodeElements = canvasContainer.querySelectorAll('.node');
    existingNodeElements.forEach(el => el.remove());

    // Bestehende Kanten-SVG-Elemente entfernen
    while (edgesGroup.firstChild) {
        edgesGroup.removeChild(edgesGroup.firstChild);
    }

    // Knoten neu erstellen und hinzufügen
    _nodes.forEach(nodeData => {
        const nodeElement = createNodeElement(nodeData, { onNodeMouseDown, onNodeDoubleClick });
        canvasContainer.appendChild(nodeElement);
    });

    // Kanten neu erstellen und hinzufügen
    _edges.forEach(edgeData => {
        const edgeElement = createSvgEdgeElement(edgeData, _nodes);
        if (edgeElement && edgesGroup) {
            edgesGroup.appendChild(edgeElement);
        }
    });

    applyTransform(); // Sicherstellen, dass Zoom/Pan angewendet wird
    console.log("WorkspaceComponent.js: Alles neu gerendert (Knoten und Kanten).");
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
