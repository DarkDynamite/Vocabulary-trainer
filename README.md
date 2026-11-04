# 🏠 Vokabel-Trainer Englisch

Eine handyfreundliche Lern-Seite, um Englisch-Vokabeln spielerisch zu üben – geordnet nach Räumen
(Schlafzimmer, Badezimmer, Küche, Wohnzimmer). Reines HTML/CSS/JavaScript, ohne Installation, ohne Anmeldung.

## Modi

| Modus | Was passiert |
|---|---|
| 🃏 **Lernkarten** | Deutsches Wort sehen, Karte umdrehen, englisches Wort hören |
| 🇩🇪→🇬🇧 **Quiz Deutsch → Englisch** | Deutsches Wort, vier englische Wörter zur Auswahl |
| 🇬🇧→🇩🇪 **Quiz Englisch → Deutsch** | Englisches Wort (wird vorgelesen), vier deutsche Wörter zur Auswahl |
| 🔀 **Quiz gemischt** | Beide Richtungen durcheinander |
| ⌨️ **Schreiben** | Das englische Wort selbst eintippen (mit 💡 Tipp-Buchstaben) |

Jeder Modus geht pro Raum, über **🎲 Alles gemischt** (alle Räume) oder über
**💪 Schwierige Wörter** (nur Wörter, die schon einmal falsch waren und noch nicht sitzen).

## Belohnungen

- 🏆 **Punkte** für jede richtige Antwort, mit Bonus für 🔥 Serien
- ⭐ **1–3 Sterne** pro Runde, je nachdem wie viele Wörter beim ersten Versuch richtig waren
- 📒 **Sticker-Album**: alle 5 Sterne gibt es einen neuen Tier-Sticker
- 👑 **Kronen**: für jeden Raum, in dem alle Wörter gelernt sind
- 🐣 **Level** mit Titeln (Vokabel-Küken → … → Legende)
- 🔥 **Tage am Stück**, an denen geübt wurde
- Konfetti, Töne und viel Lob 🎉

Ein Wort gilt als **gelernt**, wenn es 3× hintereinander richtig beantwortet wurde. Falsche Wörter
kommen in derselben Runde nochmal dran und werden später bevorzugt abgefragt.

Der Fortschritt wird nur lokal im Browser des Handys gespeichert (`localStorage`).

## Auf dem Handy nutzen (GitHub Pages)

1. Auf GitHub im Repository: **Settings → Pages**
2. Bei *Source* „Deploy from a branch“ wählen, den Branch auswählen, Ordner `/ (root)`, **Save**
3. Nach ca. 1 Minute ist die Seite unter `https://<benutzername>.github.io/<repo-name>/` erreichbar
4. Auf dem Handy öffnen und **„Zum Home-Bildschirm hinzufügen“** – dann sieht es aus wie eine App
   und funktioniert auch offline.

Lokal testen: `python3 -m http.server` im Ordner starten und `http://localhost:8000` öffnen.

## Neue Vokabeln hinzufügen

Alle Wörter stehen in [`vocab.js`](vocab.js). Ein neuer Raum ist einfach ein weiterer Eintrag:

```js
{
  id: 'garden', name: 'Garten', title: 'In the garden', emoji: '🌳', color: '#2a9d8f',
  words: [
    ['tree', 'Baum', '🌳'],
    ['flower', 'Blume', '🌷'],
  ],
},
```

## Versionen

Die aktuelle Version steht unten in den ⚙️ Einstellungen. Bei Änderungen `APP_VERSION` in `app.js` erhöhen –
dadurch holen sich auch installierte Apps die neuen Dateien.

- **1.3.2** – Lernkarten geben jetzt auch bis zu 3 Sterne (vorher immer nur 1)
- **1.3.1** – Updates kommen zuverlässig an (kein veralteter Zwischenspeicher mehr), Knopf „Nach neuer Version suchen“
- **1.3.0** – Versionsnummer in den Einstellungen
- **1.2.0** – Vorlesen auf Deutsch und Englisch mit passender Stimme, Stimmenauswahl
- **1.1.0** – Sichtbares Feedback beim Antippen
- **1.0.0** – Erste Version
