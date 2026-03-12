:root {
  --accent-color: #2d6a4f;
  --bg-color: #f9f9f9;
  --card-shadow: 0 4px 15px rgba(0,0,0,0.08);
}

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-color);
}

/* Navbar */
.navbar {
  padding: 15px 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  border-bottom: 1px solid #eee;
  box-sizing: border-box;
}

.brand-name {
  font-size: 1.5rem;
  font-weight: 800;
  text-decoration: none;
  color: #1a1a1a;
}

.brand-name span { color: var(--accent-color); }

.nav-links a {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  margin-left: 20px;
}

/* Centered Hero Header */
.category-hero {
  margin-top: 60px;
  height: 300px;
  background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), 
              url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
}

.underline {
  width: 50px;
  height: 4px;
  background: var(--accent-color);
  margin: 15px auto;
}

/* Smaller Gallery Images (5 Columns) */
.gallery {
  column-count: 5;
  column-gap: 15px;
  padding: 30px 5%;
  max-width: 1600px;
  margin: 0 auto;
}

.item {
  break-inside: avoid;
  margin-bottom: 15px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
  transition: transform 0.3s ease;
}

.item:hover { transform: translateY(-5px); }

.image-button {
  border: none;
  background: none;
  padding: 0;
  width: 100%;
  cursor: pointer;
}

.image-button img { width: 100%; display: block; }

.info-panel { padding: 10px; text-align: left; }

.info-panel h6 {
  margin: 0;
  font-size: 0.85rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-panel p {
  margin: 3px 0 0;
  font-size: 0.7rem;
  color: #999;
}

#loader { text-align: center; padding: 40px; color: #ccc; }

/* Responsive adjustments */
@media (max-width: 1200px) { .gallery { column-count: 4; } }
@media (max-width: 900px) { .gallery { column-count: 3; } }
@media (max-width: 600px) { .gallery { column-count: 2; } }:root {
  --accent-main: #2d6a4f;
  --bg-light: #f8f9fa;
  --skeleton-base: #e0e0e0;
  --skeleton-highlight: #f5f5f5;
}

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-light);
  color: #333;
}

/* --- Masonry Grid Layout --- */
.gallery {
  column-count: 5;
  column-gap: 20px;
  padding: 30px 5%;
  max-width: 1600px;
  margin: 0 auto;
}

@media (max-width: 1200px) { .gallery { column-count: 4; } }
@media (max-width: 900px) { .gallery { column-count: 3; } }
@media (max-width: 600px) { .gallery { column-count: 2; } }

/* --- The Image Card --- */
.item {
  break-inside: avoid;
  margin-bottom: 20px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: transform 0.3s cubic-bezier(0.2, 0, 0.2, 1);
  position: relative;
}

.item:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
}

/* --- Image & Skeleton Loading --- */
.image-container {
  position: relative;
  width: 100%;
  background-color: var(--skeleton-base); /* Block color before load */
  overflow: hidden;
}

/* The shimmering effect */
.skeleton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
              var(--skeleton-base) 25%, 
              var(--skeleton-highlight) 50%, 
              var(--skeleton-base) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

@keyframes shimmer {
  from { background-position: -200% 0; }
  to { background-position: 200% 0; }
}

.item img {
  width: 100%;
  display: block;
  opacity: 0; /* Hidden until loaded */
  transition: opacity 0.5s ease-in-out;
}

.item img.loaded {
  opacity: 1;
}

.item img.loaded + .skeleton {
  display: none; /* Remove shimmer when image is ready */
}

/* --- Info Panel --- */
.info-panel {
  padding: 15px;
  background: white;
}

.info-panel h6 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.info-panel p {
  margin: 5px 0 0;
  font-size: 0.75rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}