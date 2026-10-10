# 🎨 Frontend Architecture & 11 Dynamic Templates

The **Portfolio Builder 2.0 Frontend** is a modern Single Page Application (SPA) built with **React 18**, **TypeScript**, and **Vite**. It provides an interactive portfolio builder, live real-time previewing, AI resume parser upload flows, and **11 distinct visual themes** for public portfolio display.

---

## 🏛️ Application Architecture

```
                                  ┌─────────────────────────────┐
                                  │      React 18 Root SPA      │
                                  └──────────────┬──────────────┘
                                                 │
            ┌────────────────────────────────────┼────────────────────────────────────┐
            ▼                                    ▼                                    ▼
┌────────────────────────┐          ┌────────────────────────┐          ┌────────────────────────┐
│     Authentication     │          │    Portfolio Builder   │          │   Public Portfolio     │
│• Login & Register Views│          │• PortfolioFormShell    │          │  Route: /p/:slug       │
│• Password Reset Forms  │          │• usePortfolioForm Hook │          │• TemplateRenderer      │
│• HttpOnly Cookie Flow  │          │• ResumeParsingLoader   │          │• Dynamic Themes (1-11) │
└────────────────────────┘          │• Modals (Avatar, PDF)  │          │• Contact Dialog        │
                                    └────────────────────────┘          └────────────────────────┘
```

### 1. `usePortfolioForm` Hook
- Centralizes state management across the multi-step portfolio creation wizard.
- Handles debounced auto-saving to local storage and remote backend drafts.
- Performs schema validation for nested sub-documents (dates, URLs, required fields).

### 2. `PortfolioFormShell`
- Multi-step modular accordion interface:
  - **Step 1: Personal Profile:** Name, headline, bio, avatar upload, location, social links.
  - **Step 2: Experience:** Companies, roles, date ranges, and AI-assisted STAR bullet enhancement.
  - **Step 3: Projects:** Titles, descriptions, tech stacks, live links, GitHub repos, and screenshots.
  - **Step 4: Skills:** Grouped by technical categories (Languages, Frameworks, Cloud, Databases).
  - **Step 5: Education & Certifications:** Institutions, degrees, honors, and certificates.
  - **Step 6: Template & Theme Customizer:** Live palette selection, font picking, and slug assignment.

### 3. Animated `ResumeParsingLoader`
- Provides visual feedback when a user uploads a PDF resume.
- Animates through realistic parsing stages: *Extracting Raw Text ➔ Analyzing Work History ➔ Structuring Skills & Projects ➔ Populating Form Fields*.

### 4. Interactive Modals
- `AvatarZoomModal`: Pan and zoom avatar images with responsive touch controls.
- `PdfViewerModal`: In-app PDF reader to preview original uploaded resumes.
- `ProjectSpotlightModal`: Full-screen project showcase with interactive live demo framing.

---

## 🎭 The 11 Dynamic Portfolio Templates

The template engine (`TemplateRenderer.tsx`) dynamically mounts themes based on the user's `templateId`:

| # | Template Name | Visual Style | Best For | Key Features |
|---|---|---|---|---|
| **1** | **Minimalist** | Clean Swiss typography, monochrome palette, generous whitespace | Minimalists, UX Designers, Writers | Subtle dividers, high legibility, clean layout |
| **2** | **BentoGrid** | Modern Apple/Linear style modular cards | Full-Stack & Product Engineers | Rounded card grid, hover glow effects, metrics counters |
| **3** | **DevTerminal** | Retro Linux command line terminal interface | Backend, DevOps & Systems Engineers | Interactive CLI prompt (`help`, `cat bio`, `skills`, `projects`, `clear`, `contact`) |
| **4** | **GamifiedRPG** | 8-bit retro gaming / pixel art quest log | Game Devs & Creative Programmers | HP/Mana stat bars, quest-log work experiences, inventory skill grid |
| **5** | **AcademicLaTeX**| Formal scientific paper / ACM publication | Data Scientists, Researchers, ML Engineers | Serif typography, two-column layout, formal abstract, numbered sections |
| **6** | **DarkPro** | High-contrast sleek dark mode with neon accents | Modern Frontend & Software Engineers | Dark charcoal surfaces, neon accent glow, frosted glass cards |
| **7** | **Cyberpunk** | Sci-fi HUD, neon magenta/cyan, scanline effects | Web3, Security & Gaming Developers | Glitch text effects, glowing chips, futuristic accents |
| **8** | **Neobrutalism** | High-saturation, stark black borders, 90s retro | UI/UX Designers & Indie Hackers | Thick 3px black borders, harsh drop shadows, vibrant pastel fills |
| **9** | **ClassicGreen** | Traditional corporate emerald palette | Enterprise & FinTech Developers | Forest green accents, corporate hierarchy, clean tables |
| **10**| **Creative** | Fluid SVG shapes, asymmetric layout | Designers & Creative Technologists | Dynamic hero section, fluid SVG shapes, card carousel |
| **11**| **ResumePrint** | Print-optimized standard CV format | Job applicants requiring PDF export | Strictly single/two page layout, print CSS media queries |

---

## 💻 DevTerminal Template Demo

The `DevTerminal` template includes a built-in virtual shell. Visitors can type commands directly in the browser:

```
guest@portfolio-builder:~$ help
Available commands:
  help       - Show available commands
  whoami     - Display professional summary
  skills     - List categorized technical skills
  projects   - Display showcased engineering projects
  experience - Print employment history & timeline
  contact    - Send an email inquiry to developer
  clear      - Clear terminal screen

guest@portfolio-builder:~$ skills
[Languages]   : TypeScript, Python, Go, C++
[Frameworks]  : React 18, NestJS, FastAPI, Express
[Cloud & DB]  : Docker, MongoDB, AWS, Render
```

---

## 🛠️ Verification & Build Commands

```bash
# Navigate to frontend directory
cd PORTFOLIO_FRONTEND-main

# Install dependencies
npm install

# Start local development server (Port 3000)
npm start

# Run TypeScript type checking
npm run typecheck

# Build optimized production bundle
npm run build
```

---

[Explore CI/CD Pipeline & DevOps Guide ➔](CI-CD-Pipeline-and-DevOps)
