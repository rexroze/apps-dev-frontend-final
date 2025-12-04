'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { useRouter } from "next/navigation";
import Link from 'next/link'
import React from 'react'

function page() {
    const router = useRouter();
  return (
    <div>
      {/* Header */}
      <header className="bg-green-900 shadow-sm border-b max-h-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* <ShoppingBag className="w-6 h-6 text-primary" /> */}
              <Button
              variant="outline"
              className="mt-4 my-2"
              size="sm"
              onClick={() => router.push("/store")}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
              <h1 className="text-2xl font-bold text-yellow-500">My Cart</h1>
            </div>
            <Input
                  placeholder="Search..."
                  className="max-w-xl bg-white rounded-full m-4 p-4"
                />
            <div className="flex items-center gap-6">
              <Link href="/cart">
              <ShoppingCart className="text-secondary" /></Link>
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}

export default page
