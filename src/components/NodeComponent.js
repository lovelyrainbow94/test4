import { sanitizeHTML } from '../utils/helpers.js';

/**
 * Erstellt und rendert ein DOM-Element für einen Prüfungspunkt (Knoten).
 * @param {LegalNode} nodeData - Die Daten des Knotens.
 * @param {object} eventHandlers - Objekt mit Event-Handlern (onNodeMouseDown, onNodeDoubleClick).
 * @returns {HTMLElement} Das DOM-Element des Knotens.
 */
export function createNodeElement(nodeData, eventHandlers = {}) {
    const nodeElement = document.createElement('div');
    nodeElement.id = nodeData.id;
    nodeElement.classList.add('node');
    if (nodeData.type && nodeData.type !== "normal") {
        nodeElement.classList.add(nodeData.type); // z.B. 'result-positive'
    }
    nodeElement.style.left = `${nodeData.x}px`;
    nodeElement.style.top = `${nodeData.y}px`;
    if (nodeData.width) {
        nodeElement.style.width = `${nodeData.width}px`;
    }
    // Höhe wird meist automatisch durch Inhalt bestimmt, kann aber auch gesetzt werden
    // nodeElement.style.height = nodeData.height === 'auto' ? 'auto' : `${nodeData.height}px`;


    const titleElement = document.createElement('div');
    titleElement.classList.add('node-title');
    titleElement.textContent = nodeData.title;

    const textElement = document.createElement('div');
    textElement.classList.add('node-text');
    // Sanitize HTML before inserting. For a real rich text editor, this needs to be more sophisticated
    // to allow specific tags (<b>, <i>, <ul>, <ol>, <li>).
    // The current sanitizeHTML is a placeholder.
    textElement.innerHTML = sanitizeHTML(nodeData.text);

    nodeElement.appendChild(titleElement);
    nodeElement.appendChild(textElement);

    // Event-Handler für das Verschieben (MouseDown auf Knoten)
    if (eventHandlers.onNodeMouseDown) {
        nodeElement.addEventListener('mousedown', (event) => {
            // Verhindern, dass das Panning der Arbeitsfläche ausgelöst wird, wenn auf Knoten geklickt wird
            event.stopPropagation();
            eventHandlers.onNodeMouseDown(event, nodeData.id);
        });
    }

    // Event-Handler für Bearbeiten (Doppelklick auf Knoten)
    if (eventHandlers.onNodeDoubleClick) {
        nodeElement.addEventListener('dblclick', (event) => {
            event.stopPropagation();
            eventHandlers.onNodeDoubleClick(event, nodeData.id);
            // Hier könnte man einen Editor öffnen
            alert(`Bearbeiten von Knoten ${nodeData.id} (Titel: ${nodeData.title}). Implementierung eines Rich-Text-Editors erforderlich.`);
        });
    }

    // TODO: Hier könnten "Handles" für das Ziehen von Kanten hinzugefügt werden.
    // z.B. kleine Punkte an den Rändern des Knotens.

    return nodeElement;
}

/**
 * Aktualisiert ein vorhandenes Knoten-DOM-Element mit neuen Daten.
 * @param {HTMLElement} nodeElement - Das zu aktualisierende DOM-Element.
 * @param {LegalNode} nodeData - Die neuen Knotendaten.
 */
export function updateNodeElement(nodeElement, nodeData) {
    if (!nodeElement) return;

    nodeElement.style.left = `${nodeData.x}px`;
    nodeElement.style.top = `${nodeData.y}px`;
    if (nodeData.width) {
        nodeElement.style.width = `${nodeData.width}px`;
    }
    // Ggf. Höhe aktualisieren

    nodeElement.querySelector('.node-title').textContent = nodeData.title;
    nodeElement.querySelector('.node-text').innerHTML = sanitizeHTML(nodeData.text);

    // Klassen für Typ aktualisieren
    nodeElement.className = 'node'; // Reset classes
    if (nodeData.type && nodeData.type !== "normal") {
        nodeElement.classList.add(nodeData.type);
    }
    nodeElement.id = nodeData.id; // Sicherstellen, dass die ID korrekt bleibt
}


console.log("NodeComponent.js geladen - Enthält Funktionen zum Erstellen und Aktualisieren von Knoten-DOM-Elementen.");
