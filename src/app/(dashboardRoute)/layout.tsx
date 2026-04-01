import Footer from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
// import { Navbar } from '@/components/layout/Navbar'
import React from 'react'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
  return (
    <div>
       {/* <Navbar></Navbar> */}
       <Navbar></Navbar>
       {children}
        {/* <Footer></Footer> */}
        
      
    </div>
  )
}