# ✨ PureClear - White Background Remover

A premium, client-side web application to instantly remove white backgrounds from images and make them transparent.

![Demo](https://via.placeholder.com/800x400/050505/ffffff?text=PureClear+Interface) <!-- Replace with actual screenshot if possible -->

## 🚀 How to use
1. **Upload**: Drag and drop an image (JPG, PNG, WebP) with a white background.
2. **Adjust**: Use the **White Tolerance** slider to fine-tune the removal. Higher tolerance removes shades that are close to white.
3. **Download**: Save your transparent result as a high-quality PNG.

## 🛠️ Built with
- **HTML5 Canvas API**: High-performance pixel manipulation.
- **Vanilla JavaScript**: Lightweight and dependency-free.
- **CSS3**: Modern glassmorphism design with dark mode.

## 📦 How to Publish to GitHub Pages (github.io)

This project is a static website, making it perfect for GitHub Pages.

1. **Create a GitHub Repository**: 
   - Go to [GitHub](https://github.com/new) and create a new repository (e.g., `web-bg-remover`).
2. **Upload Files**:
   - Push your files (`index.html`, `style.css`, `app.js`) to the repository.
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/web-bg-remover.git
   git push -u origin main
   ```
3. **Enable GitHub Pages**:
   - Go to your repository **Settings** on GitHub.
   - Click on **Pages** in the left sidebar.
   - Under **Build and deployment**, set **Source** to "Deploy from a branch".
   - Select the `main` branch and `/root` folder, then click **Save**.
4. **Access your site**:
   - Your site will be live at `https://YOUR_USERNAME.github.io/web-bg-remover/` in a few minutes!

## 🔒 Privacy
All processing happens locally in your browser. Your images are never uploaded to any server.

---
Built by [Antigravity](https://google.com) for ibrezmm.
