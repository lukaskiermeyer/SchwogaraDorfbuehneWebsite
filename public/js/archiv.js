// Aus- und Einklappen der Galerie
function toggleGallery(button) {
    // Finde den übergeordneten .bilderarchiv-event-Container
    const eventContainer = button.closest(".bilderarchiv-event");

    // In diesem Container: Hol dir das Karussell und die Detailansicht
    const carousel = eventContainer.querySelector(".bilderarchiv-carousel-container");
    const details = eventContainer.querySelector(".bilderarchiv-details");

    // Prüfen, ob Details aktuell versteckt sind (display: none oder leer)
    const isHidden = !details.style.display || details.style.display === "none";

    if (isHidden) {
        // Details einblenden, Karussell ausblenden
        details.style.display = "block";
        carousel.style.display = "none";
        button.textContent = "▲"; // Icon anpassen
    } else {
        // Details ausblenden, Karussell wieder anzeigen
        details.style.display = "none";
        carousel.style.display = "flex";
        button.textContent = "▼"; // Icon zurücksetzen
    }
}

function bascrollLeft(button) {
    const eventContainer = button.closest(".bilderarchiv-event");
    const carousel = eventContainer.querySelector(".bilderarchiv-carousel");
    const items = carousel.querySelectorAll(".bilderarchiv-carousel-item");

    // Letztes Element sofort an den Anfang schieben
    carousel.insertBefore(items[items.length - 1], items[0]);

    // Vor Animation: kurz transform = '-Breite' → Dann auf 0
    carousel.style.transition = "none";
    carousel.style.transform = "translateX(-160px)"; // 160px: Breite + gap
    requestAnimationFrame(() => {
        carousel.style.transition = "transform 0.4s ease-in-out";
        carousel.style.transform = "translateX(0)";
    });
}


function bascrollRight(button) {
    console.log("RRR");
    const eventContainer = button.closest(".bilderarchiv-event");
    const carousel = eventContainer.querySelector(".bilderarchiv-carousel");
    const items = carousel.querySelectorAll(".bilderarchiv-carousel-item");

    // Slide nach links: transform -160px
    carousel.style.transition = "transform 0.4s ease-in-out";
    carousel.style.transform = "translateX(-160px)";

    // Nach der Animation: Erstes Element ans Ende verschieben
    setTimeout(() => {
        carousel.style.transition = "none";
        carousel.appendChild(items[0]);
        carousel.style.transform = "translateX(0)";
    }, 400);
}
