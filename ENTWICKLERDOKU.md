# Technische Dokumentation: Visuelle Gutachtenerstellung

Dieses Dokument richtet sich an Entwickler, die an der Anwendung zur visuellen Erstellung und Analyse von juristischen Gutachten arbeiten oder diese erweitern möchten.

## 1. Projektübersicht und Architektur

*   **Ziel:** Eine Webanwendung zur Erstellung und Visualisierung von juristischen Gutachten als interaktive Baumdiagramme.
*   **Technologie-Stack (Kern):**
    *   Vanilla JavaScript (ES6 Module) für die Kernlogik und DOM-Manipulation.
    *   HTML5 und CSS3 für Struktur und Styling.
    *   Kein übergeordnetes Frontend-Framework (wie React, Angular, Vue) im aktuellen Stand.
*   **Architekturansatz:**
    *   Modulare Struktur mit Trennung von UI-Komponenten (DOM-Manipulation), Kernlogik (Datenmodelle, Dienste) und Hilfsfunktionen.
    *   Zustandsverwaltung erfolgt primär im `WorkspaceComponent.js` und durch direkte DOM-Updates.

## 2. Ordnerstruktur

Das Projekt ist wie folgt strukturiert:

*   `README.md`: Allgemeine Informationen zum Projekt.
*   `AGENTS.md`: Spezifische Anweisungen für KI-Agenten, die am Code arbeiten.
*   `BENUTZERHANDBUCH.md`: Anleitung für Endanwender.
*   `ENTWICKLERDOKU.md`: Dieses Dokument.
*   `SPEICHERFORMAT.md`: Detaillierte Beschreibung des JSON-Speicherformats.
*   `package.json`: Projektmetadaten und (minimale) Abhängigkeiten.
*   `public/`: Statische Dateien, die direkt vom Webserver ausgeliefert werden.
    *   `index.html`: Haupt-HTML-Datei der Anwendung.
    *   `style.css`: Globale CSS-Stile für die Anwendung.
*   `src/`: Enthält den JavaScript-Quellcode der Anwendung.
    *   `index.js`: Haupteinstiegspunkt der JavaScript-Anwendung. Initialisiert die Arbeitsfläche und bindet Event-Listener für die UI-Steuerelemente.
    *   `components/`: Enthält Module, die für die Erstellung und Verwaltung von UI-Elementen zuständig sind.
        *   `NodeComponent.js`: Funktionen zum Erstellen und Aktualisieren der DOM-Repräsentation von Prüfungspunkten (Knoten).
        *   `EdgeComponent.js`: Funktionen zum Erstellen und Aktualisieren von SVG-Elementen für Kanten, inklusive Linien, Pfeilspitzen und Textbeschriftungen.
        *   `WorkspaceComponent.js`: Kernmodul für die Interaktivität der Arbeitsfläche (Zoom, Pan, Drag & Drop von Knoten), Verwaltung des Zustands (Knoten, Kanten), Verwaltung des SVG-Layers für Kanten und Rendering der gesamten Szene.
    *   `core/`: Enthält die Kernlogik und Datenmodelle der Anwendung.
        *   `dataModels.js`: Definiert die Klassen `LegalNode` und `LegalEdge`, die die Struktur von Prüfungspunkten und deren Verbindungen repräsentieren.
        *   `importExportService.js`: Beinhaltet Funktionen zum Im- und Exportieren von Gutachten in verschiedenen Formaten (JSON, Text-Dummy, Bild-Dummy).
        *   `layoutService.js`: Stellt Funktionen zur automatischen Anordnung der Knoten auf der Arbeitsfläche bereit (aktuell mit einem Dummy-Algorithmus).
        *   `templateService.js`: Ermöglicht das Laden von vordefinierten Gutachten-Vorlagen.
    *   `utils/`: Enthält allgemeine Hilfsfunktionen.
        *   `helpers.js`: Funktionen wie `generateId()` und ein rudimentärer `sanitizeHTML()`-Platzhalter.

## 3. Wichtige Module und ihre Verantwortlichkeiten

### `src/index.js`
*   Initialisiert die Anwendung nach dem Laden des DOM.
*   Ruft `initializeWorkspace()` aus `WorkspaceComponent.js` auf.
*   Füllt das Vorlagen-Dropdown-Menü.
*   Registriert alle globalen Event-Listener für die Toolbar-Elemente (Vorlagen laden, Auto-Layout, Speichern/Laden JSON, Text-Import, Bild-Exporte).
*   Lädt initial eine Standardvorlage.

### `src/components/WorkspaceComponent.js`
*   Verwaltet den Zustand der Arbeitsfläche: Liste der Knoten (`_nodes`), Liste der Kanten (`_edges`), Zoomfaktor (`scale`), Pan-Position (`panX`, `panY`).
*   Implementiert die Logik für:
    *   **Panning:** Verschieben des sichtbaren Bereichs der Arbeitsfläche.
    *   **Zooming:** Vergrößern/Verkleinern der Ansicht.
    *   **Knoten-Dragging:** Verschieben einzelner Knoten per Maus.
*   Funktionen:
    *   `initializeWorkspace()`: Setzt Event-Listener für Mausinteraktionen auf der Arbeitsfläche und initialisiert den SVG-Layer (inkl. Pfeilspitzen-Definition).
    *   `addNode(nodeData)`, `addEdge(edgeData)`: Fügen Knoten/Kanten zum Datenmodell hinzu. `addNode` erstellt DOM-Elemente für Knoten, `addEdge` ruft `EdgeComponent.createSvgEdgeElement` auf, um SVG-Elemente für Kanten zu erstellen und dem SVG-Layer hinzuzufügen.
    *   `clearWorkspace()`: Entfernt alle Knoten (DOM) und Kanten (SVG).
    *   `renderAll()`: Zeichnet alle Knoten (DOM) und Kanten (SVG) neu.
    *   `getNodes()`, `getEdges()`, `setNodes()`: Getter/Setter für den Zugriff auf die Knoten- und Kantenliste.
*   Aktualisiert verbundene Kanten dynamisch, wenn ein Knoten verschoben wird.

### `src/components/EdgeComponent.js`
*   `createSvgEdgeElement(edgeData, nodeList)`: Erstellt ein SVG `<g>` Element, das eine Kante repräsentiert. Die Gruppe enthält eine `<line>` für die Kantenverbindung und `<text>` Elemente zur Anzeige von `conditionMet` und `probability`. Setzt Pfeilspitzen und Farben basierend auf Kantendaten.
*   `updateSvgEdgeElement(groupElement, sourceNode, targetNode, edgeData)`: Aktualisiert die Position und Attribute einer bestehenden SVG-Kantengruppe und ihrer Kindelemente (Linie, Texte).
*   `getArrowheadDefinition()`: Erzeugt eine SVG `<marker>` Definition für Pfeilspitzen.

### `src/components/NodeComponent.js`
*   `createNodeElement(nodeData, eventHandlers)`: Erzeugt ein DOM-Element (`div.node`) für einen gegebenen `LegalNode`. Setzt Stil, Inhalt (Titel, Text) und Event-Handler für Dragging und (zukünftige) Bearbeitung.
*   `updateNodeElement(nodeElement, nodeData)`: Aktualisiert ein bestehendes Knoten-DOM-Element mit neuen Daten.

### `src/core/dataModels.js`
*   `LegalNode`: Klasse zur Repräsentation eines Prüfungspunktes mit Eigenschaften wie `id`, `title`, `text`, `x`, `y`, `type`, `width`, `height`.
*   `LegalEdge`: Klasse zur Repräsentation einer Verbindung mit Eigenschaften wie `id`, `sourceNodeId`, `targetNodeId`, `conditionMet`, `probability`.

### `src/core/templateService.js`
*   Definiert und verwaltet vordefinierte Gutachten-Vorlagen.
*   `loadTemplate(templateName)`: Lädt eine Vorlage, indem sie Knoten und Kanten gemäß der Vorlagendefinition erstellt und dem `WorkspaceComponent` hinzufügt.
*   `getAvailableTemplates()`: Gibt eine Liste der verfügbaren Vorlagen zurück.

### `src/core/layoutService.js`
*   `applyAutoLayout()`: Wendet einen (aktuell sehr einfachen Dummy-) Algorithmus zur automatischen Positionierung der Knoten an. Greift über `getNodes()` und `setNodes()` auf die Knotendaten im `WorkspaceComponent` zu und stößt `renderAll()` an.

### `src/core/importExportService.js`
*   `exportDataToJson()`: Serialisiert den aktuellen Zustand (Knoten, Kanten) in einen JSON-String.
*   `importDataFromJson(jsonString)`: Parst einen JSON-String, validiert ihn oberflächlich und lädt die Daten in den Workspace.
*   `importDataFromText(textData)`: Dummy-Funktion für den Text-Import. Ein echter Parser ist hier nicht implementiert.
*   `exportPathToText(nodeIdsInPath)`: Generiert einen fortlaufenden Text aus einer gegebenen Liste von Knoten-IDs (Dummy-Pfadauswahl in `index.js`).
*   `exportToSvg()`, `exportToPng()`: Experimentelle Funktionen zum Export der Arbeitsfläche als Bild. Nutzen die externe Bibliothek `html-to-image`.

### `SPEICHERFORMAT.md`
*   Eine separate, detaillierte Dokumentation des JSON-Speicherformats. Es wird dringend empfohlen, diese Datei zu konsultieren, wenn am Speicher- oder Ladevorgang gearbeitet wird.

## 4. Datenfluss (Grob)

1.  **Initialisierung (`index.js`):**
    *   `initializeWorkspace()` wird aufgerufen. Dies initialisiert auch den SVG-Layer und die Pfeilspitzen-Definition.
    *   Eine Standardvorlage wird via `templateService.loadTemplate()` geladen.
    *   `loadTemplate` ruft `WorkspaceComponent.clearWorkspace()`, dann `addNode()` und `addEdge()` für jedes Element der Vorlage auf.
        *   `addNode` erstellt DOM-Elemente über `NodeComponent.createNodeElement()`.
        *   `addEdge` erstellt SVG-Gruppen (Linie + Text) über `EdgeComponent.createSvgEdgeElement()` und fügt sie dem `edgesGroup` SVG-Element hinzu.
    *   Schließlich wird `renderAll()` (implizit oder explizit) aufgerufen, was alle Knoten und Kanten neu zeichnet.
2.  **Nutzerinteraktion (z.B. Knoten verschieben in `WorkspaceComponent.js`):**
    *   `mousedown` auf Knoten -> `onNodeMouseDown` speichert `activeDragNodeId` und Drag-Offset.
    *   `mousemove` auf Arbeitsfläche -> `pan()` (wenn `activeDragNodeId` gesetzt) aktualisiert `node.x`, `node.y` des `LegalNode`-Objekts im `_nodes`-Array und direkt die `style.left/top` des DOM-Elements. Zusätzlich werden alle mit dem verschobenen Knoten verbundenen Kanten durch Aufruf von `EdgeComponent.updateSvgEdgeElement()` aktualisiert.
3.  **Speichern (`importExportService.exportDataToJson`):**
    *   Holt `_nodes` und `_edges` vom `WorkspaceComponent`.
    *   Serialisiert diese Daten zu JSON.
4.  **Laden (`importExportService.importDataFromJson`):**
    *   Parst JSON, ruft `clearWorkspace()`, dann `addNode()`/`addEdge()` für jedes Element und schließlich `renderAll()`.

## 5. Hinweise für zukünftige Entwicklung

*   **Verbesserung der Kantendarstellung:**
    *   **Andockpunkte:** Implementierung einer Logik, damit Kanten präziser an den Rändern der Knoten andocken, anstatt an deren Mittelpunkten. Dies könnte die Berechnung von Schnittpunkten oder die Verwendung definierter Andockpunkte an den Knotenseiten beinhalten. Die tatsächliche gerenderte Größe der Knoten (`offsetHeight`/`offsetWidth`) sollte hierfür berücksichtigt werden.
    *   **Textrotation:** Kantenbeschriftungen (Bewertung, Wahrscheinlichkeit) sollten idealerweise mit der Kante rotiert werden, um die Lesbarkeit bei verschiedenen Kantenwinkeln zu verbessern.
    *   **Interaktivität:** Ermöglichen der Auswahl von Kanten, um deren Eigenschaften (z.B. Wahrscheinlichkeit) direkt zu bearbeiten.
*   **Rich-Text-Editor:** Integration eines WYSIWYG-Editors für die Texteingabe in Knoten, um die Formatierung zu erleichtern (anstelle direkter HTML-Eingabe).
*   **Layout-Algorithmus:** Ersetzen des Dummy-Layout-Algorithmus durch einen anspruchsvolleren (z.B. Sugiyama-basiert für hierarchische Darstellungen oder Force-Directed).
*   **Text-Import-Parser:** Entwicklung eines robusten Parsers für die `importDataFromText`-Funktion.
*   **Manuelles Erstellen/Verbinden:** UI-Werkzeuge zum manuellen Hinzufügen neuer Knoten und zum Ziehen von Kanten zwischen Knoten.
*   **Performance:** Bei sehr großen Gutachten kann die direkte DOM-Manipulation und das Neuzeichnen aller Elemente in `renderAll()` an Grenzen stoßen. Optimierungen (z.B. Virtualisierung der Arbeitsfläche, selektives Neuzeichnen) könnten notwendig werden.
*   **UUIDs:** Ersetzen von `generateId()` durch eine robustere UUID-Bibliothek.
*   **Zustandsmanagement:** Bei wachsender Komplexität könnte ein dediziertes Zustandsmanagement-Pattern (ähnlich wie bei Frameworks) in Betracht gezogen werden.

## 6. Abhängigkeiten

*   **`html-to-image`:** (Optional, für Bildexport) Wird über CDN geladen. Für eine Produktionsanwendung sollte dies lokal gebündelt werden.

Dieses Dokument soll einen guten Ausgangspunkt für das Verständnis und die Weiterentwicklung der Anwendung bieten.
