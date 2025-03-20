# OpenAI Proxy Website

This project provides a web interface for interacting with an OpenAI proxy backend. It is built using React, Next.js, Redux, and Plate editor.

## Folder Structure

```
openaiproxywebsite/
├── components/
│   ├── editor/
│   │   ├── plate-editor.tsx
│   │   ├── use-create-editor.ts
│   │   ├── settings.tsx
│   │   └── plate-ui/
│   │       ├── editor.tsx
│   │       └── editor-container.tsx
│   └── ... (other reusable components)
├── pages/
│   ├── api/
│   │   └── ... (API routes)
│   └── ... (Next.js pages)
├── redux/
│   ├── store.ts
│   └── slices/
│       └── notesSlice.ts
├── public/
│   └── ... (static assets)
├── styles/
│   └── ... (global styles and themes)
├── utils/
│   └── ... (utility functions)
└── README.md
```

## Components

### Editor Components (`components/editor`)

- **plate-editor.tsx**: Main editor component integrating Plate editor with Redux state management.
- **use-create-editor.ts**: Custom hook to initialize and configure the Plate editor instance.
- **settings.tsx**: Dialog component for editor settings and configurations.
- **plate-ui/editor.tsx**: Customized Plate editor UI component.
- **plate-ui/editor-container.tsx**: Container component for styling and layout of the editor.

### Redux (`redux`)

- **store.ts**: Redux store configuration.
- **slices/notesSlice.ts**: Redux slice managing notes state.

### Pages (`pages`)

- Contains Next.js pages and API routes for server-side rendering and backend communication.

### Public (`public`)

- Static assets such as images, icons, and fonts.

### Styles (`styles`)

- Global CSS and theme definitions.

### Utils (`utils`)

- Utility functions and helpers used across the application.

## Getting Started

To run the project locally:

```bash
yarn install
yarn dev

# Or
# for production
yarn build
yarn start
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Environment
Need to setup veriable `AZ_OPENAI_TRIGGER_FUNCTION_KEY` and `AZ_OPENAI_TRIGGER_FUNCTION_ENDPOINT` in running environment. This project runs on AzureWebApp so config it in WebApp Configuration panel.
