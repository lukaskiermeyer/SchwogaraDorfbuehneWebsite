// server.js
const express = require('express');
const app = express();
const path = require('path');
const {readdirSync} = require("fs");

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

// Statische Dateien bereitstellen
app.use('/kulturboten', express.static(path.join(__dirname, 'public/kulturboten')));

function getKulturboten() {
    const dir = path.join(__dirname, 'public/kulturboten');
    try {
        return readdirSync(dir)
            .filter(file => file.endsWith('.pdf'))
            .sort((a, b) => parseInt(b) - parseInt(a)); // Nach Nummer absteigend sortieren
    } catch (err) {
        console.error("Fehler beim Lesen des Verzeichnisses:", err);
        return [];
    }
}

app.get('/kulturbote', (req, res) => {
    const kulturboten = getKulturboten()
    res.render('kulturbote', {kulturboten});
});


app.get('/theater', (req, res) => {
    const theaterstuecke = [
        { id: 1, titel: "Hochstandsjoseph", vorschaubild: "Hochstandsjoseph.jpeg" },
        { id: 2, titel: "Alladin", vorschaubild: "Alladin.jpg" },
        { id: 3, titel: "Die Schöne und das Biest", vorschaubild: "DieSchöneunddasBiest.jpg",}
    ];
    res.render('theater', { theaterstuecke });
});


const theaterDetails = [
    {
        id: 1,
        titel: "Hochstandsjoseph",
        jahr: 2023,
        beschreibung: "Eine heitere Komödie über das Landleben.",
        bilder: ["Hochstandsjoseph.jpeg"]
    },
    {
        id: 2,
        titel: "Alladin",
        jahr: 2019,
        beschreibung: "Eine fantasievolle Geschichte über einen Bettler, der eine magische Wunderlampe findet.",
        bilder: ["Alladin.jpg"]
    },
    {
        id: 3,
        titel: "Die Schöne und das Biest",
        jahr: 2022,
        beschreibung: "Eine Geschichte über einen verzauberten Prinzen und eine wunderschöne Prinzessin.",
        bilder: ["DieSchöneunddasBiest.jpg"]
    }
];


// 🔹 Route für die Detailseite eines Theaterstücks
app.get('/theater/:id', (req, res) => {
    const theater = theaterDetails.find(t => t.id == req.params.id);

    if (!theater) {
        return res.status(404).send("Theaterstück nicht gefunden");
    }

    res.render('theaterdetails', { theater });
});

const jugendtheaterStuecke = [
    {
        id: 1,
        titel: "Das Verschwundene Zauberlicht",
        jahr: 2024,
        beschreibung: "Ein zauberhaftes Märchen über eine Prinzessin und einen verzauberten Frosch.",
        bilder: ["DasVerschwundeneZauberlicht.jpg"]
    },
    {
        id: 2,
        titel: "Der rote Mond",
        jahr: 2022,
        beschreibung: "Die magische Geschichte von Peter Pan und seinen Abenteuern in Nimmerland.",
        bilder: ["DerroteMond.jpg"]
    },
    {
        id: 3,
        titel: "Theater 2008",
        jahr: 2019,
        beschreibung: "Ein klassisches Märchen über eine Prinzessin, die in einen tiefen Schlaf fällt.",
        bilder: ["Theater2008.jpg"]
    },
    {
        id: 4,
        titel: "Theater 2007",
        jahr: 2019,
        beschreibung: "Ein klassisches Märchen über eine Prinzessin, die in einen tiefen Schlaf fällt.",
        bilder: ["Theater2007.jpg"]
    }
];

app.get('/jugendtheater', (req, res) => {

    res.render('jugendtheater', { jugendtheaterStuecke });
});

app.get('/jugendtheater/:id', (req, res) => {
    const theater = jugendtheaterStuecke.find(t => t.id == req.params.id);
    if (theater) {
        res.render('jugendtheaterdetails', { theater });
    } else {
        res.status(404).send("Kindertheaterstück nicht gefunden");
    }
});


// Array mit allen Starkbierfesten
const starkbierfeste = Array.from({ length: 2024 - 2003 }, (_, i) => {
    const jahr = 2003 + i;
    return {
        jahr,
        bild: `/starkbierbilder/${jahr}.jpg`,
        beschreibung: `Das Starkbierfest ${jahr} war ein voller Erfolg mit vielen Gästen und einer großartigen Stimmung.`
    };
}).filter(fest => fest.jahr !== 2021); // 2021 auslassen wegen Corona

// Route für die Übersichtsseite
app.get("/starkbierfest", (req, res) => {
    res.render("starkbierfest", { starkbierfeste });
});

// Route für die Detailseite eines Jahrgangs
app.get("/starkbierfest/:jahr", (req, res) => {
    const jahr = parseInt(req.params.jahr);
    const fest = starkbierfeste.find(f => f.jahr === jahr);

    if (!fest) {
        return res.status(404).send("Jahr nicht gefunden");
    }

    res.render("starkbierfestdetails", { fest });
})







// Weitere Routen für andere Seiten (Kartenvorverkauf, Verein, etc.) können hier hinzugefügt werden.

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
