import { getNodes, getEdges, addNode, addEdge, clearWorkspace, renderAll } from '../components/WorkspaceComponent.js';
import { LegalNode, LegalEdge } from './dataModels.js'; // Wird für Typ-Checking/Instanziierung beim Import benötigt
import { generateId } from '../utils/helpers.js'; // Falls importierte Daten keine IDs haben oder neu generiert werden sollen

const CURRENT_DATA_VERSION = "1.0";

/**
 * Exportiert das aktuelle Gutachten (Knoten und Kanten aus dem WorkspaceComponent)
 * in ein definiertes JSON-Format.
 * @returns {string} - Das Gutachten als JSON-String.
 */
export function exportDataToJson() {
    const nodesToExport = getNodes();
    const edgesToExport = getEdges();

    const data = {
        version: CURRENT_DATA_VERSION,
        createdAt: new Date().toISOString(),
        nodes: nodesToExport,
        edges: edgesToExport,
        // Hier könnten auch Zoom/Pan-Status gespeichert werden, falls gewünscht
        // workspace: { scale: getScale(), panX: getPanX(), panY: getPanY() }
    };
    console.log("Daten werden nach JSON exportiert:", data);
    return JSON.stringify(data, null, 2); // Mit Einrückung für Lesbarkeit
}

/**
 * Importiert ein Gutachten aus einem JSON-String in den Workspace.
 * @param {string} jsonString - Das Gutachten als JSON-String.
 */
export function importDataFromJson(jsonString) {
    console.log("Daten werden aus JSON importiert...");
    try {
        const data = JSON.parse(jsonString);

        if (!data || !data.nodes || !data.edges) {
            throw new Error("Ungültiges Datenformat: 'nodes' oder 'edges' fehlen.");
        }

        // Hier könnte eine Versionsprüfung und ggf. Migration stattfinden
        if (data.version !== CURRENT_DATA_VERSION) {
            console.warn(`Daten haben Version ${data.version}, erwartet wurde ${CURRENT_DATA_VERSION}. Migration könnte notwendig sein.`);
            // Hier Migrationslogik einfügen, falls alte Formate unterstützt werden sollen
        }

        clearWorkspace();

        data.nodes.forEach(nodeData => {
            // Die Hilfsfunktion _createNodeFromData stellt sicher, dass gültige Knotenobjekte erstellt werden
            addNode(_createNodeFromData(nodeData));
        });

        data.edges.forEach(edgeData => {
            // Die Hilfsfunktion _createEdgeFromData stellt sicher, dass gültige Kantenobjekte erstellt werden
            addEdge(_createEdgeFromData(edgeData));
        });

        renderAll();
        console.log("Daten erfolgreich importiert und Workspace aktualisiert.");
        // Ggf. Zoom/Pan wiederherstellen, falls gespeichert
        // if (data.workspace) { setScale(data.workspace.scale); setPan(data.workspace.panX, data.workspace.panY); }

    } catch (error) {
        console.error("Fehler beim Importieren der JSON-Daten:", error);
        alert(`Fehler beim Importieren der Datei: ${error.message}`);
        // Workspace nicht im inkonsistenten Zustand belassen, ggf. leeren oder vorherigen Zustand wiederherstellen
        // clearWorkspace(); renderAll(); // Oder eine robustere Fehlerbehandlung
    }
}

// Private Hilfsfunktionen zur Instanziierung von Knoten und Kanten aus Rohdaten
function _createNodeFromData(nodeData) {
    // Es ist wichtig, dass importierte Knoten gültige Instanzen von LegalNode sind.
    // Wenn jsonString direkt von einer externen Quelle kommt, sollte hier mehr Validierung stattfinden.
    const node = new LegalNode(
        nodeData.id || generateId(), // ID sicherstellen
        nodeData.title,
        nodeData.text,
        nodeData.x,
        nodeData.y,
        nodeData.type
    );
    if (nodeData.width) node.width = nodeData.width;
    // if (nodeData.height) node.height = nodeData.height; // Falls Höhe auch gespeichert wird
    return node;
}

function _createEdgeFromData(edgeData) {
    const edge = new LegalEdge(
        edgeData.id || generateId(), // ID sicherstellen
        edgeData.sourceNodeId,
        edgeData.targetNodeId,
        edgeData.conditionMet,
        edgeData.probability
    );
    return edge;
}

/**
 * Importiert ein Gutachten aus einer strukturierten Textbeschreibung.
 * (Dummy-Implementierung)
 * @param {string} textData - Die strukturierte Textbeschreibung.
 */
export function importDataFromText(textData) {
    console.log("Gutachten wird aus Text importiert (Dummy-Implementierung)...");
    // Dies erfordert einen robusten Parser.
    // Beispielhafte, sehr einfache Syntax, die geparst werden könnte:
    //
    // # Titel Ebene 1 (ID:knoten1)
    // Text für Knoten 1.
    //
    // ## Titel Ebene 2 (ID:knoten2) [+ P=0.8] (Verbindet zu knoten1)
    // Text für Knoten 2.
    //   * Listenpunkt 1
    //   * Listenpunkt 2
    //
    // ### Endergebnis: Ergebnis Titel (ID:knoten3) [Positiv] (Verbindet zu knoten2)
    // Der Anspruch besteht.
    //
    // In einer echten Implementierung würde diese Funktion:
    // 1. Den `textData` String Zeile für Zeile oder mit regulären Ausdrücken parsen.
    // 2. Die Hierarchie (Einrückung oder spezielle Marker wie '#', '##') erkennen, um Eltern-Kind-Beziehungen abzuleiten.
    // 3. Titel, Text, Knotentyp (z.B. aus "[Positiv]"), Kantenbedingungen ("+", "-") und Wahrscheinlichkeiten ("P=0.8") extrahieren.
    // 4. Eindeutige IDs für Knoten generieren oder aus dem Text extrahieren (z.B. "(ID:knoten1)").
    // 5. `LegalNode` und `LegalEdge` Objekte erstellen.
    // 6. `clearWorkspace()` aufrufen.
    // 7. `addNode()` und `addEdge()` für die erstellten Objekte aufrufen.
    // 8. `renderAll()` aufrufen.

    alert("Text-Import ist noch nicht vollständig implementiert und erfordert einen komplexen Parser. Die eingegebenen Daten wurden an die Konsole geloggt.");
    console.log("Empfangene Textdaten für den Import:\n", textData);
    // return { nodes: [], edges: [] }; // Gibt nichts zurück, da es direkt Workspace modifiziert (oder es im Fehlerfall nicht tut)
}

/**
 * Generiert einen fortlaufenden Text aus einem ausgewählten Argumentationspfad.
 * Die Auswahl des Pfades ist hier nicht implementiert. Diese Funktion nimmt an,
 * dass eine geordnete Liste von Knoten-IDs übergeben wird.
 * @param {Array<string>} nodeIdsInPath - Geordnete Liste der IDs der Knoten im Pfad.
 * @returns {string} - Der generierte Text.
 */
export function exportPathToText(nodeIdsInPath) {
    console.log("Argumentationspfad wird zu Text exportiert...");
    if (!nodeIdsInPath || nodeIdsInPath.length === 0) {
        return "Kein Pfad ausgewählt oder Pfad ist leer.";
    }

    const allNodes = getNodes();
    let textOutput = "Exportierter Argumentationspfad:\n\n";
    let errors = "";

    nodeIdsInPath.forEach((nodeId, index) => {
        const node = allNodes.find(n => n.id === nodeId);
        if (node) {
            textOutput += `${index + 1}. ${node.title}\n`;
            // Einfache Konvertierung von HTML zu Text (nur p, br, li extrahieren - sehr rudimentär)
            let nodeText = node.text
                .replace(/<p>(.*?)<\/p>/gi, '$1\n')
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<li>(.*?)<\/li>/gi, '  - $1\n')
                .replace(/<ul.*?>/gi, '')
                .replace(/<\/ul>/gi, '')
                .replace(/<ol.*?>/gi, '')
                .replace(/<\/ol>/gi, '')
                .replace(/<[^>]+>/g, ''); // Restliche Tags entfernen
            textOutput += `${nodeText.trim()}\n\n`;
        } else {
            errors += `Knoten mit ID ${nodeId} nicht gefunden.\n`;
        }
    });

    if (errors) {
        textOutput += "\nFehler beim Export:\n" + errors;
    }
    return textOutput;
}


/**
 * Experimentelle Funktion zum Exportieren des Workspace als SVG.
 * Dies ist eine sehr vereinfachte Annäherung und wird wahrscheinlich keine perfekten Ergebnisse liefern,
 * insbesondere nicht für Kanten oder komplexe CSS-Effekte.
 * Eine robuste Lösung erfordert eine dedizierte SVG-Rendering-Engine oder eine Bibliothek.
 */
export async function exportToSvg() {
    const workspaceArea = document.getElementById('workspace-area'); // oder canvasContainer
    if (!workspaceArea) return "";

    // Dynamischer Import von html-to-image, falls es als ES-Modul verfügbar ist
    // Für dieses Beispiel gehen wir davon aus, dass es global verfügbar ist oder fehlschlägt.
    if (typeof htmlToImage === 'undefined' || typeof htmlToImage.toSvg !== 'function') {
        console.error("html-to-image Bibliothek (toSvg) ist nicht verfügbar.");
        alert("SVG-Exportfunktion ist nicht korrekt initialisiert (html-to-image fehlt).");
        return "<!-- html-to-image nicht verfügbar -->";
    }

    try {
        const dataUrl = await htmlToImage.toSvg(workspaceArea, {
            // Optionen können hier gesetzt werden, z.B. Filter für Elemente
            // backgroundColor: '#f0f0f0', // Hintergrund der Arbeitsfläche
            // filter: (element) => element.tagName !== 'SCRIPT' // Skripte ausschließen
        });
        return dataUrl; // Dies ist eine Data URL, die SVG-Daten enthält
    } catch (error) {
        console.error('Fehler beim SVG-Export:', error);
        alert('Fehler beim SVG-Export: ' + error.message);
        return `<!-- Fehler beim SVG-Export: ${error.message} -->`;
    }
}


/**
 * Experimentelle Funktion zum Exportieren des Workspace als PNG.
 * Nutzt ebenfalls html-to-image.
 */
export async function exportToPng() {
    const workspaceArea = document.getElementById('workspace-area');
    if (!workspaceArea) return "";

    if (typeof htmlToImage === 'undefined' || typeof htmlToImage.toPng !== 'function') {
        console.error("html-to-image Bibliothek (toPng) ist nicht verfügbar.");
        alert("PNG-Exportfunktion ist nicht korrekt initialisiert (html-to-image fehlt).");
        return null; // oder eine Fehler-DataURL
    }

    try {
        const dataUrl = await htmlToImage.toPng(workspaceArea, {
            // Qualität, Hintergrund etc.
            // backgroundColor: '#ffffff', // Standard ist transparent, wenn nicht gesetzt
        });
        return dataUrl; // Data URL für das PNG-Bild
    } catch (error) {
        console.error('Fehler beim PNG-Export:', error);
        alert('Fehler beim PNG-Export: ' + error.message);
        return null;
    }
}


console.log("importExportService.js geladen - Zuständig für Import/Export.");
