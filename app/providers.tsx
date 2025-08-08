"use client"

import { SocketContextProvider } from '@/context/socket-con'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

const Providers = ({children} : {
    children: React.ReactNode
}) => {
  return (
    <SessionProvider> 
      <SocketContextProvider>
        {children}
      </SocketContextProvider>
    </SessionProvider>
  )
}

export default Providers