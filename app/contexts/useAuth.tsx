'use client'
import { createContext, useContext, useState } from 'react'

// Create the context
interface AppContextType {
  user: any
  login: (userData: any) => void
  logout: () => void
  theme: string
  toggleTheme: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Create a provider component
import { ReactNode } from 'react'

export function AppProvider({ children }: { children: ReactNode }) {
  const [user,setUser]=useState();
  

  

  return (
    <AppContext.Provider value={(user)}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook for consuming the context
export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}
