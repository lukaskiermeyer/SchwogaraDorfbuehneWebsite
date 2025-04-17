// public/js/archiv.js

function toggleGallery(button) {
    // Finde das Elternelement '.bilderarchiv-event'
    const eventElement = button.closest('.bilderarchiv-event');
    if (!eventElement) return; // Element nicht gefunden, abbrechen

    // Finde das Detail-Element innerhalb des Event-Elements
    const detailsElement = eventElement.querySelector('.bilderarchiv-details');
    if (!detailsElement) return; // Element nicht gefunden, abbrechen

    // Toggle die 'active'-Klasse sowohl auf dem Event-Element (für den Pfeil)
    // als auch auf dem Detail-Element (für max-height Transition)
    eventElement.classList.toggle('active');
    detailsElement.classList.toggle('active');

    // Optional: Aria-Attribute für Barrierefreiheit aktualisieren
    const isExpanded = detailsElement.classList.contains('active');
    button.setAttribute('aria-expanded', isExpanded);
    detailsElement.setAttribute('aria-hidden', !isExpanded);
}

// --- Deine bestehenden Scroll-Funktionen ---
function bascrollLeft(button) {
    const wrapper = button.nextElementSibling; // .bilderarchiv-carousel-wrapper
    if (wrapper) {
        // Scrolle um einen Betrag nach links (z.B. 300 Pixel)
        wrapper.scrollBy({ left: -300, behavior: 'smooth' });
    }
}

function bascrollRight(button) {
    const wrapper = button.previousElementSibling; // .bilderarchiv-carousel-wrapper
    if (wrapper) {
        // Scrolle um einen Betrag nach rechts (z.B. 300 Pixel)
        wrapper.scrollBy({ left: 300, behavior: 'smooth' });
    }
}

// Optional: Initialisiere Aria-Attribute beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.bilderarchiv-details').forEach(details => {
        const isInitiallyHidden = !details.classList.contains('active'); // Oder prüfe auf .hidden, je nach initialem Zustand
        details.setAttribute('aria-hidden', isInitiallyHidden);
    });
    document.querySelectorAll('.bilderarchiv-toggle-button').forEach(button => {
        button.setAttribute('aria-expanded', 'false'); // Annahme: initial geschlossen
        // Optional: Fügen Sie hier dynamische IDs hinzu, wenn benötigt für aria-controls
    });
});