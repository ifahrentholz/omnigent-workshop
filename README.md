# Omnigent Workshop – Exercises

🇬🇧 English · [🇩🇪 Deutsch](README.de.md)

**Slides:** [English](https://claude.ai/artifact/GbLbKgj5mgVK5GMTGuSUuz) · [Deutsch](https://claude.ai/artifact/PTZU8djcU6kgo5LiLBW3Ap)

```bash
git clone https://github.com/ifahrentholz/omnigent-workshop.git
cd omnigent-workshop
```

Three exercises, about 50 minutes. You work with your own **Claude Code** or **Codex subscription**
on **Agent Supply**, a tiny demo shop in the browser – every change your agent makes shows up there
right away. Wherever it says `claude`, `codex` works too.

| Exercise | What you have at the end | Time |
|---|---|---|
| 1 | Omnigent is running; your agent changes the shop – from the terminal **and** from the browser | 25 min |
| 2 | Your own agent in YAML with **its own skill** – independent of your global skills | 25 min |
| 3 | Bonus: sub-agent with its own skill, policy, second vendor | for fast finishers |

```
omnigent-workshop/
├── demo-app/                       ← the shop – you work here
│   ├── server.js                   ← node server.js → http://localhost:3000
│   ├── public/                     ← index.html, app.js, cart.js, style.css
│   ├── data/products.json          ← mock products
│   ├── tests/                      ← node --test
│   └── shop-agent/                 ← exercise 2: your agent (starter with TODOs)
└── solutions/                      ← to peek or catch up
    ├── exercise-2/shop-agent/
    └── exercise-3/shop-agent/
```

---

## Exercise 1 – Set up Omnigent (25 min)

### 1.1 Check the prerequisites

```bash
git --version
node --version           # 22 or newer – runs the shop and Omnigent's agent CLIs
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

### 1.3 Start the shop

In **terminal 1**:

```bash
cd omnigent-workshop/demo-app
node server.js
```

Open **http://localhost:3000** – that's Agent Supply. Leave the terminal running: the shop
**reloads by itself** whenever a file changes.

### 1.4 Your agent as an Omnigent session

In **terminal 2**:

```bash
cd omnigent-workshop/demo-app
omni claude              # or: omni codex
```

On first start, Omnigent may ask for your provider – pick your subscription.

1. In the terminal, type: *"Show a 'Sold out' badge on products with stock 0 and disable their 'Add to cart' button."*
   Watch the shop: the "Sandbox cap" is now sold out.
2. Open **http://localhost:6767** in a second browser tab – it shows **the same session**.
3. In that tab, type: *"Add a dark-mode toggle to the header."* – the answer also appears in the
   terminal, and the shop gets dark mode.

✅ **Done when:** a change you requested from the browser shows up in the shop.

Want the original shop back? `git restore .` inside `demo-app/`.

### If you get stuck

| Problem | Fix |
|---|---|
| `tmux` missing | `brew install tmux` or `sudo apt install tmux` |
| Linux: terminal does not start (bwrap) | `sudo apt install bubblewrap` |
| "Not logged in" | start `claude` → `/login`, or `codex login` |
| Port 3000 is taken | `PORT=4000 node server.js` and open http://localhost:4000 |
| Windows | `omni claude` does not work there. Use `omnigent run --harness claude-sdk` (or `--harness codex`) – exercise 2 works normally |
| `omni` not found | open a new terminal; otherwise add `~/.local/bin` to your `PATH` |
| Installer fails at the Databricks CLI or downloads forever | install without Databricks: `curl -fsSL https://omnigent.ai/install.sh \| sh -s -- --no-databricks` |

---

## Exercise 2 – Your own agent with its own skill (25 min)

**The idea:** An agent is a folder. Its skills live **in the same folder** – not in the global
`~/.claude/skills`. So agent and skills are versioned together, shareable, and independent of
whatever else is installed on your machine.

```
shop-agent/
├── config.yaml                    ← prompt, harness, permissions
└── skills/
    └── add-product/SKILL.md       ← discovered automatically
```

Run all commands inside `demo-app/` – and keep the shop running in terminal 1.

### 2.1 Pick a harness

Open `shop-agent/config.yaml` and do **TODO 1**: `claude-sdk` or `codex`.

### 2.2 Create a skill

Create the file `shop-agent/skills/add-product/SKILL.md` (**TODO 2**):

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

The `description` matters: it is how the agent knows **when** to use the skill.

### 2.3 Start the agent

```bash
omni run shop-agent
```

Ask: *"Which skills are available to you? Give names and count."*
You see `add-product` – plus **all your global skills**, if you have any.

### 2.4 Only its own skills

Stop the agent, do **TODO 3** (uncomment `skills: none`), restart and ask again.
With **Claude**, the agent now knows **only** `add-product`.

> **Codex:** In our test (Omnigent 0.22), `skills: none` did **not** hide the global skills for Codex.
> Your own skill still works – the isolation is best shown with Claude.

### 2.5 Use the skill

*"Add three winter beanies in different colours."* – the answer comes in the `PRODUCT ADDED` format,
and the beanies appear in the shop.

✅ **Done when:** new products show up in the shop – and (with Claude) the agent knows only `add-product`.

> **Good to know**
> - `skills:` in the YAML only controls the **global** skills (`all` = default, `none` = none, or a list of names). Your own skills from `./skills/` are **always** loaded – with Claude and with Codex.
> - Changes to the YAML or skills only take effect after **restarting** `omni run`.
> - With Claude, `skills: none` also skips your personal Claude settings and MCP servers.

**Solution:** `omni run ../solutions/exercise-2/shop-agent`

---

## Exercise 3 – Bonus (for fast finishers)

Take the exercise 2 solution as a base, or look straight into `../solutions/exercise-3/shop-agent/`.

### 3a – Sub-agent with its own skill

Add a reviewer that has **its own** skill which the main agent does not see:

```
shop-agent/
├── config.yaml                          ← + tools: agents: [reviewer]
├── skills/add-product/SKILL.md
└── agents/reviewer/
    ├── config.yaml
    └── skills/a11y-check/SKILL.md       ← only for the reviewer
```

Template: `../solutions/exercise-3/shop-agent/`. Then: *"Have your reviewer check the shop for accessibility."*

### 3b – Policy: rules the model cannot talk its way around

Make the reviewer read-only – add to `agents/reviewer/config.yaml`:

```yaml
guardrails:
  policies:
    read_only:
      type: function
      on: [tool_call]
      function:
        path: omnigent.policies.builtins.orchestration.read_only_os
```

Restart, then: *"Ask the reviewer to fix finding 1 itself."* → `Denied by policy`.

> ⚠️ In an agent folder, policies belong under `guardrails: policies:`. A top-level `policies:` block is **ignored without any error**.

### 3c – Second vendor (if you have both subscriptions)

Set `harness: codex` in the reviewer (or the other way round). Now a **different model** checks the
work – one line of YAML.

**Solution:** `omni run ../solutions/exercise-3/shop-agent`

---

## Further reading

- Website: https://omnigent.ai
- Repo and examples (polly, debby, scribe, sentinel): https://github.com/omnigent-ai/omnigent/tree/main/examples
- Agent YAML reference: https://github.com/omnigent-ai/omnigent/blob/main/docs/AGENT_YAML_SPEC.md
- Policy catalog: https://github.com/omnigent-ai/omnigent/blob/main/docs/POLICIES.md
