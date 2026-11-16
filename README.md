# Omnigent Workshop – Übungen

```bash
git clone https://github.com/ifahrentholz/omnigent-workshop.git
cd omnigent-workshop
```

Drei Übungen, ca. 50 Minuten. Du arbeitest mit deinem eigenen **Claude-Code-** oder **Codex-Abo**.
Wo `claude` steht, geht auch `codex`.

| Übung | Was du am Ende hast | Zeit |
|---|---|---|
| 1 | Omnigent läuft, dein Claude Code / Codex als Session im Terminal **und** im Browser | 25 Min |
| 2 | Ein eigener Agent in YAML mit **eigenem Skill** – unabhängig von deinen globalen Skills | 25 Min |
| 3 | Bonus: Policy, Sub-Agent mit eigenem Skill, zweiter Anbieter | für Schnelle |

```
omnigent-workshop/
├── demo-app/                       ← hier arbeitest du (Mini-Kasse in Python)
│   ├── kasse/pricing.py
│   ├── tests/
│   └── agenten/kassen-agent/       ← Übung 2: dein Agent (Starter mit TODOs)
└── loesungen/                      ← zum Spicken oder Aufholen
    ├── uebung-2/kassen-agent/
    └── uebung-3/kassen-agent/
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
curl -fsSL https://raw.githubusercontent.com/omnigent-ai/omnigent/main/scripts/install_oss.sh | sh -s -- --no-databricks
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

---

## Übung 2 – Eigener Agent mit eigenem Skill (25 Min)

**Die Idee:** Ein Agent ist ein Ordner. Seine Skills liegen **im selben Ordner** – nicht im globalen
`~/.claude/skills`. Damit sind Agent und Skills zusammen versioniert, teilbar und unabhängig davon,
was auf deinem Rechner sonst installiert ist.

```
agenten/kassen-agent/
├── config.yaml                    ← Prompt, Harness, Rechte
└── skills/
    └── kassen-check/SKILL.md      ← wird automatisch gefunden
```

Alle Befehle im Ordner `demo-app/`.

### 2.1 Harness wählen

Öffne `agenten/kassen-agent/config.yaml` und erledige **TODO 1**: `claude-sdk` oder `codex`.

### 2.2 Skill anlegen

Lege die Datei `agenten/kassen-agent/skills/kassen-check/SKILL.md` an (**TODO 2**):

````markdown
---
name: kassen-check
description: Prüft den Code der Mini-Kasse auf die Hausregeln (Integer-Cent, Rundung, Tests). Verwenden, wenn nach einem Kassen-Check, einer Code-Prüfung der Kasse oder den Hausregeln gefragt wird.
---

# kassen-check

Prüfe die Mini-Kasse gegen unsere drei Hausregeln. Ändere dabei nichts.

1. **Integer-Cent:** Lies `kasse/pricing.py`. Alle Beträge müssen `int` in Cent sein.
2. **Rundung:** Gerundet wird ausschließlich über `round_half_up_div`.
   (Das `//` in `format_eur` trennt nur Euro und Cent für die Anzeige – erlaubt.)
3. **Tests:** Führe `python3 -m unittest -q` aus.

Antworte GENAU in diesem Format:

```
KASSEN-CHECK
Integer-Cent:  ✅ | ❌  <Beleg mit Datei:Zeile>
Rundung:       ✅ | ❌  <Beleg mit Datei:Zeile>
Tests:         ✅ | ❌  <Anzahl Tests, Ergebnis>
Fazit:         <ein Satz>
```
````

Die `description` ist wichtig: Daran erkennt der Agent, **wann** er den Skill nimmt.

### 2.3 Agent starten

```bash
omni run agenten/kassen-agent
```

Frag: *„Welche Skills stehen dir zur Verfügung? Nenne Namen und Anzahl.“*
Du siehst `kassen-check` – und dazu **alle deine globalen Skills**, falls du welche hast.

### 2.4 Nur die eigenen Skills

Beende den Agent, erledige **TODO 3** (`skills: none` einkommentieren), starte neu und frag noch einmal.
Mit **Claude** kennt der Agent jetzt **nur noch** `kassen-check`.

> **Codex:** In unserem Test (Omnigent 0.22) hat `skills: none` bei Codex die globalen Skills **nicht** ausgeblendet.
> Dein eigener Skill funktioniert trotzdem – die Isolation zeigst du am besten mit Claude.

### 2.5 Skill benutzen

*„Mach einen Kassen-Check.“* – die Antwort kommt im `KASSEN-CHECK`-Format: Der Agent hat deinen Skill benutzt.

✅ **Geschafft, wenn:** der Agent im `KASSEN-CHECK`-Format antwortet – und (mit Claude) nur `kassen-check` kennt.

> **Gut zu wissen**
> - `skills:` im YAML steuert nur die **globalen** Skills (`all` = Standard, `none` = keine, oder eine Liste von Namen). Die eigenen aus `./skills/` werden **immer** geladen – bei Claude und bei Codex.
> - Änderungen an YAML oder Skills wirken erst nach einem **Neustart** von `omni run`.
> - Mit Claude lädt `skills: none` auch deine persönlichen Claude-Einstellungen und MCP-Server nicht mit.

**Lösung:** `omni run ../loesungen/uebung-2/kassen-agent`

---

## Übung 3 – Bonus (für Schnelle)

Nimm die Lösung aus Übung 2 als Basis oder schau direkt in `../loesungen/uebung-3/kassen-agent/`.

### 3a – Policy: Regeln, die das Modell nicht überreden kann

Ergänze in `config.yaml`:

```yaml
guardrails:
  policies:
    nur_lesen:
      type: function
      on: [tool_call]
      function:
        path: omnigent.policies.builtins.orchestration.read_only_os
```

Neu starten, dann: *„Leg die Datei notiz.txt an.“* → `Denied by policy`.

> ⚠️ In einem Agent-Ordner gehören Policies unter `guardrails: policies:`. Ein Block `policies:` auf oberster Ebene wird **ohne Fehlermeldung ignoriert**.

### 3b – Sub-Agent mit eigenem Skill

Lege einen Reviewer an, der **eigene** Skills hat, die der Haupt-Agent nicht sieht:

```
kassen-agent/
├── config.yaml                          ← + tools: agents: [reviewer]
├── skills/kassen-check/SKILL.md
└── agents/reviewer/
    ├── config.yaml
    └── skills/test-luecken/SKILL.md     ← nur für den Reviewer
```

Vorlage: `../loesungen/uebung-3/kassen-agent/`. Dann: *„Lass deinen Reviewer die Testlücken finden.“*

### 3c – Zweiter Anbieter (wer beide Abos hat)

Stell im Reviewer `harness: codex` ein (oder umgekehrt). Jetzt prüft ein **anderes Modell** die Arbeit –
eine Zeile YAML.

**Lösung:** `omni run ../loesungen/uebung-3/kassen-agent`

---

## Weiterlesen

- Website: https://omnigent.ai
- Repo und Beispiele (polly, debby, scribe, sentinel): https://github.com/omnigent-ai/omnigent/tree/main/examples
- Agent-YAML-Referenz: https://github.com/omnigent-ai/omnigent/blob/main/docs/AGENT_YAML_SPEC.md
- Policy-Katalog: https://github.com/omnigent-ai/omnigent/blob/main/docs/POLICIES.md
