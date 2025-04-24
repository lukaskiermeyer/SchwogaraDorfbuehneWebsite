const express = require("express");
const axios = require("axios");
const path = require("path");
const { marked } = require('marked');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_TOKEN;

// Pug als Template Engine setzen
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Funktion zum Abrufen von Strapi-Daten
async function fetchStrapiData(endpoint) {
    try {
        const response = await axios.get(`${STRAPI_URL}/api/${endpoint}?populate=*&pagination[limit]=1000`, {
            headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
        });
        return response.data.data;
    } catch (error) {
        console.error(`Fehler beim Abrufen von ${endpoint}:`, error.message);
        return null;
    }
}


// Startseite
app.get("/", async (req, res) => {
    const vorstandschaft = await fetchStrapiData("vorstandschafts") || [];

    res.render("index", { });
});

app.get("/api/vorstandschaft", async (req, res) => {
    try {
        const vorstandschaftData = await fetchStrapiData("vorstandschafts"); // API Endpunkt ohne /api/ Präfix
        if (vorstandschaftData === null) {
            // Wenn fetchStrapiData null zurückgab (Fehler wurde schon geloggt)
            return res.status(500).json({ error: "Failed to fetch data from Strapi" });
        }
        res.json(vorstandschaftData); // Sende die Daten als JSON
    } catch (error) {
        // Zusätzliches Error Handling, falls die Funktion selbst einen Fehler wirft
        console.error("Fehler im API Endpunkt /api/vorstandschaft:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Termine
app.get("/termine", async (req, res) => {
    const termine = await fetchStrapiData("termins") || []; // Standardwert auf leeres Array setzen
    console.log(termine);
    res.render("termine", { termine });
});


// Kartenvorverkauf
app.get("/karten", async(req, res) => {
    const karten = await fetchStrapiData("kartenverkaufs");
    console.log(karten);
    res.render("kartenverkauf", {karten});
});

// Verein
app.get("/verein", async(req, res) => {
    const antrag = await fetchStrapiData("mitgliedsantrag");
    const satzung = await fetchStrapiData("satzung");
    const gruppenFoto = await fetchStrapiData("Vorstandschaftsfoto");
    const geschichteData = await fetchStrapiData("Unsere-Geschichte");
    let geschichteHtml = '<p>Geschichte konnte nicht geladen werden.</p>'; // Fallback-HTML


    if (geschichteData && geschichteData.Geschichte) {
        const markdownContent = geschichteData.Geschichte;
        geschichteHtml = marked.parse(markdownContent); // Wandle Markdown in HTML um
    } else {
        console.warn("Markdown-Inhalt nicht gefunden in Strapi-Antwort.");
    }

    res.render("verein", {antrag, satzung, gruppenFoto,geschichteHtml});
});



// Kulturboten
app.get("/kulturbote", async (req, res) => {
    const kulturboten = await fetchStrapiData("kulturbotes");

    kulturboten.sort((a, b) => {
        const nummerA = a.Nummer;
        const nummerB = b.Nummer;


        if (typeof nummerA !== 'number' && typeof nummerB !== 'number') return 0; // Beide nicht vorhanden/gültig -> gleich
        if (typeof nummerA !== 'number') return 1; // Nur A nicht vorhanden/gültig -> A nach hinten
        if (typeof nummerB !== 'number') return -1; // Nur B nicht vorhanden/gültig -> B nach hinten

        return nummerA - nummerB;
    });

    res.render("kulturbote", { kulturboten});
});

// Theater
app.get("/theater", async (req, res) => {
    try {
        const sort = req.query.sort || "year";
        const order = req.query.order || "desc";

        let theaterstuecke = await fetchStrapiData("theaterstuecke") || [];

        // Zufälliges Bild aus der Bilderliste extrahieren
        theaterstuecke.forEach(stueck => {

            if(stueck.Titelbild){
                stueck.randomBild = stueck.Titelbild;
            }
            else{
                if (stueck.Bilder && stueck.Bilder.length > 0) {
                    const randomIndex = Math.floor(Math.random() * stueck.Bilder.length);
                    stueck.randomBild = stueck.Bilder[randomIndex].url;
                } else {
                    stueck.randomBild = null;
                }
            }
        });

        // Serverseitige Sortierung: Sortierung nach Titel oder Jahr
        if (sort === "title") {
            theaterstuecke.sort((a, b) => {
                // Sicherheitscheck: Umwandlung in Kleinbuchstaben für konsistente Sortierung
                const titleA = a.Titel ? a.Titel.toLowerCase() : "";
                const titleB = b.Titel ? b.Titel.toLowerCase() : "";
                return order === "desc"
                    ? titleB.localeCompare(titleA)
                    : titleA.localeCompare(titleB);
            });
        } else if (sort === "year") {
            theaterstuecke.sort((a, b) => {
                return order === "desc"
                    ? b.Jahr - a.Jahr
                    : a.Jahr - b.Jahr;
            });
        }

        res.render("theater", { theaterstuecke, url: "", sort, order });
    } catch (error) {
        console.error("Fehler beim Abrufen der Theaterstücke:", error);
        res.render("theater", { theaterstuecke: [], url: "", sort: "", order: "" });
    }
});






app.get("/theater/:id", async (req, res) => {
    const theaterstuecke = await fetchStrapiData("theaterstuecke"); // Alle Theaterstücke abrufen
    const theater = theaterstuecke.find(t => t.id === parseInt(req.params.id)); // Das spezifische Theaterstück nach ID finden
    console.log(theater);
    if (!theater) {
        return res.status(404).send("Theaterstück nicht gefunden");
    }

    const beschreibung = theater.Beschreibung;



    if (beschreibung) {

        beschreibungHtml = marked.parse(beschreibung); // Wandle Markdown in HTML um

    } else {
        console.warn("Impressum Markdown-Inhalt nicht gefunden in Strapi-Antwort.");
    }

    console.log(beschreibungHtml);

    res.render("theaterdetails", { theater, beschreibungHtml });
});


// Jugendtheater
app.get("/jugendtheater", async (req, res) => {
    try {
        const sort = req.query.sort || "year";
        const order = req.query.order || "desc";

        let jugendtheaterStuecke = await fetchStrapiData("jugendtheaterstuecke") || [];

        // Zufälliges Bild aus der Bilderliste extrahieren
        jugendtheaterStuecke.forEach(stueck => {

                if(stueck.Titelbild){
                    console.log(stueck.Titelbild);
                    stueck.randomBild = stueck.Titelbild.url;
                }
                else{
                    if (stueck.Bilder && stueck.Bilder.length > 0) {
                        const randomIndex = Math.floor(Math.random() * stueck.Bilder.length);
                        stueck.randomBild = stueck.Bilder[randomIndex].url;
                    } else {
                        stueck.randomBild = null;
                    }
                }

        });
        // Serverseitige Sortierung: Sortierung nach Titel oder Jahr
        if (sort === "title") {
            jugendtheaterStuecke.sort((a, b) => {
                // Sicherheitscheck: Umwandlung in Kleinbuchstaben für konsistente Sortierung
                const titleA = a.Titel ? a.Titel.toLowerCase() : "";
                const titleB = b.Titel ? b.Titel.toLowerCase() : "";
                return order === "desc"
                    ? titleB.localeCompare(titleA)
                    : titleA.localeCompare(titleB);
            });
        } else if (sort === "year") {
            jugendtheaterStuecke.sort((a, b) => {
                return order === "desc"
                    ? b.Jahr - a.Jahr
                    : a.Jahr - b.Jahr;
            });
        }

        res.render("jugendtheater", { jugendtheaterStuecke, sort, order });
    } catch (error) {
        console.error("Fehler beim Abrufen der Theaterstücke:", error);
        res.render("jugendtheater", { jugendtheaterStuecke: [], sort: "", order: "" });
    }
});

app.get("/jugendtheater/:id", async (req, res) => {
    const theaterstuecke = await fetchStrapiData(`jugendtheaterstuecke`) ||[];
    const theater = theaterstuecke.find(t => t.id === parseInt(req.params.id)); // Das spezifische Theaterstück nach ID finden

    const beschreibung = theater.Beschreibung;

    let beschreibungHtml = null;

    if (beschreibung) {

        beschreibungHtml = marked.parse(beschreibung); // Wandle Markdown in HTML um

    } else {
        console.warn("Impressum Markdown-Inhalt nicht gefunden in Strapi-Antwort.");
    }

    res.render("jugendtheaterdetails", {theater, beschreibungHtml});

});

// Starkbierfest
app.get("/starkbierfest", async (req, res) => {
    try {
        const sort = req.query.sort || "year"
        const order = req.query.order ||"desc"
        let starkbierfeste = await fetchStrapiData("starbierfeste") || []; //leider Rechtschreibfehler in API

        // Zufälliges Bild aus der Bilderliste extrahieren
        starkbierfeste.forEach(fest => {
            if (fest.Bilder && fest.Bilder.length > 0) {
                const randomIndex = Math.floor(Math.random() * fest.Bilder.length);
                fest.randomBild = fest.Bilder[randomIndex].url;
            } else {
                fest.randomBild = null;
            }
        });

        // Serverseitige Sortierung: Sortierung nach Titel oder Jahr
         if (sort === "year") {
            starkbierfeste.sort((a, b) => {
                return order === "desc"
                    ? b.Jahr - a.Jahr
                    : a.Jahr - b.Jahr;
            });
        }

        res.render("starkbierfest", { starkbierfeste, url: "", sort, order });
    } catch (error) {
        console.error("Fehler beim Abrufen der Theaterstücke:", error);
        res.render("starkbierfest", { starkbierfeste: [], url: "", sort: "", order: "" });
    }
});

app.get("/starkbierfest/:jahr", async (req, res) => {
    const starkbierfeste = await fetchStrapiData("starbierfeste") || [];
    const fest = starkbierfeste.find(t => t.Jahr === parseInt(req.params.jahr)); // Das spezifische Theaterstück nach ID finden

    if(!fest) return res.status(404).send("Starkbierfest nicht gefunden");


    const beschreibung = fest.Beschreibung;

    let beschreibungHtml = null;

    if (beschreibung) {

        beschreibungHtml = marked.parse(beschreibung);

    } else {
        console.warn("Impressum Markdown-Inhalt nicht gefunden in Strapi-Antwort.");
    }



    res.render("starkbierfestdetails", {fest, beschreibungHtml});
});

// Bilderarchiv
app.get("/bilderarchiv", async (req, res) => {
    const archiv = await fetchStrapiData("bilderarchivs") || [];
    res.render("archiv", { archiv, url: "" });
});

app.get("/impressum", async (req, res, next) => { // Füge 'next' für Error Handling hinzu
    try {
        const impressumData = await fetchStrapiData("impressum"); // Hole die Daten

        let impressumHtml = '<p>Impressum konnte nicht geladen werden.</p>'; // Fallback-HTML


        if (impressumData && impressumData.Impressum) {
            const markdownContent = impressumData.Impressum;
            impressumHtml = marked.parse(markdownContent); // Wandle Markdown in HTML um
        } else {
            console.warn("Impressum Markdown-Inhalt nicht gefunden in Strapi-Antwort.");
        }

        // Übergebe das generierte HTML an das Template
        res.render("impressum", {
               impressumHtml: impressumHtml // Das HTML an Pug übergeben
        });

    } catch (error) {
        console.error("Fehler in /impressum Route:", error);
        next(error); // Leite Fehler an Express Error Handler weiter
    }
});

app.get("/datenschutz", async (req, res, next) => { // Füge 'next' für Error Handling hinzu
    try {
        const datenschutzData = await fetchStrapiData("datenschutz");

        let datenschutzHtml = '<p>Datenschutzerklärung konnte nicht geladen werden.</p>'; // Fallback-HTML

        if (datenschutzData && datenschutzData.Datenschutz) {
            const markdownContent = datenschutzData.Datenschutz;


            datenschutzHtml = marked.parse(markdownContent); // Wandle Markdown in HTML um

        } else {
            console.warn("Datenschutz Markdown-Inhalt nicht gefunden in Strapi-Antwort.");
        }

        // Übergebe das generierte HTML an das Template 'datenschutz.pug'
        res.render("datenschutz", { // Sicherstellen, dass das richtige Template gerendert wird
            title: "Datenschutzerklärung", // Optional: Titel
            datenschutzHtml: datenschutzHtml // Das HTML an Pug übergeben
        });

    } catch (error) {
        console.error("Fehler in /datenschutz Route:", error);
        next(error); // Leite Fehler an Express Error Handler weiter
    }
});


app.get("/links", async (req, res) =>{
    const links = await fetchStrapiData("linkss");
    res.render("links", {links});
})

// Server starten
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});