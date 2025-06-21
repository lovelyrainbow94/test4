import { LegalNode, LegalEdge } from './dataModels.js';
import { generateId } from '../utils/helpers.js';
import { addNode, addEdge, renderAll, clearWorkspace } from '../components/WorkspaceComponent.js'; // Annahme: clearWorkspace wird hinzugefügt

// Definition von Standardvorlagen
const templates = {
    "standard_gutachten": {
        name: "Standard Gutachtenaufbau",
        description: "A. Anspruch entstanden, B. Anspruch nicht erloschen, C. Anspruch durchsetzbar",
        nodes: [
            { id: "A", title: "A. Anspruch entstanden", text: "<p>Prüfung, ob der Anspruch dem Grunde nach entstanden ist.</p>", x: 50, y: 50, type: "normal" },
            { id: "B", title: "B. Anspruch nicht erloschen", text: "<p>Prüfung, ob der entstandene Anspruch möglicherweise erloschen ist.</p>", x: 50, y: 200, type: "normal" },
            { id: "C", title: "C. Anspruch durchsetzbar", text: "<p>Prüfung, ob dem Anspruch Einreden oder Einwendungen entgegenstehen.</p>", x: 50, y: 350, type: "normal" },
            { id: "A1", title: "I. Tatbestandsvoraussetzungen der Anspruchsgrundlage", text: "<p>Subsumtion unter die einzelnen Tatbestandsmerkmale...</p>", x: 300, y: 50, type: "normal"},
            { id: "C1", title: "I. Einwendungen", text: "<p>Rechtshindernde Einwendungen...</p>", x: 300, y: 350, type: "normal"},
            { id: "C2", title: "II. Einreden", text: "<p>Rechtshemmende Einreden (z.B. Verjährung)...</p>", x: 300, y: 450, type: "normal"},
            { id: "RESULT", title: "Ergebnis", text: "<p>Der Anspruch besteht [nicht/teilweise].</p>", x: 50, y: 550, type: "result-partial" }
        ],
        edges: [
            { sourceId: "A", targetId: "B", conditionMet: "+", probability: 1.0 },
            { sourceId: "B", targetId: "C", conditionMet: "+", probability: 1.0 },
            { sourceId: "A", targetId: "A1", conditionMet: null, probability: 1.0 },
            { sourceId: "C", targetId: "C1", conditionMet: null, probability: 1.0 },
            { sourceId: "C1", targetId: "C2", conditionMet: "-", probability: 1.0 }, // Beispiel: Wenn keine Einwendungen, dann Einreden prüfen
            { sourceId: "C", targetId: "RESULT", conditionMet: "+", probability: 1.0 } // Von C zum Ergebnis
        ]
    }
    // Hier könnten weitere Vorlagen definiert werden
};

/**
 * Lädt eine vordefinierte Vorlage in den Workspace.
 * @param {string} templateName - Der Name der zu ladenden Vorlage.
 */
export function loadTemplate(templateName) {
    const template = templates[templateName];
    if (!template) {
        console.error(`Vorlage "${templateName}" nicht gefunden.`);
        return;
    }

    clearWorkspace(); // Bestehende Knoten und Kanten entfernen

    // Temporäres Mapping für generierte IDs, falls Kanten auf IDs der Vorlage basieren
    const idMap = {};

    template.nodes.forEach(nodeDef => {
        const newId = generateId(); // Immer neue IDs generieren für neue Instanzen
        idMap[nodeDef.id] = newId; // Alte ID auf neue ID mappen
        const newNode = new LegalNode(
            newId,
            nodeDef.title,
            nodeDef.text,
            nodeDef.x,
            nodeDef.y,
            nodeDef.type
        );
        addNode(newNode); // Fügt Knoten dem Workspace hinzu (und zum globalen nodes Array in WorkspaceComponent)
    });

    template.edges.forEach(edgeDef => {
        const sourceNodeId = idMap[edgeDef.sourceId];
        const targetNodeId = idMap[edgeDef.targetId];

        if (sourceNodeId && targetNodeId) {
            const newEdge = new LegalEdge(
                generateId(),
                sourceNodeId,
                targetNodeId,
                edgeDef.conditionMet,
                edgeDef.probability
            );
            addEdge(newEdge); // Fügt Kante dem Workspace hinzu
        } else {
            console.warn("Konnte Quell- oder Zielknoten für Kante nicht finden beim Laden der Vorlage:", edgeDef);
        }
    });

    renderAll(); // Alles neu zeichnen
    console.log(`Vorlage "${template.name}" geladen.`);
}

/**
 * Gibt eine Liste der verfügbaren Vorlagen zurück.
 * @returns {Array<object>} Liste mit { name, description } der Vorlagen.
 */
export function getAvailableTemplates() {
    return Object.keys(templates).map(key => ({
        id: key,
        name: templates[key].name,
        description: templates[key].description
    }));
}

console.log("templateService.js geladen - Definiert und verwaltet Gutachten-Vorlagen.");
