# Hinweise für KI-Agenten

## Projektübersicht
Dieses Projekt dient der Erstellung einer Anwendung zur visuellen Erstellung und Analyse von juristischen Gutachten. Kernstück ist eine dynamische Baumstruktur auf einer zoombaren und verschiebbaren Arbeitsfläche.

## Technologie-Stack (geplant)
- Frontend: JavaScript (möglicherweise mit einem Framework wie React, Vue oder Angular)
- Canvas-Interaktion: Eine Bibliothek wie fabric.js oder Konva.js könnte verwendet werden.
- Datenformat: JSON für Speicherung und Austausch.

## Wichtige Konzepte
- **Prüfungspunkte (Knoten):** Bausteine des Gutachtens mit Titel und formatiertem Text. Können als "Endergebnis" (positiv, negativ, teilweise) markiert werden.
- **Verbindungslinien (Kanten):** Stellen logische Abhängigkeiten dar. Tragen Informationen zur Erfüllung der Bedingung ("+", "-") und eine Wahrscheinlichkeit (0-1).
- **Arbeitsfläche:** Unbegrenzt, zoom- und schwenkbar.
- **Vorlagen:** Standard-Gutachtenstrukturen als Startpunkt.
- **Automatische Anordnung:** Funktion zur übersichtlichen Darstellung des Diagramms.
- **Import/Export:**
    - Speichern/Laden im eigenen Format (JSON).
    - Import aus strukturiertem Text.
    - Export als Bild (SVG/PNG).
    - Export eines Argumentationspfades als Text.

## Zu beachtende Punkte bei der Entwicklung
1.  **Datenmodelle (`src/core/dataModels.js`):** `LegalNode` und `LegalEdge` sind zentral. Änderungen hier haben weitreichende Auswirkungen.
2.  **Canvas-Interaktion:** Die Logik für das Zeichnen, Verschieben, Zoomen und Verbinden von Elementen wird komplex. Eine klare Trennung der Verantwortlichkeiten ist wichtig.
3.  **Text-Editor:** Der Editor für die Prüfungspunkte sollte einfache Formatierungen (Fett, Kursiv, Listen) ermöglichen. Die Speicherung des formatierten Textes (z.B. als HTML-Subset) muss bedacht werden.
4.  **Layout-Algorithmus (`src/core/layoutService.js`):** Die automatische Anordnung ist eine Herausforderung. Zunächst kann eine einfache Implementierung erfolgen, später eventuell durch komplexere Algorithmen ersetzt werden.
5.  **Text-Import-Parser (`src/core/importExportService.js`):** Die Definition einer robusten und benutzerfreundlichen Syntax für den Text-Import ist entscheidend. Der Parser muss fehlertolerant sein.
6.  **Zukunftssicherheit des Speicherformats:** Das JSON-Format sollte gut dokumentiert werden. Überlegen Sie, wie Versionsänderungen im Format gehandhabt werden können.

## Anweisungen für Code-Änderungen
- Halten Sie sich an die geplante Ordnerstruktur.
- Kommentieren Sie neuen Code, insbesondere komplexe Logik.
- Wenn Sie UI-Komponenten erstellen (auch Platzhalter), deuten Sie an, wie diese mit der Kernlogik interagieren könnten (z.B. durch Props oder Event-Handler).
- Für Funktionen, deren Implementierung den Rahmen einer einzelnen Antwort sprengen würde (z.B. vollständiger Layout-Algorithmus, Text-Parser), erstellen Sie eine Platzhalterfunktion mit einer klaren Beschreibung dessen, was sie tun soll und welche Parameter sie erwartet.
- Versuchen Sie, die Prinzipien der modularen Entwicklung zu befolgen.
- Bevor Sie eine Funktion als "fertig" betrachten, überlegen Sie sich grundlegende Testfälle (auch wenn Sie die Tests nicht sofort schreiben).

Vorerst keine programmatischen Checks.
