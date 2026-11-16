# KASSE-42: Rabattcodes im Warenkorb

**Als** Shop-Betreiber **moechte ich** Rabattcodes anbieten, **damit** wir Aktionen fahren koennen.

## Anforderungen

`cart_total(items, code=None)` bekommt einen optionalen Rabattcode.

| Code | Wirkung |
|---|---|
| `WORKSHOP10` | 10 % Rabatt auf jede Position (auf den Netto-Betrag, vor MwSt.) |
| `FIX500` | 5,00 EUR Abzug von der Netto-Summe |

## Akzeptanzkriterien

1. Codes sind case-insensitive (`workshop10` funktioniert).
2. Unbekannter Code -> `ValueError` mit verstaendlicher Meldung.
3. Rabatte werden **vor** der MwSt. abgezogen; die MwSt. wird auf den rabattierten Netto-Betrag berechnet.
4. `FIX500` wird anteilig (nach Netto-Anteil) auf die MwSt.-Saetze verteilt. Ein Rest-Cent aus der Aufteilung landet beim Satz mit dem groessten Netto-Anteil.
5. Die Netto-Summe faellt nie unter 0 (Warenkorb fuer 3,00 EUR + `FIX500` = 0,00 EUR).
6. `Total` bekommt ein Feld `discount_cents` (Netto-Rabatt, Default 0).
7. Alles in Integer-Cent, kaufmaennisch gerundet (`round_half_up_div`).
8. Bestehende Tests bleiben gruen; neue Tests decken jedes Kriterium ab.

Tests: `python3 -m unittest -v`
