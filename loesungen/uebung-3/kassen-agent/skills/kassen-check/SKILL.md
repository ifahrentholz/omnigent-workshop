---
name: kassen-check
description: Prüft den Code der Mini-Kasse auf die Hausregeln (Integer-Cent, Rundung, Tests). Verwenden, wenn nach einem Kassen-Check, einer Code-Prüfung der Kasse oder den Hausregeln gefragt wird.
---

# kassen-check

Prüfe die Mini-Kasse gegen unsere drei Hausregeln. Ändere dabei nichts.

1. **Integer-Cent:** Lies `kasse/pricing.py`. Alle Beträge müssen `int` in Cent sein.
   Suche nach `float(`, `/ 100` oder Kommazahlen-Literalen in Rechenwegen.
2. **Rundung:** Gerundet wird ausschließlich über `round_half_up_div`.
   Suche nach `round(` außerhalb dieser Funktion. Die ganzzahlige Teilung `//` in
   `format_eur` trennt nur Euro und Cent für die Anzeige – das ist erlaubt.
3. **Tests:** Führe `python3 -m unittest -q` aus und notiere das Ergebnis.

Antworte GENAU in diesem Format:

```
KASSEN-CHECK
Integer-Cent:  ✅ | ❌  <Beleg mit Datei:Zeile>
Rundung:       ✅ | ❌  <Beleg mit Datei:Zeile>
Tests:         ✅ | ❌  <Anzahl Tests, Ergebnis>
Fazit:         <ein Satz>
```
