document.addEventListener("DOMContentLoaded", function () {
    let slides = document.querySelectorAll(".carousel-slide");
    let currentIndex = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = i === index ? "block" : "none";
        });
    }

    document.querySelector(".carousel-prev").addEventListener("click", function () {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(currentIndex);
    });

    document.querySelector(".carousel-next").addEventListener("click", function () {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
    });

    showSlide(currentIndex); // Zeige erstes Bild beim Laden
});
