import Animation from '@/components/layout/Animation'
import DynamicContentSection from '@/components/layout/DynamiccontentSection'
import HomePage from '@/components/layout/HomePage'
import React from 'react'

export default function CentralPage() {
  return (
    <div>
      {/* <p>This is common layout</p> */}
      <Animation></Animation>
      <DynamicContentSection></DynamicContentSection>
      
    </div>
  )
}















// import HeroBanner from "./_component/shared/Home/Banner";


// export default function Page() {
//   return (
//     <div className="flex min-h-svh p-6">
//       <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        
//             <HeroBanner></HeroBanner>

//       </div>
//     </div>
//   )
// }