# Frontend Application

A modern e-commerce frontend built with Next.js, featuring authentication, product browsing, shopping cart, order management, and admin dashboard.

## 🚀 Features

### User Authentication
- **Multi-Provider Login**
  - Email/Password with email verification
  - Google OAuth integration
  - GitHub OAuth integration
- **Token Management**
  - JWT access tokens (stored in localStorage)
  - Automatic token refresh on expiration
  - Axios interceptors for seamless refresh
- **Route Protection**
  - Protected routes with authentication check
  - Role-based access control (USER/ADMIN)
  - Automatic redirect to login when unauthenticated

### Product Management
- **Customer Features**
  - Product browsing with pagination
  - Search functionality (by product name)
  - Category filtering
  - Product detail pages with full information
  - Product images display
  - Product reviews and ratings display
- **Admin Features**
  - Full CRUD operations (Create, Read, Update, Delete)
  - Soft delete and restore products
  - Bulk product management
  - Category assignment

### Shopping Experience
- **Shopping Cart**
  - Persistent cart (stored in database)
  - Add to cart functionality
  - Quantity management (increase/decrease)
  - Remove items from cart
  - Real-time cart updates
  - Cart syncs across devices
- **Checkout Process**
  - Secure checkout flow
  - Payment integration (Xendit)
  - Order confirmation
- **Order Management**
  - Order history for users
  - Order details view
  - Order status tracking

### Admin Dashboard
- **Product Management**
  - Create, edit, delete products
  - Product table with sorting and filtering
  - Bulk operations
- **Sales Analytics**
  - Revenue charts and statistics
  - Order trends visualization
  - Sales data tables
- **Order Management**
  - View all orders from all users
  - Order details and management
- **Category Management**
  - Create, update, delete categories
  - Category assignment to products

### UI/UX Features
- **Responsive Design**
  - Mobile-first approach
  - Works on all screen sizes
- **Dark Mode**
  - System preference detection
  - Manual theme toggle
  - Persistent theme preference
- **User Experience**
  - Toast notifications for actions
  - Loading states and spinners
  - Optimistic UI updates
  - Error handling with user-friendly messages
  - Smooth transitions and animations

## 🛠️ Tech Stack

### Core Framework
- **Next.js 16**: React framework with App Router
- **React 19**: UI library with latest features
- **TypeScript 5**: Type-safe development

### Styling & UI
- **Tailwind CSS 4**: Utility-first CSS framework
- **Radix UI**: Accessible, unstyled component primitives
  - Dialog, Select, Avatar, Label, Separator
- **Lucide React**: Icon library
- **next-themes**: Dark mode support

### Data Fetching & State
- **SWR 2.3**: Data fetching with caching and revalidation
- **Axios 1.13**: HTTP client with interceptors
- **React Context API**: Global state (auth, cart, theme)

### Forms & Validation
- **React Hook Form 7.66**: Performant form handling
- **Zod 4.1**: Schema validation with TypeScript inference
- **@hookform/resolvers**: Zod integration for React Hook Form

### Charts & Visualization
- **Recharts 3.5**: Composable charting library for admin analytics

### Notifications
- **Sonner 2.0**: Toast notification library

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
├── app/                      # Next.js App Router (Next.js 16)
│   ├── (auth)/              # Auth route group
│   │   ├── login/          # Login page
│   │   ├── signup/         # Signup page
│   │   ├── verify-email/   # Email verification
│   │   └── oauth-callback/ # OAuth callback handler
│   ├── (index)/            # Home route group
│   │   └── page.tsx        # Home page
│   ├── (user)/             # User route group
│   │   ├── store/          # Product store (browse products)
│   │   │   ├── [id]/       # Product detail page
│   │   │   └── page.tsx    # Product listing
│   │   ├── cart/           # Shopping cart
│   │   ├── orders/        # Order history
│   │   └── wishlist/      # Wishlist
│   ├── admin/              # Admin dashboard
│   │   ├── products/      # Product management
│   │   ├── orders/        # Order management
│   │   ├── sales/         # Sales analytics
│   │   ├── categories/    # Category management
│   │   └── users/         # User management
│   ├── checkout/           # Checkout page
│   ├── orders/             # Orders page (alternative route)
│   ├── api/                # Next.js API routes
│   │   └── checkout/      # Checkout API route
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── auth/              # Authentication components
│   │   ├── contexts/      # Auth context provider
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   ├── oauth-buttons.tsx
│   │   ├── protected-route.tsx
│   │   └── schemas/       # Zod validation schemas
│   ├── product/           # Product components
│   │   ├── products-client.tsx
│   │   ├── product-detail-client.tsx
│   │   ├── admin-products-page.tsx
│   │   └── schemas/       # Product validation schemas
│   ├── cart/              # Shopping cart components
│   │   ├── cart-context.tsx
│   │   └── cart-button.tsx
│   ├── orders/            # Order components
│   │   ├── orders-client.tsx
│   │   └── admin-orders-page.tsx
│   ├── review/            # Review components
│   │   ├── review-list.tsx
│   │   ├── review-form.tsx
│   │   └── star-rating.tsx
│   ├── sales/             # Admin sales components
│   │   └── admin-sales-page.tsx
│   ├── admin/             # Admin layout
│   │   └── admin-layout.tsx
│   ├── wishlist/         # Wishlist components
│   ├── category/         # Category components
│   ├── ui/               # Reusable UI components (Radix UI)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── form.tsx
│   │   └── ...
│   ├── header.tsx        # Main navigation header
│   └── theme-provider.tsx # Dark mode provider
├── services/              # API service functions
│   └── (API client functions for each resource)
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── axios.ts          # Axios instance with interceptors
│   └── swr-fetcher.ts    # SWR fetcher configuration
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── public/                # Static assets
└── package.json
```

## 🎨 Key Features Explained

### Authentication Flow
- **Multi-Provider Support**: Email/password, Google OAuth, GitHub OAuth
- **Email Verification**: Required for email/password accounts before login
- **Token Management**: 
  - JWT access tokens stored in localStorage
  - Refresh tokens stored in database
  - Automatic token refresh via Axios interceptors (catches 401, refreshes, retries)
- **Protected Routes**: 
  - `ProtectedRoute` component wraps protected pages
  - Redirects to login if unauthenticated
  - Role-based route protection for admin pages
- **OAuth Flow**: 
  - Redirects to provider → callback to backend → temp token → frontend exchanges for JWT

### Shopping Cart
- **Persistent Storage**: Cart items stored in database (not just localStorage)
- **Real-time Updates**: SWR for automatic revalidation and cache updates
- **Context Management**: React Context API for global cart state
- **Cross-Device Sync**: Cart persists across devices for logged-in users
- **Quantity Management**: Add, update, remove items with optimistic updates

### Product Browsing
- **Search & Filters**: Search by name, filter by category
- **Product Details**: Full product information with images and reviews
- **Reviews & Ratings**: Display reviews with star ratings, average rating
- **Responsive Design**: Mobile-friendly product cards and layouts

### Admin Dashboard
- **Product Management**: 
  - Full CRUD operations (Create, Read, Update, Delete)
  - Soft delete and restore functionality
  - Bulk operations support
- **Sales Analytics**: 
  - Charts using Recharts library
  - Revenue statistics
  - Order trends
- **Order Management**: 
  - View all orders from all users
  - Order details and status
- **Category Management**: 
  - Create, update, delete categories
  - Category assignment to products

### State Management
- **SWR**: Server state management (products, orders, cart)
  - Automatic caching
  - Background revalidation
  - Error handling
- **React Context**: Client state (auth, cart, theme)
- **React Hook Form**: Form state management with validation

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

### Public Pages
- `/` - Home page with product listings
- `/store` - All products with search and filters
- `/store/[id]` - Product details page with reviews

### Authentication Pages
- `/login` - User login (email/password or OAuth)
- `/signup` - User registration
- `/verify-email` - Email verification page
- `/oauth-callback` - OAuth callback handler

### User Pages (Authentication Required)
- `/cart` - Shopping cart management
- `/checkout` - Checkout process
- `/orders` - User's order history
- `/wishlist` - User wishlist (if implemented)

### Admin Pages (Authentication + ADMIN Role Required)
- `/admin/products` - Product management (CRUD operations)
- `/admin/orders` - All orders management
- `/admin/sales` - Sales analytics with charts
- `/admin/categories` - Category management
- `/admin/users` - User management (if implemented)

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
