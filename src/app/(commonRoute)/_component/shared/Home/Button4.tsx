"use client"
import { Button } from '@/components/ui/button'
import React from 'react'

export default function Button4() {
  return (
    <div className='flex gap-4'>
      <Button variant="outline">Book Now</Button>
      <Button variant="outline">Learn More</Button>
    </div>
  )
}