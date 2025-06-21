// Komponente zum Erstellen und Verwalten von Kanten-SVG-Elementen

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

/**
 * Erstellt ein SVG <line>-Element für eine Kante.
 * Berechnet vorerst die Linien zwischen den Mittelpunkten der Knoten.
 *
 * @param {LegalEdge} edgeData - Das Kantenobjekt mit sourceNodeId und targetNodeId.
 * @param {Array<LegalNode>} nodeList - Die Liste aller Knotenobjekte zur Positionsfindung.
 * @returns {SVGGElement | null} Das erstellte SVG <g>-Element (Gruppe aus Linie und Texten) oder null bei Fehlern.
 */
export function createSvgEdgeElement(edgeData, nodeList) {
    if (!edgeData || !nodeList) {
        console.error("createSvgEdgeElement: edgeData oder nodeList fehlen.");
        return null;
    }

    const sourceNode = nodeList.find(node => node.id === edgeData.sourceNodeId);
    const targetNode = nodeList.find(node => node.id === edgeData.targetNodeId);

    if (!sourceNode || !targetNode) {
        console.warn(`Konnte Quell- (${edgeData.sourceNodeId}) oder Zielknoten (${edgeData.targetNodeId}) für Kante ${edgeData.id} nicht finden.`);
        return null;
    }

    const sourceWidth = sourceNode.width || 200;
    const sourceHeight = typeof sourceNode.height === 'number' ? sourceNode.height : 100;
    const targetWidth = targetNode.width || 200;
    const targetHeight = typeof targetNode.height === 'number' ? targetNode.height : 100;

    const x1 = sourceNode.x + sourceWidth / 2;
    const y1 = sourceNode.y + sourceHeight / 2;
    const x2 = targetNode.x + targetWidth / 2;
    const y2 = targetNode.y + targetHeight / 2;

    // Gruppe für Linie und Texte erstellen
    const groupElement = document.createElementNS(SVG_NAMESPACE, "g");
    groupElement.setAttribute("id", `edge-group-${edgeData.id}`);

    // Linie erstellen
    const lineElement = document.createElementNS(SVG_NAMESPACE, "line");
    lineElement.setAttribute("id", `edge-line-${edgeData.id}`); // Eindeutige ID für die Linie selbst
    lineElement.setAttribute("x1", x1.toString());
    lineElement.setAttribute("y1", y1.toString());
    lineElement.setAttribute("x2", x2.toString());
    lineElement.setAttribute("y2", y2.toString());
    lineElement.setAttribute("stroke-width", "2");
    lineElement.setAttribute("marker-end", "url(#arrowhead)");

    let strokeColor = "grey";
    if (edgeData.conditionMet === '+') {
        strokeColor = "green";
    } else if (edgeData.conditionMet === '-') {
        strokeColor = "orange";
    }
    lineElement.setAttribute("stroke", strokeColor);
    groupElement.appendChild(lineElement);

    // Mittelpunkt der Linie für Textpositionierung
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Text für conditionMet
    if (edgeData.conditionMet) {
        const condTextElement = document.createElementNS(SVG_NAMESPACE, "text");
        condTextElement.setAttribute("x", midX.toString());
        condTextElement.setAttribute("y", midY.toString());
        condTextElement.setAttribute("dy", "-5"); // Leicht über der Linie
        condTextElement.setAttribute("text-anchor", "middle");
        condTextElement.setAttribute("font-size", "12px");
        condTextElement.setAttribute("fill", strokeColor);
        condTextElement.textContent = edgeData.conditionMet;
        condTextElement.classList.add("edge-label", "edge-condition-label");
        groupElement.appendChild(condTextElement);
    }

    // Text für probability (wenn nicht 1.0 oder null)
    if (edgeData.probability !== null && edgeData.probability !== undefined && edgeData.probability !== 1.0) {
        const probTextElement = document.createElementNS(SVG_NAMESPACE, "text");
        probTextElement.setAttribute("x", midX.toString());
        probTextElement.setAttribute("y", midY.toString());
        probTextElement.setAttribute("dy", edgeData.conditionMet ? "15" : "5"); // Unter conditionMet oder mittig, wenn nur Wahrsch.
        probTextElement.setAttribute("text-anchor", "middle");
        probTextElement.setAttribute("font-size", "10px");
        probTextElement.setAttribute("fill", "black");
        probTextElement.textContent = `P=${edgeData.probability.toFixed(2)}`;
        probTextElement.classList.add("edge-label", "edge-probability-label");
        groupElement.appendChild(probTextElement);
    }

    return groupElement;
}

/**
 * Aktualisiert die Attribute eines bestehenden SVG <g>-Elements (Gruppe aus Linie und Texten).
 * @param {SVGGElement} groupElement - Das zu aktualisierende SVG <g>-Element.
 * @param {LegalEdge} edgeData - Die neuen Kantendaten.
 * @param {LegalNode} sourceNode - Der aktualisierte Quellknoten.
 * @param {LegalNode} targetNode - Der aktualisierte Zielknoten.
 */
export function updateSvgEdgeElement(groupElement, sourceNode, targetNode, edgeData) {
    if (!groupElement || !sourceNode || !targetNode || !edgeData) {
        console.error("updateSvgEdgeElement: Wichtige Parameter fehlen.");
        return;
    }

    const lineElement = groupElement.querySelector(`#edge-line-${edgeData.id}`); // Oder erstes <line> Kind
    const condTextElement = groupElement.querySelector('.edge-condition-label');
    const probTextElement = groupElement.querySelector('.edge-probability-label');

    if (!lineElement) {
        console.error("updateSvgEdgeElement: Linien-Element in Gruppe nicht gefunden.");
        return;
    }

    const sourceWidth = sourceNode.width || 200;
    const sourceHeight = typeof sourceNode.height === 'number' ? sourceNode.height : 100;
    const targetWidth = targetNode.width || 200;
    const targetHeight = typeof targetNode.height === 'number' ? targetNode.height : 100;

    const x1 = sourceNode.x + sourceWidth / 2;
    const y1 = sourceNode.y + sourceHeight / 2;
    const x2 = targetNode.x + targetWidth / 2;
    const y2 = targetNode.y + targetHeight / 2;

    lineElement.setAttribute("x1", x1.toString());
    lineElement.setAttribute("y1", y1.toString());
    lineElement.setAttribute("x2", x2.toString());
    lineElement.setAttribute("y2", y2.toString());

    let strokeColor = "grey";
    if (edgeData.conditionMet === '+') {
        strokeColor = "green";
    } else if (edgeData.conditionMet === '-') {
        strokeColor = "orange";
    }
    lineElement.setAttribute("stroke", strokeColor);

    // Texte aktualisieren
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Condition Text
    if (edgeData.conditionMet) {
        if (condTextElement) {
            condTextElement.setAttribute("x", midX.toString());
            condTextElement.setAttribute("y", midY.toString());
            condTextElement.setAttribute("dy", "-5");
            condTextElement.setAttribute("fill", strokeColor);
            condTextElement.textContent = edgeData.conditionMet;
            condTextElement.style.display = '';
        } else {
            // CondTextElement existierte nicht, sollte aber -> Logikfehler oder inkonsistenter Zustand
            console.warn(`CondTextElement für Kante ${edgeData.id} nicht gefunden, aber conditionMet ist gesetzt.`);
            // Optional: Hier könnte man versuchen, es neu zu erstellen, aber das macht update komplexer.
        }
    } else if (condTextElement) { // Keine Bedingung mehr, aber Element existiert -> ausblenden
        condTextElement.style.display = 'none';
    }

    // Probability Text
    const showProbability = edgeData.probability !== null && edgeData.probability !== undefined && edgeData.probability !== 1.0;
    if (showProbability) {
        if (probTextElement) {
            probTextElement.setAttribute("x", midX.toString());
            probTextElement.setAttribute("y", midY.toString());
            probTextElement.setAttribute("dy", edgeData.conditionMet ? "15" : "5");
            probTextElement.textContent = `P=${edgeData.probability.toFixed(2)}`;
            probTextElement.setAttribute("fill", "black"); // Farbe für Wahrscheinlichkeit evtl. immer schwarz
            probTextElement.style.display = '';
        } else {
            console.warn(`ProbTextElement für Kante ${edgeData.id} nicht gefunden, aber probability ist relevant.`);
        }
    } else if (probTextElement) { // Keine relevante Wahrscheinlichkeit mehr, aber Element existiert -> ausblenden
        probTextElement.style.display = 'none';
    }
}


// Definition für eine Pfeilspitze (kommt später in den <defs> Bereich des Haupt-SVG)
export function getArrowheadDefinition() {
    const marker = document.createElementNS(SVG_NAMESPACE, "marker");
    marker.setAttribute("id", "arrowhead");
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "7");
    marker.setAttribute("refX", "8"); // Position der Spitze relativ zum Linienende
    marker.setAttribute("refY", "3.5");
    marker.setAttribute("orient", "auto");

    const polygon = document.createElementNS(SVG_NAMESPACE, "polygon");
    polygon.setAttribute("points", "0 0, 10 3.5, 0 7"); // Form der Pfeilspitze
    polygon.setAttribute("fill", "context-stroke"); // Farbe der Pfeilspitze von der Linie übernehmen

    marker.appendChild(polygon);
    return marker;
}

console.log("EdgeComponent.js geladen - für SVG-Kantenerstellung und -aktualisierung.");
