# Spezifikation des JSON-Speicherformats für Juristische Gutachten

Dieses Dokument beschreibt das JSON-Format, das von der Anwendung zur visuellen Erstellung und Analyse von juristischen Gutachten zum Speichern und Laden von Gutachtenstrukturen verwendet wird.

**Version:** 1.0
**Datum:** 2023-10-27 (Beispielhaftes Datum der Erstellung dieser Spezifikation)

## Globale Struktur

Das gesamte Gutachten wird als ein JSON-Objekt gespeichert. Dieses Objekt hat folgende Top-Level-Eigenschaften:

```json
{
  "version": "1.0",
  "createdAt": "2023-10-27T10:00:00.000Z",
  "nodes": [ /* Array von Knoten-Objekten */ ],
  "edges": [ /* Array von Kanten-Objekten */ ],
  "workspace": { /* Optional: Zustand der Arbeitsfläche */ }
}
```

*   `version` (String, erforderlich): Die Version dieses Speicherformats. Aktuell "1.0". Dies ermöglicht zukünftige Migrationen, falls sich das Format ändert.
*   `createdAt` (String, erforderlich): Ein ISO 8601 Datums-Zeit-String, der den Zeitpunkt der Erstellung/des letzten Speicherns der Datei angibt.
*   `nodes` (Array, erforderlich): Ein Array, das alle Prüfungspunkte (Knoten) des Gutachtens enthält. Jeder Knoten ist ein Objekt, dessen Struktur unten beschrieben wird.
*   `edges` (Array, erforderlich): Ein Array, das alle Verbindungslinien (Kanten) zwischen den Prüfungspunkten enthält. Jede Kante ist ein Objekt, dessen Struktur unten beschrieben wird.
*   `workspace` (Objekt, optional): Kann Informationen über den Zustand der Arbeitsfläche enthalten, z.B. Zoomfaktor und Pan-Position.
    *   `scale` (Number): Der Zoomfaktor der Arbeitsfläche.
    *   `panX` (Number): Die X-Position der Verschiebung der Arbeitsfläche.
    *   `panY` (Number): Die Y-Position der Verschiebung der Arbeitsfläche.
    *(Hinweis: Die Speicherung des Workspace-Zustands ist aktuell in der Implementierung noch nicht vorgesehen, aber das Format ist dafür vorbereitet.)*

## Struktur eines Knoten-Objekts (`LegalNode`)

Jedes Objekt im `nodes`-Array repräsentiert einen Prüfungspunkt und hat folgende Eigenschaften:

```json
{
  "id": "string_eindeutige_id_abc123",
  "title": "Titel des Prüfungspunkts",
  "text": "<p>HTML-formatierter Text der <b>Argumentation</b>.</p><ul><li>Listenpunkt 1</li></ul>",
  "x": 150.75,
  "y": 220.5,
  "type": "normal | result-positive | result-negative | result-partial",
  "width": 200,
  "height": "auto" /* oder eine Zahl */
}
```

*   `id` (String, erforderlich): Eine eindeutige Identifikationszeichenkette für den Knoten. Wird intern generiert (z.B. `_abcdef123`).
*   `title` (String, erforderlich): Der Titel des Prüfungspunkts, der im Knoten angezeigt wird.
*   `text` (String, erforderlich): Der detaillierte juristische Argumentationstext. Dieser String enthält HTML-Markup für Formatierungen (z.B. `<p>`, `<strong>` oder `<b>` für Fett, `<em>` oder `<i>` für Kursiv, `<ul>`, `<ol>`, `<li>` für Listen).
*   `x` (Number, erforderlich): Die X-Koordinate der oberen linken Ecke des Knotens auf der Arbeitsfläche.
*   `y` (Number, erforderlich): Die Y-Koordinate der oberen linken Ecke des Knotens auf der Arbeitsfläche.
*   `type` (String, erforderlich): Definiert den Typ des Knotens, was seine visuelle Darstellung beeinflussen kann. Mögliche Werte:
    *   `"normal"`: Ein regulärer Prüfungspunkt.
    *   `"result-positive"`: Ein positives Endergebnis (z.B. "Anspruch besteht").
    *   `"result-negative"`: Ein negatives Endergebnis (z.B. "Anspruch besteht nicht").
    *   `"result-partial"`: Ein Teilergebnis (z.B. "Anspruch besteht teilweise").
*   `width` (Number, optional): Die Breite des Knotens in Pixeln. Wenn nicht vorhanden, kann ein Standardwert verwendet werden.
*   `height` (String oder Number, optional): Die Höhe des Knotens. Kann eine Zahl (Pixel) oder `"auto"` sein, wenn sich die Höhe dynamisch an den Inhalt anpassen soll. Wenn nicht vorhanden, kann ein Standardwert oder `"auto"` angenommen werden.

## Struktur eines Kanten-Objekts (`LegalEdge`)

Jedes Objekt im `edges`-Array repräsentiert eine Verbindungslinie und hat folgende Eigenschaften:

```json
{
  "id": "string_eindeutige_id_xyz789",
  "sourceNodeId": "string_id_des_quellknotens",
  "targetNodeId": "string_id_des_zielknotens",
  "conditionMet": "+ | - | null",
  "probability": 0.85
}
```

*   `id` (String, erforderlich): Eine eindeutige Identifikationszeichenkette für die Kante.
*   `sourceNodeId` (String, erforderlich): Die `id` des Knotens, von dem diese Kante ausgeht.
*   `targetNodeId` (String, erforderlich): Die `id` des Knotens, zu dem diese Kante hinführt.
*   `conditionMet` (String oder `null`, optional): Gibt an, ob die Bedingung des vorangehenden (`sourceNodeId`) Punktes als erfüllt gilt.
    *   `"+"`: Bedingung erfüllt.
    *   `"-"`: Bedingung nicht erfüllt.
    *   `null` (oder Eigenschaft nicht vorhanden): Keine explizite Bewertung.
*   `probability` (Number, optional): Eine Zahl zwischen 0 und 1 (einschließlich), die den Grad der Sicherheit für diesen Argumentationsschritt ausdrückt. Wenn nicht vorhanden, kann ein Standardwert (z.B. 1.0) angenommen werden.

## Beispiel einer vollständigen Datei

```json
{
  "version": "1.0",
  "createdAt": "2023-10-27T12:34:56.789Z",
  "nodes": [
    {
      "id": "_node1",
      "title": "A. Anspruch entstanden",
      "text": "<p>Prüfung der Anspruchsentstehung.</p>",
      "x": 50,
      "y": 50,
      "type": "normal",
      "width": 200
    },
    {
      "id": "_node2",
      "title": "I. Vertragliche Einigung",
      "text": "<p>Liegt eine wirksame vertragliche Einigung vor?</p><ul><li>Angebot</li><li>Annahme</li></ul>",
      "x": 300,
      "y": 50,
      "type": "normal",
      "width": 220
    },
    {
      "id": "_node3",
      "title": "Ergebnis: Anspruch entstanden",
      "text": "<p>Der Anspruch ist dem Grunde nach entstanden.</p>",
      "x": 50,
      "y": 200,
      "type": "result-positive",
      "width": 200
    }
  ],
  "edges": [
    {
      "id": "_edge1",
      "sourceNodeId": "_node1",
      "targetNodeId": "_node2",
      "conditionMet": null,
      "probability": 1.0
    },
    {
      "id": "_edge2",
      "sourceNodeId": "_node2",
      "targetNodeId": "_node3",
      "conditionMet": "+",
      "probability": 0.95
    }
  ]
}
```

## Zukünftige Erweiterungen

Dieses Format ist darauf ausgelegt, erweiterbar zu sein. Zukünftige Versionen könnten zusätzliche Eigenschaften für Knoten, Kanten oder die globale Struktur einführen. Solche Änderungen würden durch eine Erhöhung der `version`-Nummer gekennzeichnet. Es wird empfohlen, dass Anwendungen, die dieses Format lesen, tolerant gegenüber unbekannten Eigenschaften sind und diese ignorieren, um die Vorwärtskompatibilität zu gewährleisten.
```
