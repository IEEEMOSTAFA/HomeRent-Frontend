import Footer from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import React from 'react'

export default function CommonLayout({
    children,
}: {
    children: React.ReactNode
}) {
  return (
    <div>
       <Navbar></Navbar>
       {children}
        <Footer></Footer>
        
      
    </div>
  )
}

















// import Footer from "./_component/shared/Footer/footer";
// import Navbar from "./_component/shared/Navbar/Navbar";

// export default function CommonLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <div className="flex flex-col min-h-screen">
//       <Navbar />
//       <main className="flex-1">
//         {children}
//       </main>
//       <Footer></Footer>
//     </div>
//   );
// }