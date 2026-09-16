# 😂 Excuse.exe

> "You have the problem. We have the excuse."

🔗 **Live demo:** https://gayathri7722.github.io/excuse-exe/

🤖 **Fun fact:** This entire project — code, design, excuse database, and
even this README — was built with AI. I asked it to make me a website
that generates excuses, and it did. Using AI to build an excuse
generator is a little too on-the-nose, but here we are. 😂

---

## What is this project?

Excuse.exe is a fun website that generates funny, creative excuses for
everyday situations — like waking up late, not finishing an assignment,
or missing a meeting.

You don't type anything. You just:
1. Pick what happened to you (a situation)
2. Pick how you want the excuse to sound (a style)
3. Click one button
4. Get a ready-made excuse, plus a joke "rating" of how believable and
   risky it is

It's meant to be a quick laugh, not a real tool for getting out of
trouble — think of it as a mini-game, not a form.

## Why does this exist?

Everyone has been in a spot where they need a creative way to explain
being late or unprepared. This project turns that small, everyday
moment into something fun instead of awkward — while also being a
simple, beginner-friendly example of a complete website: multiple
pages, custom styling, JavaScript logic, and saved data, with no
frameworks or backend required to run it.

## What you can do on the site

- **Generate an excuse** — pick from 9 situations and 4 styles (Normal,
  Funny, Savage, or Random), and get one of 50+ hand-written excuses.
- **See a rating** — every excuse gets a Creativity score, a
  Believability score, and a Danger Level, plus a one-line verdict.
- **Chaos Mode** — one button, zero choices. The site picks everything
  for you at random.
- **Copy or share** the excuse you get, or **save** it to a "My
  Excuses" list that stays in your browser.
- **Excuse of the Day** — a new random excuse on the homepage every day.

## How it's built (in plain terms)

No fancy tools needed — just three basic web languages working
together:

| File | What it does |
|---|---|
| `index.html` | The homepage — what you see first |
| `generator.html` | The page where you actually generate excuses |
| `about.html` | Explains the project |
| `style.css` | Makes everything look the way it does (colors, layout, animations) |
| `script.js` | The "brain" — holds all the excuses and makes the buttons work |
| `data/excuses.json` | The same excuses as `script.js`, kept as a plain data file |

There's no database and no server. Everything runs directly in your
browser, and anything you "save" is stored using your browser's own
built-in storage (`localStorage`) — so it stays on your device only.

## How to run it yourself

**Easiest way:** just open `index.html` in your browser (double-click
it, or right-click → Open With → your browser). That's it — no
installs, no setup.

**If you want to run it through a local server instead** (optional,
only needed for some browsers' share features), open a terminal in the
project folder and run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Project structure

```
excuse-exe/
│
├── index.html          # Homepage
├── generator.html       # Excuse generator + Chaos Mode + My Excuses
├── about.html            # About page
├── style.css             # All the styling
├── script.js              # All the logic and excuse data
│
├── data/
│   └── excuses.json      # Excuse data, kept as a plain file too
│
└── README.md
```

## Ideas for the future

- Real AI-generated excuses instead of a fixed list
- User accounts so excuses can be saved online, not just in the browser
- A leaderboard of the funniest or most-used excuses
- More situations and categories
- Excuses in Telugu, Hindi, and English
- A voice that reads the excuse out loud
- A chatbot version you can talk to

## A note on the content

Every excuse in this project is written to be harmless and silly. It's
built for entertainment about small, everyday situations — not as a
tool for anything serious, dishonest, or harmful.

## Author

Gayathri — built as a fun, beginner-friendly project. Feel free to fork
it, break it, and make it your own. 😂
