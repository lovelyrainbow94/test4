// Datenmodelle für Knoten und Kanten

/**
 * Repräsentiert einen Prüfungspunkt (Knoten) im Gutachten.
 */
export class LegalNode {
    constructor(id, title = "Neuer Punkt", text = "<p>Beginnen Sie hier mit Ihrer Argumentation...</p>", x = 50, y = 50, type = "normal") {
        this.id = id; // Eindeutige ID
        this.title = title; // Titel des Prüfungspunkts
        this.text = text; // Detaillierte juristische Argumentation (HTML für Formatierung)
        this.x = x; // X-Position auf der Arbeitsfläche (linke obere Ecke des Knotens)
        this.y = y; // Y-Position auf der Arbeitsfläche (linke obere Ecke des Knotens)
        this.type = type; // "normal", "result-positive", "result-negative", "result-partial"
        this.width = 200; // Standardbreite
        this.height = 'auto'; // Höhe passt sich dem Inhalt an, oder wird später berechnet
    }
}

/**
 * Repräsentiert eine Verbindungslinie (Kante) zwischen zwei Prüfungspunkten.
 */
export class LegalEdge {
    constructor(id, sourceNodeId, targetNodeId, conditionMet = null, probability = 1.0) {
        this.id = id; // Eindeutige ID
        this.sourceNodeId = sourceNodeId; // ID des Quellknotens
        this.targetNodeId = targetNodeId; // ID des Zielknotens
        // Spezifische Verbindungspunkte an den Knoten könnten hier definiert werden (z.B. 'top', 'bottom', 'left', 'right')
        // this.sourceHandle = 'bottom';
        // this.targetHandle = 'top';
        this.conditionMet = conditionMet; // "+", "-", oder null (keine Angabe)
        this.probability = probability; // Wahrscheinlichkeit (0-1)
    }
}

console.log("dataModels.js geladen - Enthält Klassen für LegalNode und LegalEdge.");
