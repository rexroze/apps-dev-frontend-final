# Frontend Application

A modern e-commerce frontend built with Next.js, featuring authentication, product browsing, shopping cart, order management, and admin dashboard.

## 🚀 Features

- **User Authentication**
  - Email/Password login and signup
  - OAuth integration (Google & GitHub)
  - Email verification
  - Protected routes
  - Token refresh mechanism

- **Product Management**
  - Product browsing with search and filters
  - Category filtering
  - Product details page
  - Product images
  - Product reviews and ratings

- **Shopping Experience**
  - Shopping cart (persistent across sessions)
  - Add to cart functionality
  - Cart quantity management
  - Checkout process
  - Order history

- **Admin Dashboard**
  - Product CRUD operations
  - Sales analytics and charts
  - Order management
  - User management

- **UI/UX**
  - Responsive design
  - Dark mode support
  - Modern, clean interface
  - Toast notifications
  - Loading states

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: SWR (for data fetching)
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running (see backend README)

## 🔧 Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root of the `frontend` directory:

   ```env
   # Backend API URL
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

   For production:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-api.vercel.app
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Auth-related pages (login, signup, etc.)
│   ├── (dashboard)/        # Dashboard pages
│   ├── api/                 # API routes
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── auth/               # Authentication components
│   ├── products/           # Product-related components
│   ├── cart/               # Shopping cart components
│   ├── orders/             # Order components
│   └── sales/              # Admin sales components
├── services/                # API service functions
├── hooks/                   # Custom React hooks
├── lib/                     # Utility libraries
│   ├── axios.ts            # Axios instance with interceptors
│   └── swr-fetcher.ts      # SWR fetcher configuration
├── types/                   # TypeScript type definitions
├── utils/                   # Utility functions
├── public/                  # Static assets
└── package.json
```

## 🎨 Key Features Explained

### Authentication Flow
- Users can sign up with email/password or OAuth
- Email verification required for email/password accounts
- JWT tokens stored in localStorage
- Automatic token refresh on expiration
- Protected routes redirect to login if unauthenticated

### Shopping Cart
- Cart items persist in database (tied to user account)
- Real-time cart updates
- Quantity management
- Cart persists across devices for logged-in users

### Admin Features
- Role-based access control
- Product management (create, edit, delete)
- Sales analytics with charts
- Order overview

## 🚢 Deployment

### Deploying to Vercel

1. **Push your code to GitHub**

2. **Import project to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as the root directory

3. **Configure environment variables**
   - In Vercel project settings, add:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-api.vercel.app
     ```

4. **Deploy**
   - Vercel will automatically detect Next.js
   - Click "Deploy"
   - Your app will be live at `https://your-project.vercel.app`

### Vercel Configuration

Vercel automatically detects Next.js projects. However, you can create a `vercel.json` for custom configuration:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### Production Checklist

- [ ] Update `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Ensure backend CORS allows your frontend domain
- [ ] Update OAuth redirect URIs in Google/GitHub settings
- [ ] Test all authentication flows
- [ ] Verify API connections
- [ ] Check image optimization settings
- [ ] Test responsive design on multiple devices

## 🔐 Environment Variables

### Development
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Production
```env
NEXT_PUBLIC_API_URL=https://your-backend-api.vercel.app
```

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put sensitive data in these variables.

## 🎯 Key Pages

- `/` - Home page with product listings
- `/login` - User login
- `/signup` - User registration
- `/products` - Product browsing
- `/products/[id]` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout process
- `/orders` - Order history
- `/dashboard` - Admin dashboard (Admin only)
- `/dashboard/products` - Product management (Admin only)
- `/dashboard/sales` - Sales analytics (Admin only)

## 🐛 Troubleshooting

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check if backend server is running
- Verify CORS settings on backend

### OAuth Issues
- Ensure OAuth callback URLs are configured correctly
- Check that redirect URIs match in OAuth provider settings
- Verify backend OAuth routes are accessible

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build`

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [SWR Documentation](https://swr.vercel.app/)
- [Vercel Deployment Guide](https://vercel.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

ISC
