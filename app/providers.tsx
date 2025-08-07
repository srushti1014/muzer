"use client"

import { WebSocketInit } from '@/lib/websinit'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

const Providers = ({children} : {
    children: React.ReactNode
}) => {
  WebSocketInit()
  return (
    <SessionProvider> 
        {children}
    </SessionProvider>
  )
}

export default Providers