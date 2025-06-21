# Benutzerhandbuch: Visuelle Gutachtenerstellung

Willkommen bei der Anwendung zur visuellen Erstellung und Analyse von juristischen Gutachten! Dieses Handbuch hilft Ihnen, die Funktionen der Anwendung zu verstehen und effektiv zu nutzen.

## 1. Einführung

Diese Anwendung ermöglicht es Ihnen, komplexe juristische Argumentationsketten als dynamische Baumdiagramme darzustellen. Sie können Prüfungspunkte erstellen, diese miteinander verbinden und so die Struktur eines Gutachtens visuell nachvollziehen und aufbauen.

## 2. Die Arbeitsfläche

Im Zentrum der Anwendung steht eine interaktive Arbeitsfläche.

*   **Verschieben (Panning):** Klicken Sie mit der linken Maustaste auf einen leeren Bereich der Arbeitsfläche und halten Sie die Taste gedrückt. Bewegen Sie die Maus, um den sichtbaren Ausschnitt des Gutachtens zu verschieben.
*   **Zoomen:** Verwenden Sie das Mausrad, um stufenlos in das Gutachten hinein- oder herauszuzoomen. Dies erlaubt sowohl einen Überblick über die gesamte Struktur als auch die Detailansicht einzelner Punkte.

## 3. Prüfungspunkte (Knoten)

Prüfungspunkte sind die Bausteine Ihres Gutachtens.

*   **Erstellen:** Neue Knoten werden typischerweise durch das Laden einer Vorlage oder durch Importfunktionen erstellt. Eine Funktion zum manuellen Hinzufügen von Knoten über die UI ist derzeit nicht im Fokus, kann aber über Erweiterungen implementiert werden.
*   **Verschieben:** Klicken Sie auf einen Knoten und halten Sie die linke Maustaste gedrückt. Ziehen Sie den Knoten an die gewünschte Position auf der Arbeitsfläche und lassen Sie die Maustaste los. Die mit dem Knoten verbundenen Kanten werden dabei automatisch aktualisiert.
*   **Titel:** Jeder Knoten zeigt einen Titel an. Dieser kann (zukünftig über einen Editor) bearbeitet werden.
*   **Textuelle Argumentation:** Jeder Knoten enthält einen Textbereich für die detaillierte juristische Argumentation.
    *   **Formatierung (Basis):** Der Text kann einfache HTML-Formatierungen wie `<p>` (Absätze), `<b>` oder `<strong>` (fett), `<i>` oder `<em>` (kursiv) sowie Listen (`<ul>`, `<ol>`, `<li>`) enthalten. Ein vollwertiger Rich-Text-Editor ist für eine zukünftige Version geplant. Aktuell wird eingegebenes HTML direkt dargestellt.
    *   **Bearbeiten:** Doppelklicken Sie auf einen Knoten, um (zukünftig) einen Editor für Titel und Text zu öffnen. Aktuell wird eine Hinweismeldung angezeigt.
*   **Endergebnisse:** Bestimmte Prüfungspunkte können als Endergebnis markiert werden, um den Ausgang eines Argumentationsstranges klar zu kennzeichnen:
    *   **Positives Ergebnis:** (z.B. "Anspruch besteht") - Visuell grün hervorgehoben.
    *   **Negatives Ergebnis:** (z.B. "Anspruch besteht nicht") - Visuell rot hervorgehoben.
    *   **Teilergebnis:** (z.B. "Anspruch besteht teilweise") - Visuell gelb hervorgehoben.

## 4. Verbindungslinien (Kanten)

Prüfungspunkte werden durch Linien (Kanten) miteinander verbunden, um die logische Reihenfolge und Abhängigkeiten darzustellen.

*   **Erstellen:** Kanten werden primär durch Vorlagen oder Importfunktionen erstellt. Eine manuelle Erstellung von Kanten über die UI (z.B. durch Ziehen von einem Knoten zum anderen) ist für zukünftige Versionen vorgesehen.
*   **Visuelle Darstellung:**
    *   Kanten werden als Linien zwischen den verbundenen Knoten gezeichnet.
    *   Eine **Pfeilspitze** am Ende der Linie zeigt die Richtung der Abhängigkeit an.
    *   Die **Farbe der Linie** signalisiert die Bewertung der Bedingung des vorangehenden Punktes:
        *   **Grün:** Bedingung erfüllt ("+").
        *   **Orange:** Bedingung nicht erfüllt ("-").
        *   **Grau:** Keine explizite Bewertung.
*   **Zusatzinformationen auf Kanten:**
    *   **Bewertung:** Das Symbol "+" oder "-" wird mittig über der Kante angezeigt, wenn eine Bewertung vorhanden ist.
    *   **Wahrscheinlichkeit:** Wenn eine Wahrscheinlichkeit (ungleich 1.0) für den Argumentationsschritt festgelegt wurde, wird diese als "P=X.XX" unterhalb der Bewertung (oder mittig, falls keine Bewertung vorhanden) angezeigt.
    *   *Hinweis:* Die Texte für Bewertung und Wahrscheinlichkeit sind aktuell immer horizontal ausgerichtet. Die Linien verbinden die Mittelpunkte der Knoten.

## 5. Vorlagen

Die Anwendung bietet die Möglichkeit, mit Standard-Vorlagen für juristische Gutachten zu starten.

*   **Vorlage auswählen:** In der Toolbar oben finden Sie ein Dropdown-Menü (beschriftet mit "Vorlage:"). Wählen Sie hier eine Vorlage aus (z.B. "Standard Gutachtenaufbau").
*   **Laden:** Die Vorlage wird automatisch geladen, sobald Sie eine Auswahl treffen. Die Arbeitsfläche wird dabei zurückgesetzt und mit den Elementen der Vorlage gefüllt.

## 6. Automatische Anordnung

Eine Funktion ermöglicht es, das gesamte Diagramm auf Knopfdruck übersichtlich anordnen zu lassen.

*   **Auslösen:** Klicken Sie in der Toolbar auf den Button "Automatisch anordnen".
*   **Ergebnis:** Die Knoten werden automatisch auf der Arbeitsfläche neu positioniert. *Hinweis: Der aktuelle Algorithmus ist eine einfache Kaskadierung und dient primär Demonstrationszwecken.*

## 7. Datenverwaltung

Sie können Ihre Gutachten speichern, laden und exportieren.

*   **Speichern (JSON):**
    *   Klicken Sie in der Toolbar auf "Speichern (JSON)".
    *   Ihr aktuelles Gutachten (alle Knoten und deren Verbindungen) wird als JSON-Datei heruntergeladen (z.B. `gutachten_JJJJ-MM-TT.json`).
*   **Laden (JSON):**
    *   Klicken Sie in der Toolbar auf das Label "Laden (JSON)".
    *   Es öffnet sich ein Dateiauswahldialog. Wählen Sie eine zuvor gespeicherte JSON-Datei aus.
    *   Das Gutachten aus der Datei wird auf der Arbeitsfläche geladen. Achtung: Der aktuelle Inhalt der Arbeitsfläche wird dabei überschrieben.
*   **Import aus Text (Experimentell):**
    *   Klicken Sie in der Toolbar auf "Text-Import anzeigen". Es öffnet sich ein Dialog.
    *   Fügen Sie eine strukturierte Textbeschreibung Ihres Gutachtens in das Textfeld ein. Eine Beispielsyntax ist im Dialog angedeutet.
    *   Klicken Sie auf "Importieren".
    *   *Hinweis: Die Funktion zum Parsen des Textes ist aktuell ein Dummy. Es wird eine Meldung angezeigt, und der Text wird in der Konsole geloggt. Eine vollständige Implementierung ist sehr komplex.*
*   **Export als Bild (PNG/SVG - Experimentell):**
    *   Klicken Sie in der Toolbar auf "Export als PNG" oder "Export als SVG".
    *   Die Anwendung versucht, den aktuellen Inhalt der Arbeitsfläche als Bilddatei zu exportieren.
    *   *Hinweis: Diese Funktion ist experimentell und basiert auf der externen Bibliothek `html-to-image`. Die Qualität des Exports kann variieren und ist insbesondere für die (noch nicht visuell dargestellten) Kanten und komplexe Layouts nicht immer perfekt. Für den Export muss die `html-to-image`-Bibliothek korrekt geladen sein (erfolgt über CDN).*
*   **Pfad als Text exportieren (Dummy):**
    *   Klicken Sie in der Toolbar auf "Pfad als Text exportieren (Dummy)".
    *   Diese Funktion exportiert die Titel und Texte *aller* aktuell auf der Arbeitsfläche befindlichen Knoten in ihrer internen Reihenfolge als Text. Eine Auswahl eines spezifischen Argumentationspfades ist noch nicht implementiert.
    *   Der exportierte Text wird in der Konsole ausgegeben und ein Teil davon in einer Hinweismeldung angezeigt.

## 8. Bekannte Einschränkungen (Auswahl)

*   **Rich-Text-Editor:** Ein Editor zur komfortablen Formatierung der Knotentexte fehlt noch. HTML kann aber direkt im Datenmodell verwendet werden (oder muss für den Import entsprechend aufbereitet sein).
*   **Manuelles Erstellen von Knoten/Kanten:** Die UI bietet noch keine direkten Werkzeuge zum manuellen Hinzufügen neuer Knoten oder zum Zeichnen und Bearbeiten von Kanten.
*   **Kanten-Andockpunkte:** Kanten verbinden aktuell die Mittelpunkte der Knoten. Dies kann bei großen Knoten oder bestimmten Layouts dazu führen, dass Linien ungünstig in Knoten hineinragen oder Pfeilspitzen nicht optimal am Rand positioniert sind.
*   **Kantenbeschriftungen:** Die Texte für Bewertung und Wahrscheinlichkeit auf den Kanten sind immer horizontal ausgerichtet. Bei sehr kurzen oder stark gewinkelten Kanten kann dies die Lesbarkeit beeinträchtigen oder zu Überlappungen mit der Linie führen.
*   **Text-Import:** Die Funktionalität zum Importieren von Gutachten aus strukturiertem Text ist aktuell nur ein Platzhalter und führt keine echte Konvertierung durch.
*   **Bild-Export:** Ist experimentell und basiert auf der Umwandlung des aktuellen DOM-Zustands in ein Bild. Dies liefert möglicherweise keine perfekten oder für alle Anwendungsfälle geeigneten Ergebnisse, insbesondere bei komplexen Diagrammen oder wenn nicht alle Elemente (wie sehr feine Details) optimal erfasst werden.

Wir hoffen, dieses Handbuch hilft Ihnen beim Einstieg!
