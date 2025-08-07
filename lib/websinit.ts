'use client'
import { useEffect } from 'react'

export function WebSocketInit() {
  useEffect(() => {
    fetch('/api/socket') 
  }, [])

  return null
}
