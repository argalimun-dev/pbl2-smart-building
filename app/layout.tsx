import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "PBL 2 Smart Building",
  description: "Smart Memory Wall untuk menyimpan kenangan berharga Anda",
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
