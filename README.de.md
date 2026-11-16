# Omnigent Workshop – Übungen

[🇬🇧 English](README.md) · 🇩🇪 Deutsch

```bash
git clone https://github.com/ifahrentholz/omnigent-workshop.git
cd omnigent-workshop
```

Drei Übungen, ca. 50 Minuten. Du arbeitest mit deinem eigenen **Claude-Code-** oder **Codex-Abo**.
Wo `claude` steht, geht auch `codex`. Code und Beispiele im Repo sind auf Englisch.

| Übung | Was du am Ende hast | Zeit |
|---|---|---|
| 1 | Omnigent läuft, dein Claude Code / Codex als Session im Terminal **und** im Browser | 25 Min |
| 2 | Ein eigener Agent in YAML mit **eigenem Skill** – unabhängig von deinen globalen Skills | 25 Min |
| 3 | Bonus: Policy, Sub-Agent mit eigenem Skill, zweiter Anbieter | für Schnelle |

```
omnigent-workshop/
├── demo-app/                       ← hier arbeitest du (Mini-Kasse in Python)
│   ├── checkout/pricing.py
│   ├── tests/
│   └── checkout-agent/             ← Übung 2: dein Agent (Starter mit TODOs)
└── solutions/                      ← zum Spicken oder Aufholen
    ├── exercise-2/checkout-agent/
    └── exercise-3/checkout-agent/
```

---

## Übung 1 – Omnigent einrichten (25 Min)

### 1.1 Voraussetzungen prüfen

```bash
git --version
python3 --version        # 3.10 oder neuer (für die Tests der Demo-App)
node --version           # 22 oder neuer
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

### 1.3 Dein Agent als Omnigent-Session

```bash
cd omnigent-workshop/demo-app
omni claude              # oder: omni codex
```

Beim ersten Start fragt Omnigent ggf. nach deinem Anbieter – wähle dein Abo.

1. Schreib im Terminal: *„Erklär mir in 3 Sätzen, was dieses Repo macht, und lass die Tests laufen.“*
2. Öffne im Browser **http://localhost:6767** – dort ist **dieselbe Session**.
3. Schreib im Browser: *„Welche MwSt.-Sätze kennt die Kasse?“* – die Antwort erscheint auch im Terminal.

✅ **Geschafft, wenn:** du eine Nachricht im Browser schickst und sie im Terminal ankommt.

### Wenn es hakt

| Problem | Lösung |
|---|---|
| `tmux` fehlt | `brew install tmux` bzw. `sudo apt install tmux` |
| Linux: Terminal startet nicht (bwrap) | `sudo apt install bubblewrap` |
| „Not logged in“ | `claude` starten → `/login` bzw. `codex login` |
| Windows | `omni claude` geht dort nicht. Nimm `omnigent run --harness claude-sdk` (oder `--harness codex`) – Übung 2 funktioniert normal |
| `omni` nicht gefunden | neues Terminal öffnen; sonst `~/.local/bin` in den `PATH` |
| Installer bricht bei der Databricks-CLI ab oder lädt sehr lange | ohne Databricks installieren: `curl -fsSL https://omnigent.ai/install.sh \| sh -s -- --no-databricks` |

---

## Übung 2 – Eigener Agent mit eigenem Skill (25 Min)

**Die Idee:** Ein Agent ist ein Ordner. Seine Skills liegen **im selben Ordner** – nicht im globalen
`~/.claude/skills`. Damit sind Agent und Skills zusammen versioniert, teilbar und unabhängig davon,
was auf deinem Rechner sonst installiert ist.

```
checkout-agent/
├── config.yaml                      ← Prompt, Harness, Rechte
└── skills/
    └── checkout-check/SKILL.md      ← wird automatisch gefunden
```

Alle Befehle im Ordner `demo-app/`.

### 2.1 Harness wählen

Öffne `checkout-agent/config.yaml` und erledige **TODO 1**: `claude-sdk` oder `codex`.

### 2.2 Skill anlegen

Lege die Datei `checkout-agent/skills/checkout-check/SKILL.md` an (**TODO 2**):

````markdown
---
name: checkout-check
description: Checks the mini checkout code against the house rules (integer cents, rounding, tests). Use when asked for a checkout check, a code check of the checkout, or the house rules.
---

# checkout-check

Check the mini checkout against our three house rules. Do not change anything.

1. **Integer cents:** Read `checkout/pricing.py`. All amounts must be `int` in cents.
2. **Rounding:** Rounding happens only via `round_half_up_div`.
   (The `//` in `format_eur` only splits euros and cents for display – allowed.)
3. **Tests:** Run `python3 -m unittest -q`.

Answer EXACTLY in this format:

```
CHECKOUT-CHECK
Integer cents:  ✅ | ❌  <evidence with file:line>
Rounding:       ✅ | ❌  <evidence with file:line>
Tests:          ✅ | ❌  <number of tests, result>
Verdict:        <one sentence>
```
````

Die `description` ist wichtig: Daran erkennt der Agent, **wann** er den Skill nimmt.

### 2.3 Agent starten

```bash
omni run checkout-agent
```

Frag: *„Welche Skills stehen dir zur Verfügung? Nenne Namen und Anzahl.“*
Du siehst `checkout-check` – und dazu **alle deine globalen Skills**, falls du welche hast.

### 2.4 Nur die eigenen Skills

Beende den Agent, erledige **TODO 3** (`skills: none` einkommentieren), starte neu und frag noch einmal.
Mit **Claude** kennt der Agent jetzt **nur noch** `checkout-check`.

> **Codex:** In unserem Test (Omnigent 0.22) hat `skills: none` bei Codex die globalen Skills **nicht** ausgeblendet.
> Dein eigener Skill funktioniert trotzdem – die Isolation zeigst du am besten mit Claude.

### 2.5 Skill benutzen

*„Mach einen Checkout-Check.“* – die Antwort kommt im `CHECKOUT-CHECK`-Format: Der Agent hat deinen Skill benutzt.

✅ **Geschafft, wenn:** der Agent im `CHECKOUT-CHECK`-Format antwortet – und (mit Claude) nur `checkout-check` kennt.

> **Gut zu wissen**
> - `skills:` im YAML steuert nur die **globalen** Skills (`all` = Standard, `none` = keine, oder eine Liste von Namen). Die eigenen aus `./skills/` werden **immer** geladen – bei Claude und bei Codex.
> - Änderungen an YAML oder Skills wirken erst nach einem **Neustart** von `omni run`.
> - Mit Claude lädt `skills: none` auch deine persönlichen Claude-Einstellungen und MCP-Server nicht mit.

**Lösung:** `omni run ../solutions/exercise-2/checkout-agent`

---

## Übung 3 – Bonus (für Schnelle)

Nimm die Lösung aus Übung 2 als Basis oder schau direkt in `../solutions/exercise-3/checkout-agent/`.

### 3a – Policy: Regeln, die das Modell nicht überreden kann

Ergänze in `config.yaml`:

```yaml
guardrails:
  policies:
    read_only:
      type: function
      on: [tool_call]
      function:
        path: omnigent.policies.builtins.orchestration.read_only_os
```

Neu starten, dann: *„Leg die Datei note.txt an.“* → `Denied by policy`.

> ⚠️ In einem Agent-Ordner gehören Policies unter `guardrails: policies:`. Ein Block `policies:` auf oberster Ebene wird **ohne Fehlermeldung ignoriert**.

### 3b – Sub-Agent mit eigenem Skill

Lege einen Reviewer an, der **eigene** Skills hat, die der Haupt-Agent nicht sieht:

```
checkout-agent/
├── config.yaml                          ← + tools: agents: [reviewer]
├── skills/checkout-check/SKILL.md
└── agents/reviewer/
    ├── config.yaml
    └── skills/test-gaps/SKILL.md        ← nur für den Reviewer
```

Vorlage: `../solutions/exercise-3/checkout-agent/`. Dann: *„Lass deinen Reviewer die Testlücken finden.“*

### 3c – Zweiter Anbieter (wer beide Abos hat)

Stell im Reviewer `harness: codex` ein (oder umgekehrt). Jetzt prüft ein **anderes Modell** die Arbeit –
eine Zeile YAML.

**Lösung:** `omni run ../solutions/exercise-3/checkout-agent`

---

## Weiterlesen

- Website: https://omnigent.ai
- Repo und Beispiele (polly, debby, scribe, sentinel): https://github.com/omnigent-ai/omnigent/tree/main/examples
- Agent-YAML-Referenz: https://github.com/omnigent-ai/omnigent/blob/main/docs/AGENT_YAML_SPEC.md
- Policy-Katalog: https://github.com/omnigent-ai/omnigent/blob/main/docs/POLICIES.md
