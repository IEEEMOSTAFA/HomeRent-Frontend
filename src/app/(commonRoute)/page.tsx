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

