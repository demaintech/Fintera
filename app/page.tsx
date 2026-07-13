import About from '@/components/About'
import Features from '@/components/Features'
import Hero from '@/components/Hero'
import React from 'react'

const page = () => {
  return (
    <div className='w-full flex flex-col'>
      <Hero />
      <About />
      <Features />
    </div>
  )
}

export default page