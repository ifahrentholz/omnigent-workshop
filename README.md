# Omnigent Workshop – Exercises

🇬🇧 English · [🇩🇪 Deutsch](README.de.md)

```bash
git clone https://github.com/ifahrentholz/omnigent-workshop.git
cd omnigent-workshop
```

Three exercises, about 50 minutes. You work with your own **Claude Code** or **Codex subscription**.
Wherever it says `claude`, `codex` works too.

| Exercise | What you have at the end | Time |
|---|---|---|
| 1 | Omnigent is running, your Claude Code / Codex as a session in the terminal **and** in the browser | 25 min |
| 2 | Your own agent in YAML with **its own skill** – independent of your global skills | 25 min |
| 3 | Bonus: policy, sub-agent with its own skill, second vendor | for fast finishers |

```
omnigent-workshop/
├── demo-app/                       ← you work here (mini checkout in Python)
│   ├── checkout/pricing.py
│   ├── tests/
│   └── checkout-agent/             ← exercise 2: your agent (starter with TODOs)
└── solutions/                      ← to peek or catch up
    ├── exercise-2/checkout-agent/
    └── exercise-3/checkout-agent/
```

---

## Exercise 1 – Set up Omnigent (25 min)

### 1.1 Check the prerequisites

```bash
git --version
python3 --version        # 3.10 or newer (for the demo app's tests)
node --version           # 22 or newer
tmux -V                  # macOS: brew install tmux · Ubuntu: sudo apt install tmux
claude --version         # and/or: codex --version
```

Your `claude` or `codex` must be **logged in**: start `claude` once and run `/login` – or `codex login`.

### 1.2 Install Omnigent

```bash
curl -fsSL https://omnigent.ai/install.sh | sh
```

Then open a **new terminal** and check:

```bash
omni --version
```

`omni` and `omnigent` are the same command.

### 1.3 Your agent as an Omnigent session

```bash
cd omnigent-workshop/demo-app
omni claude              # or: omni codex
```

On first start, Omnigent may ask for your provider – pick your subscription.

1. In the terminal, type: *"Explain in 3 sentences what this repo does, and run the tests."*
2. Open **http://localhost:6767** in your browser – it shows **the same session**.
3. In the browser, type: *"Which VAT rates does the checkout know?"* – the answer also appears in the terminal.

✅ **Done when:** you send a message from the browser and it arrives in the terminal.

### If you get stuck

| Problem | Fix |
|---|---|
| `tmux` missing | `brew install tmux` or `sudo apt install tmux` |
| Linux: terminal does not start (bwrap) | `sudo apt install bubblewrap` |
| "Not logged in" | start `claude` → `/login`, or `codex login` |
| Windows | `omni claude` does not work there. Use `omnigent run --harness claude-sdk` (or `--harness codex`) – exercise 2 works normally |
| `omni` not found | open a new terminal; otherwise add `~/.local/bin` to your `PATH` |
| Installer fails at the Databricks CLI or downloads forever | install without Databricks: `curl -fsSL https://omnigent.ai/install.sh \| sh -s -- --no-databricks` |

---

## Exercise 2 – Your own agent with its own skill (25 min)

**The idea:** An agent is a folder. Its skills live **in the same folder** – not in the global
`~/.claude/skills`. So agent and skills are versioned together, shareable, and independent of
whatever else is installed on your machine.

```
checkout-agent/
├── config.yaml                      ← prompt, harness, permissions
└── skills/
    └── checkout-check/SKILL.md      ← discovered automatically
```

Run all commands inside `demo-app/`.

### 2.1 Pick a harness

Open `checkout-agent/config.yaml` and do **TODO 1**: `claude-sdk` or `codex`.

### 2.2 Create a skill

Create the file `checkout-agent/skills/checkout-check/SKILL.md` (**TODO 2**):

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

The `description` matters: it is how the agent knows **when** to use the skill.

### 2.3 Start the agent

```bash
omni run checkout-agent
```

Ask: *"Which skills are available to you? Give names and count."*
You see `checkout-check` – plus **all your global skills**, if you have any.

### 2.4 Only its own skills

Stop the agent, do **TODO 3** (uncomment `skills: none`), restart and ask again.
With **Claude**, the agent now knows **only** `checkout-check`.

> **Codex:** In our test (Omnigent 0.22), `skills: none` did **not** hide the global skills for Codex.
> Your own skill still works – the isolation is best shown with Claude.

### 2.5 Use the skill

*"Do a checkout check."* – the answer comes in the `CHECKOUT-CHECK` format: the agent used your skill.

✅ **Done when:** the agent answers in the `CHECKOUT-CHECK` format – and (with Claude) knows only `checkout-check`.

> **Good to know**
> - `skills:` in the YAML only controls the **global** skills (`all` = default, `none` = none, or a list of names). Your own skills from `./skills/` are **always** loaded – with Claude and with Codex.
> - Changes to the YAML or skills only take effect after **restarting** `omni run`.
> - With Claude, `skills: none` also skips your personal Claude settings and MCP servers.

**Solution:** `omni run ../solutions/exercise-2/checkout-agent`

---

## Exercise 3 – Bonus (for fast finishers)

Take the exercise 2 solution as a base, or look straight into `../solutions/exercise-3/checkout-agent/`.

### 3a – Policy: rules the model cannot talk its way around

Add to `config.yaml`:

```yaml
guardrails:
  policies:
    read_only:
      type: function
      on: [tool_call]
      function:
        path: omnigent.policies.builtins.orchestration.read_only_os
```

Restart, then: *"Create the file note.txt."* → `Denied by policy`.

> ⚠️ In an agent folder, policies belong under `guardrails: policies:`. A top-level `policies:` block is **ignored without any error**.

### 3b – Sub-agent with its own skill

Add a reviewer that has **its own** skills which the main agent does not see:

```
checkout-agent/
├── config.yaml                          ← + tools: agents: [reviewer]
├── skills/checkout-check/SKILL.md
└── agents/reviewer/
    ├── config.yaml
    └── skills/test-gaps/SKILL.md        ← only for the reviewer
```

Template: `../solutions/exercise-3/checkout-agent/`. Then: *"Have your reviewer find the test gaps."*

### 3c – Second vendor (if you have both subscriptions)

Set `harness: codex` in the reviewer (or the other way round). Now a **different model** checks the
work – one line of YAML.

**Solution:** `omni run ../solutions/exercise-3/checkout-agent`

---

## Further reading

- Website: https://omnigent.ai
- Repo and examples (polly, debby, scribe, sentinel): https://github.com/omnigent-ai/omnigent/tree/main/examples
- Agent YAML reference: https://github.com/omnigent-ai/omnigent/blob/main/docs/AGENT_YAML_SPEC.md
- Policy catalog: https://github.com/omnigent-ai/omnigent/blob/main/docs/POLICIES.md
