import { motion } from 'motion/react'
import Container from '../Container'
import React from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import FlipLink from '../text-effect-flipper'
const Hero = () => {

  const { status} = useSession();

  const borderVariant = {
    initial: {
      opacity: 0,
      height: '0px',
    },
    animate: {
      opacity: 1,
      height: '100vh',
      transition: {
        duration: 1,
        ease: "easeOut" as const,
        
      },
    },
  }

  const underLineVariant = {
    initial: {
      opacity: 0,
      width: '0px',
    },
    animate: {
      opacity: 1,
      width: '100%',
      transition: {
        duration: 1,
        ease: "easeOut" as const,
      },
    },
  }

  const titleVariant = {
    initial: {
      opacity: 0,
      y: -50,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: "easeOut" as const,
      },
    },
  }


  return (<>
    <Container className='relative flex flex-col gap-8 justify-center items-center h-screen'>

      <motion.div variants={borderVariant} initial="initial" animate="animate" className='h-screen w-px bg-gradient-to-b from-transparent via-primary to-transparent absolute -left-4 overflow-y-hidden'>

      </motion.div>
       <motion.div variants={borderVariant} initial="initial" animate="animate" className='h-screen w-px bg-gradient-to-b from-transparent via-primary to-transparent absolute -right-4'>
            </motion.div>


      <motion.div variants={titleVariant} initial="initial" animate="animate" className=' relative'>
        <div className='text-4xl md:text-7xl font-bitcount text-center text-gray-800 dark:text-gray-100 flex flex-col gap-4 mb-4'>
          <div className='flex justify-center '>
              <FlipLink>
              Share
              </FlipLink>
              <FlipLink className='text-primary'>
                Many
              </FlipLink>
              <FlipLink>
                Links
              </FlipLink>

          </div>
          <div className='flex justify-center'>
              <FlipLink>
                In
              </FlipLink>
              <FlipLink className='text-primary'>
                One
              </FlipLink>
              <FlipLink>
                Link
              </FlipLink>

          </div>
        </div>
      <motion.div variants={underLineVariant} initial="initial" animate="animate" className='h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent absolute -bottom-2 left-0 right-0'>
      </motion.div>


      </motion.div>
      <motion.div variants={titleVariant} initial="initial" animate="animate" className='flex '>
        <Link href={status === 'authenticated' ? '/dashboard' : '/sign-in'}>
          <motion.button className='btn btn-primary hover:-skew-4 transition-transform duration-100 perspective-dramatic transform-3d' type='button'>
            {status === 'authenticated' ? 'Go to Dashboard' : 'Get Started'}
          </motion.button>
        </Link>
      </motion.div>


    </Container>
  </>
  )
}

export default Hero