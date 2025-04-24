// public/js/index-client.js
document.addEventListener('DOMContentLoaded', () => {
    const loadingIndicator = document.getElementById('vorstandschaftLoading');
    const container = document.getElementById('vorstandschaftContainer');

    if (!loadingIndicator || !container) {
        console.error('Benötigte Elemente für Vorstandschaft nicht gefunden!');
        return;
    }

    // Zeige Ladeanzeige an
    loadingIndicator.style.display = 'block';
    container.innerHTML = ''; // Leere den Container vorsichtshalber

    // Rufe den neuen API-Endpunkt auf dem Server auf
    fetch('/api/vorstandschaft')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Netzwerkantwort war nicht ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(vorstandschaft => {
            loadingIndicator.style.display = 'none'; // Ladeanzeige ausblenden

            if (vorstandschaft && Array.isArray(vorstandschaft) && vorstandschaft.length > 0) {
                // Baue das HTML für die Team-Mitglieder dynamisch auf

                vorstandschaft.forEach(mitglied => {
                    const memberDiv = document.createElement('div');
                    memberDiv.classList.add('team-member');

                    const img = document.createElement('img');
                    // Prüfe, ob Bilddaten und URL vorhanden sind (typische Strapi v4 Struktur)

                    const imageUrl = mitglied.Bild?.url || '/images/placeholder.png'; // Fallback-Bild
                    img.src = imageUrl;

                    const nameHeader = document.createElement('h3');
                    nameHeader.textContent = mitglied.Name || 'Unbekannt';

                    const positionPara = document.createElement('p');
                    positionPara.textContent = mitglied.Position || 'Keine Angabe';

                    memberDiv.appendChild(img);
                    memberDiv.appendChild(nameHeader);
                    memberDiv.appendChild(positionPara);
                    container.appendChild(memberDiv);
                });
            } else {
                // Zeige eine Meldung an, wenn keine Daten gefunden wurden
                container.innerHTML = '<p>Aktuell keine Daten zur Vorstandschaft verfügbar.</p>';
            }
        })
        .catch(error => {
            console.error('Fehler beim Laden der Vorstandschaft:', error);
            loadingIndicator.style.display = 'none'; // Ladeanzeige ausblenden
            container.innerHTML = '<p style="color: red;">Fehler beim Laden der Vorstandschaftsdaten.</p>';
        });
});