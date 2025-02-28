// server.js
const express = require('express');
const app = express();
const path = require('path');

// Pug als Template Engine setzen
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Statische Dateien (CSS, JS, Bilder) aus dem "public"-Ordner bereitstellen
app.use(express.static(path.join(__dirname, 'public')));

// Beispiel-Routen
app.get('/', (req, res) => {
    res.render('index', { title: 'Schwoagara Dorfbühne' });
});

app.get("/termine", (req, res) => {
    const termine = [
        { titel: "Theaterstück 'Der Brandner Kaspar'", datum: "2024-04-15", ort: "Dorfsaal", beschreibung: "Ein humorvolles Schauspiel über das Leben und den Tod." },
        { titel: "Starkbierfest 2024", datum: "2024-05-10", ort: "Biergarten", beschreibung: "Traditionelles Starkbierfest mit Musik & guter Stimmung!" },
        { titel: "Jugendtheater Premiere", datum: "2024-06-01", ort: "Jugendbühne", beschreibung: "Unsere Nachwuchsschauspieler präsentieren ihr neues Stück!" }
    ];

    const formatierteTermine = termine.map(termin => ({
        ...termin,
        datum: formatDate(termin.datum)
    }));


    res.render("termine", { termine: formatierteTermine });
});

function formatDate(dateStr) {
    const datum = new Date(dateStr);
    return datum.getDate() + ". " + (datum.getMonth() + 1) + ". " + datum.getFullYear();
}


app.get('/karten', (req, res) => {
    // Beispiel für ein Event-Array
    const events = [
        {
            titel: "Theaterstück A",
            datum: "15. März 2025",
            ort: "Kulturhaus Schwoagara",
            beschreibung: "Ein spannendes Drama über ...",
            ticketsOnline: true,
            ticketLink: "https://www.okticket.de/event-a"
        },
        {
            titel: "Theaterstück B",
            datum: "22. März 2025",
            ort: "Schwoagara Dorfhalle",
            beschreibung: "Komödie über ...",
            ticketsOnline: false
        }
    ];


    res.render('kartenverkauf', {events: events});
});


app.get('/verein', (req, res) => {
    res.render('verein');
});


// Weitere Routen für andere Seiten (Kartenvorverkauf, Verein, etc.) können hier hinzugefügt werden.

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
