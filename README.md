- **CHILS & CO. - Minimalist Fashion E-commerce**
- **Tagline**: Essential by Design. Elevated by Intent.

## Features
- **Zara-inspired Design**: Fullscreen hero, grid-based layouts, heavy whitespace.
- **Cyber-minimalism Aesthetic**: Space Grotesk typography, neon green accents, dark mode.
- **PhonePe Integration**: Secure payment gateway for UPI and Card transactions.
- **Full-stack Architecture**: Express backend with Vite frontend.
- **Mobile-first Responsive**: Optimized for all screen sizes.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Motion, Lucide Icons.
- **Backend**: Node.js, Express.
- **Build Tool**: Vite.
- **Payments**: PhonePe SDK Integration.

## Deployment to Hostinger (via GitHub)

1. **Prepare Repository**:
   - Ensure all code is pushed to your GitHub repository.
   - Make sure `package.json` has the correct `start` script: `"start": "node server.js"`.
   - The production build uses `server.js` (compiled from `server.ts`).

2. **Hostinger Setup**:
   - Go to your Hostinger Control Panel (hPanel).
   - Navigate to **Advanced > Node.js**.
   - Click **Create App**.
   - Select your GitHub repository.
   - Set the **Entry File** to `server.js`.
   - Set the **Environment Variables**:
     - `NODE_ENV=production`
     - `PHONEPE_MERCHANT_ID=your_merchant_id`
     - `PHONEPE_SALT_KEY=your_salt_key`
     - `PHONEPE_SALT_INDEX=1`
     - `PHONEPE_ENV=PRODUCTION`

3. **Build Process**:
   - Hostinger will run `npm install` and `npm run build`.
   - The `server.ts` is configured to serve the `dist` folder in production.

4. **PhonePe Configuration**:
   - To enable real payments, ensure your PhonePe environment variables are correctly set in the Hostinger dashboard.
   - Ensure the `PHONEPE_CALLBACK_URL` matches your domain (e.g., `https://yourdomain.com/api/checkout/phonepe/callback`).

## Development
```bash
npm install
npm run dev
```

## License
Apache-2.0
