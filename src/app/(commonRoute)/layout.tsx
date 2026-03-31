import Footer from "./_component/shared/footer/Footer";
import Navbar from "./_component/shared/Navbar/Navbar";

export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer></Footer>
    </div>
  );
}