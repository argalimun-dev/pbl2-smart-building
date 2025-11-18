import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "CV. Bangunan Cerdas Indonesia",
  description: "Smart Project Wall untuk menyimpan Project berharga Anda",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-100 min-h-screen">
        <Navbar />
        <main className="pt-6">{children}</main>
      </body>
    </html>
  );
}
