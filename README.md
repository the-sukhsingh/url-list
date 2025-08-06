# URL List

A modern web application that allows you to **share many links in one link**. Create custom link collections with unique slugs and share them easily with others.

## 🚀 Features

- **Link Collections**: Create collections of multiple URLs under a single custom slug
- **User Authentication**: Secure sign-up and sign-in using NextAuth.js
- **Custom Slugs**: Create memorable, custom URLs for your link collections
- **Public/Private Links**: Control visibility of your link collections
- **URL Previews**: Automatic generation of website previews using Puppeteer
- **Responsive Design**: Beautiful, mobile-first design with Tailwind CSS and DaisyUI
- **Smooth Animations**: Enhanced user experience with Framer Motion animations
- **Dashboard**: Manage all your link collections from a centralized dashboard
- **Admin Panel**: Administrative features for managing users and links
- **Drag & Drop**: Reorder URLs within collections with intuitive drag-and-drop

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS + DaisyUI
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation
- **Web Scraping**: Puppeteer for URL previews
- **UI Components**: Lucide React icons

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- Git

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd url-list
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # NextAuth
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3002
   
   # Add any additional environment variables
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3002`

## 🚀 Usage

### Creating Link Collections

1. **Sign Up/Sign In**: Create an account or log in to your existing account
2. **Access Dashboard**: Navigate to your dashboard to manage link collections
3. **Create New Collection**: 
   - Click "Create New Link"
   - Choose a unique slug (URL identifier)
   - Add a title and description
   - Set visibility (public/private)
4. **Add URLs**: Add multiple URLs to your collection
5. **Share**: Share your custom URL (`yourdomain.com/your-slug`) with others

### Managing Collections

- **Edit**: Modify existing link collections, add/remove URLs
- **Reorder**: Drag and drop URLs to reorder them
- **Delete**: Remove unwanted collections
- **View Analytics**: Track usage and engagement (if implemented)

### Viewing Collections

- Visit `yourdomain.com/[slug]` to view any public link collection
- Each URL displays with automatic previews and metadata
- Clean, organized interface for easy navigation

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Protected app routes
│   │   ├── dashboard/     # User dashboard
│   │   └── link/edit/     # Link editing pages
│   ├── (auth)/            # Authentication pages
│   ├── (view)/            # Public link viewing pages
│   ├── admin/             # Admin panel
│   └── api/               # API routes
├── components/            # Reusable UI components
├── context/               # React context providers
├── lib/                   # Database and utility functions
├── model/                 # MongoDB/Mongoose models
└── utils/                 # Utility functions
```

## 🔧 Scripts

- `npm run dev` - Start development server with Turbopack on port 3002
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## 🌟 Key Features Explained

### URL Preview Generation
The application uses Puppeteer to automatically generate previews of websites, including:
- Page titles
- Meta descriptions
- Open Graph images
- Favicons

### Authentication System
Secure user management with:
- Email/password authentication
- Session management
- Protected routes
- User roles and permissions

### Responsive Design
- Mobile-first approach
- Smooth animations and transitions
- Dark/light theme support (via DaisyUI)
- Intuitive user interface

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Known Issues

- URL preview generation may be slower for some websites
- Some websites may block preview generation due to security policies

## 🔮 Future Enhancements

- [ ] Analytics and click tracking
- [ ] Bulk URL import
- [ ] Custom themes for link pages
- [ ] QR code generation
- [ ] Link expiration dates
- [ ] Team collaboration features
- [ ] API for third-party integrations

---

**Share Many Links In One Link** - Simplify your link sharing experience!