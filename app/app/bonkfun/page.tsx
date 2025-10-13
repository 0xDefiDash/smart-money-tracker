
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Info } from 'lucide-react'

export default function BonkfunPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto mt-20">
          <CardContent className="p-8 text-center">
            <Info className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Bonk.fun Tracker Removed</h1>
            <p className="text-muted-foreground">
              This tracker has been removed from the application. Please use other available tracking features from the sidebar.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
