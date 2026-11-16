# Omnigent Workshop – Übungen

[🇬🇧 English](README.md) · 🇩🇪 Deutsch

```bash
git clone https://github.com/ifahrentholz/omnigent-workshop.git
cd omnigent-workshop
```

Drei Übungen, ca. 50 Minuten. Du arbeitest mit deinem eigenen **Claude-Code-** oder **Codex-Abo**
an **Agent Supply**, einem kleinen Demo-Shop im Browser – jede Änderung deines Agents siehst du dort
sofort. Wo `claude` steht, geht auch `codex`. Code und Beispiele im Repo sind auf Englisch.

| Übung | Was du am Ende hast | Zeit |
|---|---|---|
| 1 | Omnigent läuft; dein Agent ändert den Shop – aus dem Terminal **und** aus dem Browser | 25 Min |
| 2 | Ein eigener Agent in YAML mit **eigenem Skill** – unabhängig von deinen globalen Skills | 25 Min |
| 3 | Bonus: Sub-Agent mit eigenem Skill, Policy, zweiter Anbieter | für Schnelle |

```
omnigent-workshop/
├── demo-app/                       ← der Shop – hier arbeitest du
│   ├── server.js                   ← node server.js → http://localhost:3000
│   ├── public/                     ← index.html, app.js, cart.js, style.css
│   ├── data/products.json          ← Mock-Produkte
│   ├── tests/                      ← node --test
│   └── shop-agent/                 ← Übung 2: dein Agent (Starter mit TODOs)
└── solutions/                      ← zum Spicken oder Aufholen
    ├── exercise-2/shop-agent/
    └── exercise-3/shop-agent/
```

---

## Übung 1 – Omnigent einrichten (25 Min)

### 1.1 Voraussetzungen prüfen

```bash
git --version
node --version           # 22 oder neuer – für den Shop und Omnigents Agent-CLIs
tmux -V                  # macOS: brew install tmux · Ubuntu: sudo apt install tmux
claude --version         # und/oder: codex --version
```

Dein `claude` bzw. `codex` muss **eingeloggt** sein: einmal `claude` starten und `/login` – bzw. `codex login`.

### 1.2 Omnigent installieren

```bash
curl -fsSL https://omnigent.ai/install.sh | sh
```

Danach ein **neues Terminal** öffnen und prüfen:

```bash
omni --version
```

`omni` und `omnigent` sind derselbe Befehl.

### 1.3 Den Shop starten

In **Terminal 1**:

```bash
cd omnigent-workshop/demo-app
node server.js
```

Öffne **http://localhost:3000** – das ist Agent Supply. Lass das Terminal laufen: Der Shop
**lädt sich selbst neu**, sobald sich eine Datei ändert.

### 1.4 Dein Agent als Omnigent-Session

In **Terminal 2**:

```bash
cd omnigent-workshop/demo-app
omni claude              # oder: omni codex
```

Beim ersten Start fragt Omnigent ggf. nach deinem Anbieter – wähle dein Abo.

1. Schreib im Terminal: *„Zeig bei Produkten mit Bestand 0 ein ‚Sold out‘-Badge und deaktiviere ihren ‚Add to cart‘-Button.“*
   Schau in den Shop: Die „Sandbox cap“ ist jetzt ausverkauft.
2. Öffne **http://localhost:6767** in einem zweiten Browser-Tab – dort ist **dieselbe Session**.
3. Schreib in diesem Tab: *„Füg im Header einen Dark-Mode-Schalter hinzu.“* – die Antwort erscheint
   auch im Terminal, und der Shop bekommt einen Dark Mode.

✅ **Geschafft, wenn:** eine Änderung, die du im Browser beauftragt hast, im Shop zu sehen ist.

Den ursprünglichen Shop zurück? `git restore .` im Ordner `demo-app/`.

### Wenn es hakt

| Problem | Lösung |
|---|---|
| `tmux` fehlt | `brew install tmux` bzw. `sudo apt install tmux` |
| Linux: Terminal startet nicht (bwrap) | `sudo apt install bubblewrap` |
| „Not logged in“ | `claude` starten → `/login` bzw. `codex login` |
| Port 3000 ist belegt | `PORT=4000 node server.js` und http://localhost:4000 öffnen |
| Windows | `omni claude` geht dort nicht. Nimm `omnigent run --harness claude-sdk` (oder `--harness codex`) – Übung 2 funktioniert normal |
| `omni` nicht gefunden | neues Terminal öffnen; sonst `~/.local/bin` in den `PATH` |
| Installer bricht bei der Databricks-CLI ab oder lädt sehr lange | ohne Databricks installieren: `curl -fsSL https://omnigent.ai/install.sh \| sh -s -- --no-databricks` |

---

## Übung 2 – Eigener Agent mit eigenem Skill (25 Min)

**Die Idee:** Ein Agent ist ein Ordner. Seine Skills liegen **im selben Ordner** – nicht im globalen
`~/.claude/skills`. Damit sind Agent und Skills zusammen versioniert, teilbar und unabhängig davon,
was auf deinem Rechner sonst installiert ist.

```
shop-agent/
├── config.yaml                    ← Prompt, Harness, Rechte
└── skills/
    └── add-product/SKILL.md       ← wird automatisch gefunden
```

Alle Befehle im Ordner `demo-app/` – und der Shop läuft weiter in Terminal 1.

### 2.1 Harness wählen

Öffne `shop-agent/config.yaml` und erledige **TODO 1**: `claude-sdk` oder `codex`.

### 2.2 Skill anlegen

Lege die Datei `shop-agent/skills/add-product/SKILL.md` an (**TODO 2**):

````markdown
---
name: add-product
description: Adds new products to the Agent Supply shop following the house rules. Use when asked to add, create or stock new products in the shop.
---

# add-product

Add the requested products to `data/products.json` (append at the end, keep the
2-space indentation). Do not change existing products.

House rules for every new product:

| Field | Rule |
|---|---|
| `id` | `<category>-<name-in-kebab-case>`, unique |
| `category` | one of `stickers`, `mugs`, `apparel`, `books`, `stationery` – never invent a new one |
| `name` | short, English |
| `description` | English, at most 100 characters |
| `price_cents` | whole cents, e.g. `2490` = €24.90 |
| `vat` | `"reduced"` for books, otherwise `"standard"` |
| `stock` | whole number ≥ 0, default `25` |
| `color` | one of `#1B31FF` `#081235` `#9C73F3` `#A7FF71` `#F2A541` `#E4572E` |

Then run `node --test`. `tests/products.test.js` checks these rules – fix the data until all tests pass.

Answer EXACTLY in this format:

```
PRODUCT ADDED
<id> · <name> · <price as €0.00> · stock <n>
Tests: ✅ <n> passed | ❌ <what failed>
Open http://localhost:3000 – the shop reloads by itself.
```
````

Die `description` ist wichtig: Daran erkennt der Agent, **wann** er den Skill nimmt.

### 2.3 Agent starten

```bash
omni run shop-agent
```

Frag: *„Welche Skills stehen dir zur Verfügung? Nenne Namen und Anzahl.“*
Du siehst `add-product` – und dazu **alle deine globalen Skills**, falls du welche hast.

### 2.4 Nur die eigenen Skills

Beende den Agent, erledige **TODO 3** (`skills: none` einkommentieren), starte neu und frag noch einmal.
Mit **Claude** kennt der Agent jetzt **nur noch** `add-product`.

> **Codex:** In unserem Test (Omnigent 0.22) hat `skills: none` bei Codex die globalen Skills **nicht** ausgeblendet.
> Dein eigener Skill funktioniert trotzdem – die Isolation zeigst du am besten mit Claude.

### 2.5 Skill benutzen

*„Füg drei Wintermützen in verschiedenen Farben hinzu.“* – die Antwort kommt im `PRODUCT ADDED`-Format,
und die Mützen erscheinen im Shop.

✅ **Geschafft, wenn:** neue Produkte im Shop auftauchen – und (mit Claude) der Agent nur `add-product` kennt.

> **Gut zu wissen**
> - `skills:` im YAML steuert nur die **globalen** Skills (`all` = Standard, `none` = keine, oder eine Liste von Namen). Die eigenen aus `./skills/` werden **immer** geladen – bei Claude und bei Codex.
> - Änderungen an YAML oder Skills wirken erst nach einem **Neustart** von `omni run`.
> - Mit Claude lädt `skills: none` auch deine persönlichen Claude-Einstellungen und MCP-Server nicht mit.

**Lösung:** `omni run ../solutions/exercise-2/shop-agent`

---

## Übung 3 – Bonus (für Schnelle)

Nimm die Lösung aus Übung 2 als Basis oder schau direkt in `../solutions/exercise-3/shop-agent/`.

### 3a – Sub-Agent mit eigenem Skill

Lege einen Reviewer an, der einen **eigenen** Skill hat, den der Haupt-Agent nicht sieht:

```
shop-agent/
├── config.yaml                          ← + tools: agents: [reviewer]
├── skills/add-product/SKILL.md
└── agents/reviewer/
    ├── config.yaml
    └── skills/a11y-check/SKILL.md       ← nur für den Reviewer
```

Vorlage: `../solutions/exercise-3/shop-agent/`. Dann: *„Lass deinen Reviewer den Shop auf Barrierefreiheit prüfen.“*

### 3b – Policy: Regeln, die das Modell nicht überreden kann

Mach den Reviewer schreibgeschützt – ergänze in `agents/reviewer/config.yaml`:

```yaml
guardrails:
  policies:
    read_only:
      type: function
      on: [tool_call]
      function:
        path: omnigent.policies.builtins.orchestration.read_only_os
```

Neu starten, dann: *„Bitte den Reviewer, Befund 1 selbst zu beheben.“* → `Denied by policy`.

> ⚠️ In einem Agent-Ordner gehören Policies unter `guardrails: policies:`. Ein Block `policies:` auf oberster Ebene wird **ohne Fehlermeldung ignoriert**.

### 3c – Zweiter Anbieter (wer beide Abos hat)

Stell im Reviewer `harness: codex` ein (oder umgekehrt). Jetzt prüft ein **anderes Modell** die Arbeit –
eine Zeile YAML.

**Lösung:** `omni run ../solutions/exercise-3/shop-agent`

---

## Weiterlesen

- Website: https://omnigent.ai
- Repo und Beispiele (polly, debby, scribe, sentinel): https://github.com/omnigent-ai/omnigent/tree/main/examples
- Agent-YAML-Referenz: https://github.com/omnigent-ai/omnigent/blob/main/docs/AGENT_YAML_SPEC.md
- Policy-Katalog: https://github.com/omnigent-ai/omnigent/blob/main/docs/POLICIES.md
