# TaxSyncQC Frontend

This is the React frontend for the TaxSyncQC application, which helps accountants in Quebec calculate tax credits for their clients.

## Features

- Quebec + Federal tax credits calculator
- Bilingual support (French/English)
- Responsive design for all devices
- Real-time calculations using proven backend logic
- Professional UI for accountants and their clients

## Getting Started

### Prerequisites

- Node.js (v16 or higher)

### Running the Application

The application is built as a single-page application that can be served directly from the `dist` folder.

To run the development server:

```bash
cd taxsync-frontend
node server.js
```

The application will be available at `http://localhost:3000`.

### Building for Production

The application is already built and available in the `dist` folder. To rebuild:

```bash
cd taxsync-frontend
node build-frontend.js
```

This will create:
- `dist/index.html` - The main HTML file
- `dist/bundle.js` - The bundled JavaScript
- `dist/styles.css` - The combined CSS

## Deployment

The application can be deployed by simply serving the contents of the `dist` folder through any web server.

### Example deployment options:

1. **Static hosting services** (Netlify, Vercel, GitHub Pages)
2. **Traditional web servers** (Apache, Nginx)
3. **Cloud storage** (AWS S3, Google Cloud Storage)

For static hosting, simply upload the contents of the `dist` folder to your hosting provider.

## Architecture

This frontend uses the calculation logic from the main TaxSyncQC project:
- `credit-calculator.js` - Main calculation engine
- `i18n.js` - Internationalization support
- `rrsp-calculator.js` - RRSP impact calculations

The React components are bundled into a single JavaScript file for easy deployment without requiring a build step on the client side.

## Commercialization

This application is ready for commercialization with the following features:
- Professional UI/UX design
- Accurate tax calculations
- Bilingual support
- Responsive layout for all devices
- Easy deployment and hosting

For commercial use, consider adding:
- User authentication
- Client data management
- Report generation
- Payment integration
- Subscription management