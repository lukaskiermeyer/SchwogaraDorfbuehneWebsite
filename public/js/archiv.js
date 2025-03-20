function toggleGallery(button) {
    const details = button.parentElement.nextElementSibling.nextElementSibling;
    const carousel = button.parentElement.nextElementSibling;

    if (details.classList.contains("hidden")) {
        details.classList.remove("hidden");
        carousel.style.display = "none";  // Karussell ausblenden
        button.textContent = "▲";
    } else {
        details.classList.add("hidden");
        carousel.style.display = "flex";  // Karussell wieder anzeigen
        button.textContent = "▼";
    }
}

function scrollLeft(button) {
    const carousel = button.nextElementSibling.querySelector(".carousel");
    const itemWidth = carousel.firstElementChild.clientWidth + 10;
    carousel.style.transition = "transform 0.4s ease-in-out";
    carousel.style.transform = `translateX(${itemWidth}px)`;

    setTimeout(() => {
        carousel.appendChild(carousel.firstElementChild);
        carousel.style.transition = "none";
        carousel.style.transform = "translateX(0)";
    }, 400);
}

function scrollRight(button) {
    const carousel = button.previousElementSibling.querySelector(".carousel");
    const itemWidth = carousel.firstElementChild.clientWidth + 10;
    carousel.style.transition = "transform 0.4s ease-in-out";
    carousel.style.transform = `translateX(-${itemWidth}px)`;

    setTimeout(() => {
        carousel.prepend(carousel.lastElementChild);
        carousel.style.transition = "none";
        carousel.style.transform = "translateX(0)";
    }, 400);
}
