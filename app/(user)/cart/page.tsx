"use client"

import { Button } from '@/components/ui/button'
import SearchFilter from '@/components/ui/search-filter'
import { ArrowLeft, Plus, Minus, Trash } from 'lucide-react'
import CartButton from '@/components/cart/cart-button'
import { useCart } from '@/components/cart/cart-context'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useRouter } from "next/navigation";
import Link from 'next/link'
import React from 'react'
import { toast } from 'sonner'

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
            <SearchFilter />
            <div className="flex items-center gap-6">
              <CartButton />
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CartContents />
      </main>
    </div>
  )
}

function CartContents() {
  const { items, count, updateQuantity, removeItem, clear, addItem } = useCart();
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [removeId, setRemoveId] = React.useState<string | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = React.useMemo(() => {
    return items.reduce((s, it) => s + it.price * it.quantity, 0);
  }, [items]);

  const [selected, setSelected] = React.useState<Set<string>>(new Set(items.map((i) => i.id)));

  React.useEffect(() => {
    // Reset selection when items change (keep all selected by default)
    setSelected(new Set(items.map((i) => i.id)));
  }, [items]);

  const subtotalSelected = React.useMemo(() => {
    return items.filter((it) => selected.has(it.id)).reduce((s, it) => s + it.price * it.quantity, 0);
  }, [items, selected]);

  if (!mounted) {
    // Render a placeholder that matches server render to avoid hydration mismatch
    return <div className="min-h-[200px]" />;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:flex lg:items-start lg:gap-6">
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selected.size === items.length && items.length > 0}
              onChange={(e) => {
                if (e.target.checked) setSelected(new Set(items.map((i) => i.id)));
                else setSelected(new Set());
              }}
              className="cursor-pointer"
            />
            <h2 className="text-lg font-semibold">Cart ({count} items)</h2>
          </div>

          <div>
            <button className="text-sm text-red-600 cursor-pointer" onClick={() => setClearConfirmOpen(true)}>Clear</button>
            <Dialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clear cart?</DialogTitle>
                  <DialogDescription>Are you sure you want to clear your cart? This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    onClick={() => {
                      const backup = items.map(i => ({ ...i }));
                      clear();
                      toast.success(`Cart cleared`, {
                        action: {
                          label: 'Undo',
                          onClick: () => {
                            // restore items
                            backup.forEach(b => addItem({ id: b.id, name: b.name, price: b.price, image: b.image }, b.quantity));
                          }
                        }
                      });
                      setClearConfirmOpen(false);
                    }}
                  >
                    Clear Cart
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-4 bg-white p-4 rounded-md border">
              <input
                type="checkbox"
                checked={selected.has(it.id)}
                onChange={(e) => {
                  const next = new Set(selected);
                  if (e.target.checked) next.add(it.id);
                  else next.delete(it.id);
                  setSelected(next);
                }}
                className="cursor-pointer"
              />
              {it.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.image} alt={it.name} className="w-20 h-20 object-contain" />
              ) : (
                <div className="w-20 h-20 bg-gray-100" />
              )}
              <div className="flex-1">
                <div className="font-medium">{it.name}</div>
                <div className="text-sm text-gray-600">₱{it.price.toFixed(2)}</div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    aria-label={`Decrease ${it.name}`}
                    className="p-1 border rounded cursor-pointer"
                    onClick={() => {
                      if (it.quantity <= 1) {
                        // ask for confirmation instead of immediate remove
                        setRemoveId(it.id);
                      } else {
                        updateQuantity(it.id, it.quantity - 1);
                      }
                    }}
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    type="number"
                    value={it.quantity}
                    min={0}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value) || 0);
                      if (val === 0) {
                        // ask for confirmation instead of immediate remove
                        setRemoveId(it.id);
                      } else {
                        updateQuantity(it.id, val);
                      }
                    }}
                    className="w-20 p-1 border rounded text-center"
                  />

                  <button
                    aria-label={`Increase ${it.name}`}
                    className="p-1 border rounded cursor-pointer"
                    onClick={() => updateQuantity(it.id, it.quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  <button className="text-sm text-red-600 ml-2 cursor-pointer" onClick={() => setRemoveId(it.id)}>Remove</button>
                  <Dialog open={removeId === it.id} onOpenChange={(open) => { if (!open) setRemoveId(null); }}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Remove item?</DialogTitle>
                        <DialogDescription>Remove {it.name} from your cart?</DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={() => {
                          const removed = items.find(x => x.id === it.id);
                          if (removed) {
                            removeItem(it.id);
                            toast.success(`${removed.name} removed`, {
                              action: {
                                label: 'Undo',
                                onClick: () => {
                                  addItem({ id: removed.id, name: removed.name, price: removed.price, image: removed.image }, removed.quantity);
                                }
                              }
                            });
                          }
                          setRemoveId(null);
                        }}>Remove</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="text-right w-32">
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-lg font-semibold">₱{(it.price * it.quantity).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="w-full lg:w-80 bg-white p-4 rounded-md border">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Order Summary</h3>
          <p className="text-sm text-gray-600">{items.length} line item(s)</p>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Selected Subtotal</span>
          <span className="font-semibold">₱{subtotalSelected.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-600">Shipping</span>
          <span className="font-semibold">₱0.00</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <span className="text-base">Total</span>
          <span className="text-xl font-bold">₱{subtotalSelected.toFixed(2)}</span>
        </div>

        <button
          className="w-full bg-primary text-white py-2 rounded-md disabled:opacity-60"
          disabled={selected.size === 0 || isCheckingOut}
          onClick={async () => {
            setIsCheckingOut(true);
            try {
              // Call a dummy checkout endpoint in the frontend app
              const selectedItems = items.filter((it) => selected.has(it.id));
              const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: selectedItems }),
              });
              if (res.ok) {
                // For now just clear the cart and show success
                // remove only selected items from cart
                selectedItems.forEach((si) => removeItem(si.id));
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { toast } = require("sonner");
                toast.success("Checkout (dummy) successful");
              } else {
                const { toast } = require("sonner");
                toast.error("Checkout failed");
              }
            } catch (err) {
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const { toast } = require("sonner");
              toast.error("Checkout error");
            } finally {
              setIsCheckingOut(false);
            }
          }}
        >
          {isCheckingOut ? "Processing..." : "Checkout (Dummy)"}
        </button>
      </aside>
    </div>
  );
}

export default page
