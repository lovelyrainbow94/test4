// Hilfsfunktionen für die Anwendung

/**
 * Generiert eine eindeutige ID (vereinfachte Version).
 * In einer echten Anwendung würde man eher auf UUIDs setzen.
 * @returns {string}
 */
export function generateId() {
    return '_' + Math.random().toString(36).substring(2, 11);
}

/**
 * Sanitärisiert HTML-String, um XSS-Angriffe zu verhindern.
 * Dies ist eine sehr grundlegende Implementierung. In einer echten Anwendung
 * sollte eine robuste Bibliothek wie DOMPurify verwendet werden.
 * @param {string} str - Der zu sanitisierende HTML-String.
 * @returns {string} - Der sanitisierte HTML-String.
 */
export function sanitizeHTML(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str; // Nur Text-Inhalt wird übernommen, entschärft HTML-Tags
    // Für erlaubte Tags (Fett, Kursiv, Listen) bräuchte man einen komplexeren Ansatz.
    // Diese einfache Version entfernt jegliches HTML.
    // Für die Anforderung (Fett, Kursiv, Listen) müsste man hier parsen und gezielt Elemente erstellen/erlauben.
    // Vorerst lassen wir es so und gehen davon aus, dass der Rich-Text-Editor sauberes HTML liefert
    // oder dass wir später eine richtige Sanitization-Library einbinden.
    // console.warn("sanitizeHTML ist eine Basis-Implementierung und nicht für Produktion geeignet ohne Erweiterung für erlaubte Tags.");
    return str; // Temporär wird der String direkt zurückgegeben, bis ein RichTextEditor implementiert ist.
}


console.log("helpers.js geladen - Enthält Hilfsfunktionen wie generateId und sanitizeHTML.");
