# PhotoRank

> Find the best photos from the chaos.

This is the project folder for the PhotoRank MVP. It contains only `CLAUDE.md` — the full build brief for Claude Code.

## How to use this

1. Open this folder in VS Code
2. Open Claude Code (terminal: `claude`)
3. Run this prompt:

```
Read CLAUDE.md fully, then build the MVP exactly as described. Scaffold the Next.js app in this directory, install dependencies, build all screens and the scoring pipeline, and give me a working local demo. Start with the file structure, then build screen by screen.
```

## After Claude Code builds the app

Download the face-api.js model files into `/public/models/`:

- [tiny_face_detector_model](https://github.com/justadudewhohacks/face-api.js/tree/master/weights)
- [face_landmark_68_model](https://github.com/justadudewhohacks/face-api.js/tree/master/weights)
- [face_expression_recognition_model](https://github.com/justadudewhohacks/face-api.js/tree/master/weights)

Then run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
