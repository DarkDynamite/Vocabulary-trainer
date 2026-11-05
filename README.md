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
- 📒 **Sticker-Album**: alle 5 Sterne gibt es einen neuen Tier-Sticker. Antippen → er sagt seinen
  englischen Namen. Einen Sticker als **Begleiter** wählen, der beim Üben mitjubelt, und im
  📖 **Stickeralbum** Seite für Seite bekleben (verschieben, größer/kleiner, drehen, blättern)
- 👑 **Kronen**: für jeden Raum, in dem alle Wörter gelernt sind
- 🐣 **Level** mit Titeln (Vokabel-Küken → … → Legende) – in den Einstellungen wählbar für Mädchen,
  Junge oder neutral
- 🔥 **Tage am Stück**, an denen geübt wurde
- Konfetti, Töne und viel Lob 🎉

Ein Wort gilt als **gelernt**, wenn es 3× hintereinander richtig beantwortet wurde (●●●). Lernkarten
bringen ein Wort bis ●●○, den letzten Punkt gibt es im Quiz oder beim Schreiben. Falsche Wörter
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

- **1.7.0** – 📖 Stickeralbum mit mehreren Seiten statt einem einzelnen Bild: blättern (◀ ▶ oder wischen), neue Seiten anlegen, Seitenübersicht; das bisherige Bild wird Seite 1. Die Sammlung heißt jetzt „📒 Meine Sticker“
- **1.6.0** – Einstellung „Titel für“: Mädchen, Junge oder neutral (z. B. Wort-Zauberin / Wort-Zauberer / Zauber-Talent)
- **1.5.1** – Beim Scrollen werden Knöpfe nicht mehr eingedrückt und es vibriert nicht mehr (nur noch bei echtem Antippen)
- **1.5.0** – Sticker zum Spielen: im Album antippen → Sticker sagt seinen englischen Namen; Begleiter wählen, der beim Üben mitjubelt; 🎨 Sticker-Bild gestalten (Wiese, Meer, Weltraum, Zimmer)
- **1.4.1** – Fehler aus dem Praxistest behoben: Quizfrage tauchte nach schnellem Verlassen auf anderen Seiten auf, Zurück-Taste blieb hängen, „Fehler üben“ verfälschte Sterne/Bestwert (Übungsrunden geben jetzt Punkte, aber keine Sterne), doppeltes Enter übersprang die Lösung, Buchstabenkästchen brachen mitten im Wort um, falsche Tage-Anzeige in den Einstellungen, kein Neuladen auf der Ergebnis-Seite, Lernkarten-Knöpfe waren schon vor dem Umdrehen sichtbar, Punkt am Wortende („bed.“) wird akzeptiert, Zurücksetzen löscht auch das letzte Rundenergebnis
- **1.4.0** – Lernfortschritt sichtbar: Fortschrittsbalken zählt jeden Lernpunkt, „angefangen“-Anzeige, Lernkarten zählen mit (bis ●●○), Ergebnis zeigt „Wörter weitergekommen“
- **1.3.2** – Lernkarten geben jetzt auch bis zu 3 Sterne (vorher immer nur 1)
- **1.3.1** – Updates kommen zuverlässig an (kein veralteter Zwischenspeicher mehr), Knopf „Nach neuer Version suchen“
- **1.3.0** – Versionsnummer in den Einstellungen
- **1.2.0** – Vorlesen auf Deutsch und Englisch mit passender Stimme, Stimmenauswahl
- **1.1.0** – Sichtbares Feedback beim Antippen
- **1.0.0** – Erste Version
