// Haupt-Einstiegspunkt der Anwendung
import { initializeWorkspace } from './components/WorkspaceComponent.js';
import { loadTemplate, getAvailableTemplates } from './core/templateService.js';
import { applyAutoLayout } from './core/layoutService.js';
import { exportDataToJson, importDataFromJson } from './core/importExportService.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Juristische Gutachten Visualisierung - DOM geladen, Anwendung wird initialisiert.");

    initializeWorkspace();
    populateTemplateSelector();
    setupEventListeners();

    // Standardmäßig eine Vorlage laden oder leere Arbeitsfläche anzeigen
    loadTemplate('standard_gutachten');

    console.log("Hinweis: Kanten werden aktuell nur im Datenmodell verwaltet, die visuelle Darstellung (Linien) fehlt noch.");
    console.log("Der Rich-Text-Editor für Knoten ist ebenfalls noch nicht implementiert (nur Anzeige von HTML).");
});

function populateTemplateSelector() {
    const selectElement = document.getElementById('template-select');
    if (!selectElement) {
        console.warn("Template-Select Element nicht gefunden.");
        return;
    }

    const templates = getAvailableTemplates();
    templates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = template.name;
        selectElement.appendChild(option);
    });
}

function setupEventListeners() {
    // const loadTemplateBtn = document.getElementById('load-template-btn'); // Entfernt
    const templateSelect = document.getElementById('template-select');
    const autoLayoutBtn = document.getElementById('auto-layout-btn');
    const saveJsonBtn = document.getElementById('save-json-btn');
    const loadJsonInput = document.getElementById('load-json-input');
    const showTextImportBtn = document.getElementById('show-text-import-btn');
    const textImportDialog = document.getElementById('text-import-dialog');
    const executeTextImportBtn = document.getElementById('execute-text-import-btn');
    const cancelTextImportBtn = document.getElementById('cancel-text-import-btn');
    const textImportArea = document.getElementById('text-import-area');
    const exportPngBtn = document.getElementById('export-png-btn');
    const exportSvgBtn = document.getElementById('export-svg-btn');
    const exportPathTextBtn = document.getElementById('export-path-text-btn');


    if (templateSelect) {
        // Direkt beim Ändern der Auswahl laden
        templateSelect.addEventListener('change', () => {
            if (templateSelect.value) { // Lädt nur, wenn value nicht "" (z.B. für "Auswählen...")
                loadTemplate(templateSelect.value);
            }
        });
    } else {
        console.warn("'template-select' nicht gefunden.");
    }

    if (autoLayoutBtn) {
        autoLayoutBtn.addEventListener('click', applyAutoLayout);
    } else {
        console.warn("Button 'auto-layout-btn' nicht gefunden.");
    }

    if (saveJsonBtn) {
        saveJsonBtn.addEventListener('click', () => {
            try {
                const jsonData = exportDataToJson();
                const blob = new Blob([jsonData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `gutachten_${new Date().toISOString().slice(0,10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error("Fehler beim Speichern der JSON-Datei:", error);
                alert("Fehler beim Speichern: " + error.message);
            }
        });
    } else {
        console.warn("Button 'save-json-btn' nicht gefunden.");
    }

    if (loadJsonInput) {
        // Der Klick auf das Label löst den Klick auf das versteckte Input-Feld aus.
        // Das Input-Feld selbst braucht keinen direkten Button mehr.
        loadJsonInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        importDataFromJson(e.target.result);
                    } catch (error) {
                        console.error("Fehler beim Verarbeiten der geladenen Datei:", error);
                        alert("Fehler beim Verarbeiten der Datei: " + error.message);
                    }
                };
                reader.onerror = (e) => {
                    console.error("Fehler beim Lesen der Datei:", e);
                    alert("Fehler beim Lesen der Datei.");
                };
                reader.readAsText(file);
                event.target.value = null; // Input zurücksetzen, um gleiche Datei erneut laden zu können
            }
        });
    } else {
        console.warn("Input-Feld 'load-json-input' nicht gefunden.");
    }

    if (showTextImportBtn && textImportDialog) {
        showTextImportBtn.addEventListener('click', () => {
            textImportDialog.style.display = 'block';
        });
    } else {
        console.warn("Button 'show-text-import-btn' oder Dialog 'text-import-dialog' nicht gefunden.");
    }

    if (executeTextImportBtn && textImportArea && textImportDialog) {
        executeTextImportBtn.addEventListener('click', () => {
            const textData = textImportArea.value;
            if (textData.trim()) {
                // Die Funktion importFromText ist aktuell ein Dummy und wird eine Alert-Box zeigen.
                // In einer echten Implementierung würde sie {nodes, edges} zurückgeben und den Workspace aktualisieren.
                importDataFromText(textData); // importDataFromText ist die umbenannte Funktion
                textImportDialog.style.display = 'none';
                textImportArea.value = ''; // Textfeld leeren
            } else {
                alert("Bitte geben Sie Text für den Import ein.");
            }
        });
    } else {
        console.warn("Elemente für Text-Import ('execute-text-import-btn', 'text-import-area', 'text-import-dialog') nicht vollständig gefunden.");
    }

    if (cancelTextImportBtn && textImportDialog) {
        cancelTextImportBtn.addEventListener('click', () => {
            textImportDialog.style.display = 'none';
            textImportArea.value = ''; // Textfeld leeren
        });
    } else {
        console.warn("Button 'cancel-text-import-btn' oder Dialog 'text-import-dialog' nicht gefunden.");
    }

    if (exportPngBtn) {
        exportPngBtn.addEventListener('click', async () => {
            alert("PNG-Export wird versucht. Dies erfordert die 'html-to-image'-Bibliothek und kann fehlschlagen, wenn sie nicht verfügbar ist. Das Ergebnis ist oft unvollständig ohne korrekte Implementierung der Kantenvisualisierung.");
            try {
                const dataUrl = await exportToPng();
                if (dataUrl) {
                    const a = document.createElement('a');
                    a.href = dataUrl;
                    a.download = `gutachten-export.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                } else {
                    alert("PNG-Export fehlgeschlagen. Siehe Konsole für Details.");
                }
            } catch (error) {
                console.error("Fehler beim PNG-Export-Aufruf:", error);
                alert("Fehler beim PNG-Export: " + error.message);
            }
        });
    } else {
        console.warn("Button 'export-png-btn' nicht gefunden.");
    }

    if (exportSvgBtn) {
        exportSvgBtn.addEventListener('click', async () => {
            alert("SVG-Export wird versucht. Dies erfordert die 'html-to-image'-Bibliothek und kann fehlschlagen, wenn sie nicht verfügbar ist. Das Ergebnis ist oft unvollständig und stellt DOM-Elemente dar, nicht unbedingt eine saubere Vektorgrafik des Diagramms.");
            try {
                const svgDataUrl = await exportToSvg();
                if (svgDataUrl && svgDataUrl.startsWith('data:image/svg+xml')) {
                    try {
                        const base64Data = svgDataUrl.substring(svgDataUrl.indexOf(',') + 1);
                        if (!base64Data) throw new Error("Keine Base64-Daten in SVG Data URL gefunden.");
                        const svgString = atob(base64Data); // Kann Fehler werfen bei ungültigem Base64
                        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `gutachten-export.svg`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    } catch (e) {
                        console.error("Fehler bei der Verarbeitung der SVG Daten-URL:", e);
                        alert("Fehler bei der Verarbeitung der SVG-Daten: " + e.message);
                    }
                } else if (svgDataUrl) {
                    console.warn("SVG-Export gab unerwartete Daten zurück:", svgDataUrl);
                    alert("SVG-Export lieferte keine gültige SVG-Daten-URL. Möglicherweise ein Fehlerkommentar aus dem Exportservice.");
                } else { // exportToSvg() hat null zurückgegeben
                    alert("SVG-Export fehlgeschlagen. Siehe Konsole für Details.");
                }
            } catch (error) { // Fehler vom exportToSvg() Aufruf selbst
                console.error("Fehler beim SVG-Export-Aufruf:", error);
                alert("Fehler beim SVG-Export: " + error.message);
            }
        });
    } else {
        console.warn("Button 'export-svg-btn' nicht gefunden.");
    }

    if (exportPathTextBtn) {
        exportPathTextBtn.addEventListener('click', () => {
            // Dummy-Pfadauswahl: Nimmt alle aktuellen Knoten-IDs in ihrer Reihenfolge
            const allNodeIds = getNodes().map(n => n.id);
            if (allNodeIds.length === 0) {
                alert("Keine Knoten im Workspace zum Exportieren.");
                return;
            }
            const textOutput = exportPathToText(allNodeIds);

            // Anzeige des Textes (z.B. in einem neuen Fenster oder Alert, für Demo hier Alert)
            // Für längere Texte wäre eine andere Ausgabemethode (Textarea, Download) besser.
            console.log("Exportierter Pfad:\n", textOutput);
            alert("Pfad als Text exportiert (siehe Konsole für vollständigen Text):\n\n" + textOutput.substring(0, 200) + (textOutput.length > 200 ? "..." : ""));

            // Alternative: Download als .txt Datei
            // const blob = new Blob([textOutput], { type: 'text/plain;charset=utf-8' });
            // const url = URL.createObjectURL(blob);
            // const a = document.createElement('a');
            // a.href = url;
            // a.download = `argumentationspfad.txt`;
            // document.body.appendChild(a);
            // a.click();
            // document.body.removeChild(a);
            // URL.revokeObjectURL(url);
        });
    } else {
        console.warn("Button 'export-path-text-btn' nicht gefunden.");
    }
}
