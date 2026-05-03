import React from 'react'
import Image from 'next/image'
import ProjectsForm from '@/modules/home/components/project-form'
import { Button } from '@/components/ui/button'
// import {inngest} from '@/inngest/client'
import { onInvoke } from '@/modules/home/actions'


const Page = () => {

  // const onInvoke=async()=>{
  //   await inngest.send({
  //     name:'agent/hello'
  //   })
  // }

  return (
    <div className='flex items-center justify-center w-full px-4 py-8'>

      {/* <Button onClick={onInvoke} >
        Invoke AI Agent
      </Button> */}
       <div className='max-w-5xl w-full'>
        <section className='space-y-8 flex flex-col items-center'>

          <div className='flex flex-col items-center'>
            <Image 
              src={'/logo.svg'}
              width={100}
              height={100}
              alt='logo'
              className='hidden md:block invert dark:invert-0' />
          </div>

          <h1 className='text-2xl md:text-5xl font-bold text-center'>Build Something with ❤️</h1>
          <p className='text-lg md:text-5xl text-muted-foreground text-center'>
            Create apps and websites by chatting with AI
          </p>

          <div className='max-w-3xl w-full'>
            <ProjectsForm/>
          </div>

        </section>
       </div>
    </div>
  )
}

export default Page