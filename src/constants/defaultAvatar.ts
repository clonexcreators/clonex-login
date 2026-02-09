// Default Avatar - Base64 encoded SVG for fallback avatar
// This prevents 404 errors when no avatar is set

// Simple CloneX-themed avatar: a stylized "C" in a circle with gradient
export const DEFAULT_AVATAR = `data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ec4899"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="48" fill="url(#bg)" stroke="#1c1c1c" stroke-width="2"/>
  <text x="50" y="65" text-anchor="middle" fill="white" font-family="Arial Black" font-size="40" font-weight="bold">C</text>
</svg>
`)}`;

// Alternative: Simple pink circle with white silhouette
export const DEFAULT_AVATAR_SIMPLE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iI2VjNDg5OSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik0yNSA4NSBRMjUgNjAgNTAgNjAgUTc1IDYwIDc1IDg1IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==';
