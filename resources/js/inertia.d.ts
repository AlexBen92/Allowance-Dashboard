declare module '@inertiajs/react' {
  interface PageProps {
    
    auth?: {
      user: {
        id: number
        name: string
        email: string
      }
    }
    
    allowances?: Array<{
      id: number
      address: string
      token: string
      allowance: string
      created_at: string
      updated_at: string
    }>
  }
} 