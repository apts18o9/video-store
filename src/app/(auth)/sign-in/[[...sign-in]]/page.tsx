import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (


    <section className='h-screen flex justify-center'>
        <div className='mt-12'>
          <SignIn />
        </div>
    </section>
  )
}