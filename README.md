# CRM Pros - Conduit Partner Page

This is a Next.js app showcasing a company partner page with Conduit's branding and design language.

## Features

- Single focused company page
- Server/Client component separation for optimal performance
- Responsive design with Tailwind CSS
- Interactive contact modal
- Company information sidebar
- Integrations showcase

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
└── app/
    ├── page.tsx              # Server component for the main page
    ├── CompanyPageClient.tsx # Client component with interactivity
    ├── layout.tsx            # Root layout
    └── globals.css           # Global styles
```

## Page Sections

The company page includes:
- **Minimal Header**: Clean navigation with subtle border
- **Company Sidebar**: 
  - Soft gray background
  - Black logo without heavy shadows
  - Simple contact button
  - Clean typography with small caps headers
  - Service offerings with simple checkmarks
- **Main Content Area**:
  - Floating CRM Pros dashboard screenshot (no container)
  - Clean about section
  - Subtle "Why Choose" section with light background
- **Contact Modal**: Minimal form with light backdrop

## Technologies Used

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- React Server Components