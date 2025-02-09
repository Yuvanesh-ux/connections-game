// app/layout.js
import "./globals.css";

export const metadata = {
  title: "Connections Game",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
