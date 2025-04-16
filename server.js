const express = require("express");
const axios = require("axios");
const path = require("path");
const child_process = require("child_process");
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
    res.render("index", { vorstandschaft});
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
    res.render("verein", {antrag, satzung, url: ""});
});



// Kulturboten
app.get("/kulturbote", async (req, res) => {
    const kulturboten = await fetchStrapiData("kulturbotes");
    res.render("kulturbote", { kulturboten, url: "" });
});

// Theater
app.get("/theater", async (req, res) => {
    try {
        const sort = req.query.sort || "year";
        const order = req.query.order || "desc";

        let theaterstuecke = await fetchStrapiData("theaterstuecke") || [];

        // Zufälliges Bild aus der Bilderliste extrahieren
        theaterstuecke.forEach(stueck => {
            if (stueck.Bilder && stueck.Bilder.length > 0) {
                const randomIndex = Math.floor(Math.random() * stueck.Bilder.length);
                stueck.randomBild = stueck.Bilder[randomIndex].url;
            } else {
                stueck.randomBild = null;
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

    if (!theater) {
        return res.status(404).send("Theaterstück nicht gefunden");
    }

    res.render("theaterdetails", { theater, url: "" });
});


// Jugendtheater
app.get("/jugendtheater", async (req, res) => {
    try {
        const sort = req.query.sort || "year";
        const order = req.query.order || "desc";

        let jugendtheaterStuecke = await fetchStrapiData("jugendtheaterstuecke") || [];

        // Zufälliges Bild aus der Bilderliste extrahieren
        jugendtheaterStuecke.forEach(stueck => {
            if (stueck.Bilder && stueck.Bilder.length > 0) {
                const randomIndex = Math.floor(Math.random() * stueck.Bilder.length);
                stueck.randomBild = stueck.Bilder[randomIndex].url;
            } else {
                stueck.randomBild = null;
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

        res.render("jugendtheater", { jugendtheaterStuecke, url: "", sort, order });
    } catch (error) {
        console.error("Fehler beim Abrufen der Theaterstücke:", error);
        res.render("jugendtheater", { jugendtheaterStuecke: [], url: "", sort: "", order: "" });
    }
});

app.get("/jugendtheater/:id", async (req, res) => {
    const theaterstuecke = await fetchStrapiData(`jugendtheaterstuecke`) ||[];
    const theater = theaterstuecke.find(t => t.id === parseInt(req.params.id)); // Das spezifische Theaterstück nach ID finden

    if (!theater) return res.status(404).send("Jugendtheaterstück nicht gefunden");

    console.log(process.env.STRAPI_URL+theater.Bilder[0].url)
    res.render("jugendtheaterdetails", { theater, url: "" });

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

    res.render("starkbierfestdetails", {fest, url: "" });
});

// Bilderarchiv
app.get("/bilderarchiv", async (req, res) => {
    const archiv = await fetchStrapiData("bilderarchivs") || [];
    res.render("archiv", { archiv, url: "" });
});

// Weitere statische Seiten
app.get("/links", (req, res) => res.render("links"));
app.get("/impressum", (req, res) => res.render("impressum"));
app.get("/datenschutz", (req, res) => res.render("datenschutz"));

// Server starten
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});