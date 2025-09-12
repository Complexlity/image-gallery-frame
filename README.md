# 🖼️ Farcaster Image Gallery Frames

A powerful gallery application that allows users to create interactive image galleries that can be shared and viewed as Farcaster Frames. Users can upload multiple images, customize the gallery appearance, and share it as a Farcaster Frame that can be interacted with directly on the Farcaster (https://www.farcaster.xyz/) platform.

## ✨ Features

- Upload up to 5 images per gallery
- Customize gallery appearance (title, button texts, frame size)
- Interactive navigation between images
- Generate shareable Farcaster Frame links
- Responsive design for all devices
- Fast and efficient image upload

## 🚀 Live Demo

Check out the live demo at: [https://frames-gallery.vercel.app/](https://frames-gallery.vercel.app/)

## 🏗️ Project Structure

```
.
├── app/                    # Next.js app directory
│   ├── gallery/            # Gallery pages
│   │   └── [id]/           # Dynamic route for individual galleries
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
├── components/             # Reusable components
│   ├── copy-button.tsx     # Copy to clipboard component
│   ├── create-gallery-form.tsx  # Form for creating galleries
│   ├── galleries.tsx       # Gallery display component
│   └── navbar.tsx          # Navigation bar
├── pages/
│   ├── api/                # API routes
│   │   ├── toggle.ts       # Toggle gallery state
│   │   ├── upload-gallery.ts # Handle gallery uploads
│   │   └── uploadthing.ts  # UploadThing configuration
│   └── share/              # Share pages
│       └── [id].tsx        # Shared gallery view
├── public/                 # Static assets
├── server/                 # Server-side utilities
│   └── uploadthing.ts      # File upload configuration
├── utils/                  # Utility functions
│   ├── constants.ts        # Application constants
│   ├── lib.ts              # Helper functions
│   └── uploadthing.ts      # UploadThing client config
├── .env.example           # Example environment variables
└── package.json           # Project dependencies
```

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **File Uploads**: [UploadThing](https://uploadthing.com/)
- **Database**: [Vercel KV](https://vercel.com/storage/kv)
- **UI Components**: [Lucide Icons](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/)
- **Package Manager**: [Bun](https://bun.sh/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and Bun installed
- A [Vercel](https://vercel.com/) account for deployment
- A [Farcaster](https://www.farcaster.xyz/) account (for testing frames)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/image-gallery-frame.git
   cd image-gallery-frame
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then, update the `.env.local` file with your credentials:
   ```
   # UploadThing (https://uploadthing.com/)
   UPLOADTHING_SECRET=your_uploadthing_secret
   UPLOADTHING_APP_ID=your_uploadthing_app_id
   
   # Vercel KV (https://vercel.com/storage/kv)
   KV_URL=your_vercel_kv_url
   KV_REST_API_URL=your_vercel_kv_rest_url
   KV_REST_API_TOKEN=your_vercel_kv_rest_token
   KV_REST_API_READ_ONLY_TOKEN=your_vercel_kv_readonly_token
   
   # App URL (for generating shareable links)
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Environment (development/production)
   NODE_ENV=development
   ```

4. **Run the development server**
   ```bash
   bun run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

