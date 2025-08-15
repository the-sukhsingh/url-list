
# 🔗 URL List

### Share Many Links in One Link

*A modern, beautiful web application for creating and sharing link collections with custom URLs*

[![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

---

**Transform the way you share links** • Create beautiful collections • Custom URLs • Rich previews

[🚀 Live Demo](#) • [📖 Documentation](#installation) • [🐛 Report Bug](../../issues) • [✨ Request Feature](../../issues)


## 🌟 What is URL List?

URL List is a sophisticated link management platform that revolutionizes how you share multiple links. Instead of overwhelming your audience with numerous URLs, create elegant, branded link collections accessible through a single memorable URL.

**Perfect for:**
- 📱 Social media bio links
- 📧 Email signatures
- 🎯 Marketing campaigns
- 📝 Resource sharing
- 🎓 Educational content
- 💼 Business presentations

## ✨ Key Features

### 🎨 **Beautiful Link Collections**
- Create stunning, responsive link pages
- Automatic website previews with rich metadata
- Custom themes and branding options
- Mobile-first, accessible design

### 🔐 **Smart Management**
- Secure user authentication system
- Public and private link collections
- Intuitive dashboard for easy management
- Drag & drop reordering

### ⚡ **Modern Technology**
- Built with Next.js 15 and App Router
- TypeScript for type safety
- MongoDB for reliable data storage
- Real-time URL preview generation

### 🛠️ **Developer Friendly**
- Clean, maintainable codebase
- Comprehensive API endpoints
- Easy deployment and scaling
- Extensive customization options

## 🏗️ Architecture & Tech Stack

<div align="center">

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | Next.js 15 + React 19 | Modern full-stack framework |
| **Language** | TypeScript | Type-safe development |
| **Database** | MongoDB + Mongoose | Document-based data storage |
| **Styling** | Tailwind CSS + DaisyUI | Utility-first styling framework |
| **Animations** | Framer Motion | Smooth, interactive animations |
| **Forms** | React Hook Form + Zod | Type-safe form validation |
| **Icons** | Lucide React + React Icons | Beautiful, consistent iconography |
| **Preview** | Puppeteer | Automatic URL metadata extraction |
| **Themes** | next-themes | Dark/light mode support |

</div>

## � Quick Start

### Prerequisites

- **Node.js** 18+ 
- **MongoDB** database (local or cloud)
- **Git** for version control

### Installation

1. **Clone & Setup**
   ```bash
   git clone https://github.com/the-sukhsingh/url-list.git
   cd url-list
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/urllist
   # or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/urllist
   
   # Authentication
   NEXTAUTH_SECRET=your-super-secret-key-here
   NEXTAUTH_URL=http://localhost:3002
   
   # Optional: Admin user
   ADMIN_EMAIL=admin@example.com
   ```

3. **Launch Development Server**
   ```bash
   npm run dev
   ```
   
   🎉 Open [http://localhost:3002](http://localhost:3002) in your browser

### Production Deployment

```bash
npm run build
npm start
```

## � Usage Guide

### Creating Your First Link Collection

1. **🔐 Authentication**
   - Sign up for a new account or log in
   - Access your personal dashboard

2. **📝 Create Collection**
   ```
   Dashboard → Create New Link
   ├── Choose unique slug (e.g., "my-resources")
   ├── Add title and description
   ├── Set visibility (public/private)
   └── Save collection
   ```

3. **🔗 Add Links**
   - Add multiple URLs to your collection
   - Automatic preview generation
   - Drag & drop to reorder

4. **🚀 Share**
   - Share your custom URL: `yoursite.com/my-resources`
   - Beautiful, responsive link page
   - Track engagement (coming soon)

### Managing Collections

| Action | Description |
|--------|-------------|
| **Edit** | Modify titles, descriptions, and URLs |
| **Reorder** | Drag & drop links to change order |
| **Visibility** | Toggle between public and private |
| **Delete** | Remove unwanted collections |
| **Duplicate** | Copy collections as templates |

## 📁 Project Structure

```
url-list/
├── 📂 src/
│   ├── 📂 app/                    # Next.js App Router
│   │   ├── 🏠 (app)/              # Protected application routes
│   │   │   ├── 📊 [id]/           # Dynamic link pages
│   │   │   ├── ✏️ edit/           # Link editing interface
│   │   │   └── 🔧 build/          # Link builder
│   │   └── 🔌 api/                # REST API endpoints
│   │       ├── 🔐 authorize/      # Authentication
│   │       ├── ✅ check-slug-unique/ # Slug validation
│   │       ├── 🔗 links/          # Link management
│   │       └── 📄 metadata/       # URL metadata
│   ├── 📦 components/             # Reusable UI components
│   │   ├── 🎨 sections/           # Page sections
│   │   └── 🧩 ui/                 # Base UI components
│   ├── 🪝 hooks/                  # Custom React hooks
│   ├── 📚 lib/                    # Core utilities & database
│   ├── 🗄️ model/                  # MongoDB schemas
│   └── 🛠️ utils/                  # Helper functions
├── 🌍 public/                     # Static assets
└── ⚙️ config files               # Configuration files
```

## 🎯 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/links` | GET/POST | Manage link collections |
| `/api/authorize` | POST | User authentication |
| `/api/check-slug-unique` | POST | Validate slug availability |
| `/api/metadata` | POST | Generate URL previews |

## 🧪 Development Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack on port 3002

# Production
npm run build        # Build optimized production bundle
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint for code quality
npm run type-check   # TypeScript type checking
```

## 🎨 Customization

### Themes & Styling
- Built with **Tailwind CSS** for easy customization
- **DaisyUI** components for consistent design
- Dark/light theme support with `next-themes`
- Responsive design patterns

### Environment Variables
```env
# Required
MONGODB_URI=             # Database connection
NEXTAUTH_SECRET=         # Authentication secret
NEXTAUTH_URL=           # Application URL

# Optional
ADMIN_EMAIL=            # Admin user email
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true  # Skip Chromium download
NODE_ENV=production     # Environment mode
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure environment variables in Vercel dashboard
```

### Docker
```dockerfile
# Dockerfile included in project
docker build -t url-list .
docker run -p 3002:3002 url-list
```

### Traditional Hosting
1. Build the project: `npm run build`
2. Upload `dist` folder to your hosting provider
3. Configure environment variables
4. Start with `npm start`

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup
1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/the-sukhsingh/url-list.git`
3. **Install** dependencies: `npm install`
4. **Create** a branch: `git checkout -b feature/amazing-feature`

### Contribution Guidelines
- 📝 Follow TypeScript best practices
- 🧪 Add tests for new features
- 📖 Update documentation
- 🎨 Follow existing code style
- ✅ Ensure all tests pass

### Pull Request Process
1. **Commit** changes: `git commit -m 'Add amazing feature'`
2. **Push** to branch: `git push origin feature/amazing-feature`
3. **Open** a Pull Request with detailed description
4. **Wait** for review and address feedback

## 🐛 Troubleshooting

### Common Issues

**Issue**: URL previews not generating
```bash
# Solution: Check Puppeteer installation
npm install puppeteer --save
```

**Issue**: Database connection errors
```bash
# Solution: Verify MongoDB URI and network access
# Check MongoDB Atlas IP whitelist if using cloud
```

**Issue**: Build failures
```bash
# Solution: Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### Getting Help
- � Check our [Documentation](../../wiki)
- 🐛 Report bugs in [Issues](../../issues)
- 💬 Join our [Discussions](../../discussions)
- 📧 Contact: [sukhaji65@gmail.com]

## 🛡️ Security

- 🔐 Secure authentication with NextAuth.js
- 🛡️ Input validation with Zod schemas
- 🔒 Environment variable protection
- 🚫 XSS and injection protection
- 📊 Rate limiting on API endpoints

## 📈 Roadmap

### 🎯 Current Version (v0.1.0)
- ✅ Basic link collections
- ✅ User authentication
- ✅ URL preview generation
- ✅ Responsive design

### � Upcoming Features
- [ ] 📊 **Analytics Dashboard** - Track clicks and engagement
- [ ] 🎨 **Custom Themes** - Personalized link page designs
- [ ] 📱 **QR Code Generator** - Quick mobile access
- [ ] 📤 **Bulk Import** - CSV/Excel link imports
- [ ] ⏰ **Link Expiration** - Time-based link management
- [ ] 👥 **Team Collaboration** - Shared collections
- [ ] 🔌 **API Access** - Third-party integrations
- [ ] 🌐 **Custom Domains** - White-label solutions

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License - feel free to use this project for personal and commercial purposes
```

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [DaisyUI](https://daisyui.com/) - Beautiful component library
- [MongoDB](https://www.mongodb.com/) - Document database
- [Vercel](https://vercel.com/) - Deployment platform

---



**🔗 Share Many Links in One Link**

*Made with ❤️ by [the-sukhsingh](https://github.com/the-sukhsingh)*

[⭐ Star this repo](../../stargazers) • [🐛 Report Issues](../../issues) • [🚀 View Releases](../../releases)
