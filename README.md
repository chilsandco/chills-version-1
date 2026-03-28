- **CHILS & CO. - Minimalist Fashion E-commerce**
- **Tagline**: Essential by Design. Elevated by Intent.

## Features
- **Zara-inspired Design**: Fullscreen hero, grid-based layouts, heavy whitespace.
- **Cyber-minimalism Aesthetic**: Space Grotesk typography, neon green accents, dark mode.
- **Razorpay Integration**: Placeholder integration for payments (test mode).
- **Full-stack Architecture**: Express backend with Vite frontend.
- **Mobile-first Responsive**: Optimized for all screen sizes.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Motion, Lucide Icons.
- **Backend**: Node.js, Express.
- **Build Tool**: Vite.

## Deployment to Hostinger (via GitHub)

1. **Prepare Repository**:
   - Ensure all code is pushed to your GitHub repository.
   - Make sure `package.json` has the correct `start` script: `"start": "node server.ts"`.
   - Note: Hostinger Node.js hosting typically requires a `start` script.

2. **Hostinger Setup**:
   - Go to your Hostinger Control Panel (hPanel).
   - Navigate to **Advanced > Node.js**.
   - Click **Create App**.
   - Select your GitHub repository.
   - Set the **Entry File** to `server.ts` (or the compiled version if you build it).
   - Set the **Environment Variables**:
     - `NODE_ENV=production`
     - `RAZORPAY_KEY_ID=your_key_id` (when ready)
     - `RAZORPAY_KEY_SECRET=your_key_secret` (when ready)

3. **Build Process**:
   - Hostinger will run `npm install` and `npm run build`.
   - The `server.ts` is configured to serve the `dist` folder in production.

4. **Razorpay Configuration**:
   - To enable real payments, update `server.ts` with your actual Razorpay keys.
   - Update the frontend `Checkout.tsx` to load the Razorpay script and handle the response.

## Development
```bash
npm install
npm run dev
```

## License
Apache-2.0
