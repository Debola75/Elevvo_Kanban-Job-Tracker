# Octa — Job Tracker

Octa is a client-side job search tracker. Organize applications on a Kanban board, keep job details in one place, and track your progress through each stage.

## Features

- Track jobs across Applied, Interviewing, Offer, and Rejected columns.
- Add jobs with company, role, status, location, and salary details.
- Drag cards between columns to update their status.
- Search by company, role, or location; filter by status and sort by company.
- Save board data in browser local storage and export it as a JSON file.

## Getting started

Requirements: Node.js 18 or newer and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite to use the app.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

## Data storage

The board is saved in your browser's local storage. Export a JSON copy using **Export board**. Clearing browser data will remove the locally stored board, so export a copy if you need a backup.

## Built with

React, TypeScript, Vite, Tailwind CSS, `@dnd-kit`, React Hook Form, and Lucide icons.
