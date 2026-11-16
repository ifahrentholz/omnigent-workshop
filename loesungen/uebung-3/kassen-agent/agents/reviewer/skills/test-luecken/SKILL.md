---
name: test-luecken
description: Findet fehlende Testfälle für die Mini-Kasse. Verwenden, wenn nach Testlücken, fehlenden Tests oder einem Review der Tests gefragt wird.
---

# test-luecken

1. Lies `kasse/pricing.py` und `tests/test_pricing.py`.
2. Liste jede öffentliche Funktion auf und prüfe, welche Randfälle getestet sind.
3. Achte besonders auf: Menge 0, Preis 0, sehr große Beträge, unbekannter
   MwSt.-Satz, Rundung genau auf ,5 Cent, leerer Warenkorb.

Antworte GENAU in diesem Format (höchstens 5 Lücken, wichtigste zuerst):

```
TEST-LÜCKEN
1. <Funktion>: <fehlender Fall> – <warum wichtig>
2. ...
Empfehlung: <ein Satz>
```
