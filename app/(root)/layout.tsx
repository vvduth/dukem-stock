import Header from '@/components/Header'
import React from 'react'
import {auth } from '@/lib/better-auth/auth'
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const user = {
    email: session.user.email!,
    name: session.user.name!,
    id: session.user.id!
  }
  return (
    <main className='min-h-screen text-gray-400'>
        {/* header goes here */}
        <Header  user={user}/>
        <div className='container py-10'>
            {children}
        </div>
    </main>
  )
}

export default RootLayout
