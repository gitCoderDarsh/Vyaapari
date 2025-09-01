"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Trash2, Eye, Download } from "lucide-react"
import { cn } from "@/lib/utils"

function currency(n) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n)
}

function randId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

const initialSales = [
  {
    id: randId("sale"),
    date: new Date().toISOString(),
    customerName: "Amit Sharma",
    products: [
      { id: randId("prod"), name: "Notebook", qty: 3, price: 120 },
      { id: randId("prod"), name: "Pen Set", qty: 2, price: 80 },
    ],
    total: 520,
    profit: 180,
    paymentStatus: "Paid",
    paymentMethod: "UPI",
    billNo: "INV-1001",
    discount: 20,
  },
  {
    id: randId("sale"),
    date: new Date(Date.now() - 86400000).toISOString(),
    customerName: "Priya Verma",
    products: [{ id: randId("prod"), name: "Desk Chair", qty: 1, price: 4500 }],
    total: 4500,
    profit: 900,
    paymentStatus: "Pending",
    paymentMethod: "Card",
    billNo: "INV-1002",
  },
  {
    id: randId("sale"),
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    customerName: "Rahul Singh",
    products: [
      { id: randId("prod"), name: "Mouse", qty: 2, price: 700 },
      { id: randId("prod"), name: "Keyboard", qty: 1, price: 1500 },
    ],
    total: 2900,
    profit: 600,
    paymentStatus: "Paid",
    paymentMethod: "Cash",
    billNo: "INV-1003",
    discount: 100,
  },
]

function getTopProductName(rows) {
  const counts = new Map()
  for (const r of rows) {
    for (const p of r.products) {
      counts.set(p.name, (counts.get(p.name) || 0) + p.qty)
    }
  }
  let top = ""
  let max = -1
  for (const [name, qty] of counts) {
    if (qty > max) {
      top = name
      max = qty
    }
  }
  return top || "—"
}

function CreateBillDialog({
  onAddSale,
}) {
  const [open, setOpen] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [discount, setDiscount] = useState("")
  const [products, setProducts] = useState([{ id: randId("prod"), name: "", qty: 1, price: 0 }])

  const subtotal = useMemo(() => products.reduce((sum, p) => sum + p.qty * p.price, 0), [products])
  const discountNum = Number(discount) || 0
  const finalTotal = Math.max(0, subtotal - discountNum)

  function updateProduct(id, patch) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  function addProduct() {
    setProducts((prev) => [...prev, { id: randId("prod"), name: "", qty: 1, price: 0 }])
  }

  function removeProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  function handleSave() {
    if (!customerName.trim() || products.length === 0) {
      alert("Please add a customer name and at least one product.")
      return
    }
    const cleanProducts = products.filter((p) => p.name.trim() && p.qty > 0 && p.price >= 0)
    if (cleanProducts.length === 0) {
      alert("Please add valid products (name, qty > 0).")
      return
    }
    const now = new Date()
    const newRow = {
      id: randId("sale"),
      date: now.toISOString(),
      customerName,
      products: cleanProducts,
      total: finalTotal,
      profit: Math.round(finalTotal * 0.2), // mock profit
      paymentStatus: "Paid",
      paymentMethod,
      billNo: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
      discount: discountNum || undefined,
    }
    onAddSale(newRow)
    setOpen(false)
    // reset
    setCustomerName("")
    setPaymentMethod("Cash")
    setDiscount("")
    setProducts([{ id: randId("prod"), name: "", qty: 1, price: 0 }])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Generate Bill
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "bg-gray-800 text-white border-0 p-0",
          "sm:max-w-[720px] sm:rounded-2xl",
          "max-sm:w-[95vw] max-sm:h-[95vh] max-sm:rounded-2xl",
        )}
      >
        <div className="p-6 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-white">Generate Bill</DialogTitle>
            <DialogDescription className="text-gray-300">
              Fill in customer details and products. Frontend-only; no server calls.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm text-gray-300">Customer Name</label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className="bg-gray-700 border-0 text-white placeholder:text-gray-400"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-gray-300">Products</label>
              <div className="space-y-3">
                {products.map((p) => (
                  <div key={p.id} className="grid grid-cols-1 sm:grid-cols-5 gap-2 bg-gray-700 p-3 rounded-xl">
                    <Input
                      value={p.name}
                      onChange={(e) => updateProduct(p.id, { name: e.target.value })}
                      placeholder="Product name"
                      className="bg-gray-800 border-0 text-white placeholder:text-gray-400 sm:col-span-2"
                    />
                    <Input
                      type="number"
                      min={1}
                      value={p.qty}
                      onChange={(e) => updateProduct(p.id, { qty: Math.max(1, Number(e.target.value) || 1) })}
                      placeholder="Qty"
                      className="bg-gray-800 border-0 text-white placeholder:text-gray-400"
                    />
                    <Input
                      type="number"
                      min={0}
                      value={p.price}
                      onChange={(e) => updateProduct(p.id, { price: Math.max(0, Number(e.target.value) || 0) })}
                      placeholder="Price"
                      className="bg-gray-800 border-0 text-white placeholder:text-gray-400"
                    />
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-gray-300">{currency(p.qty * p.price)}</div>
                      <Button
                        variant="ghost"
                        className="text-gray-300 hover:bg-gray-800"
                        onClick={() => removeProduct(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove product</span>
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addProduct}
                    className="bg-gray-700 text-white hover:bg-gray-800 rounded-xl"
                  >
                    + Add Product
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <label className="text-sm text-gray-300">Discounts</label>
                <Input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                  className="bg-gray-700 border-0 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-gray-300">Payment Method</label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v)}>
                  <SelectTrigger className="bg-gray-700 border-0 text-white">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-0">
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-gray-300">Totals</label>
                <div className="bg-gray-700 rounded-xl p-3 space-y-1">
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Subtotal</span>
                    <span>{currency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Discount</span>
                    <span>-{currency(discountNum)}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-white">
                    <span>Final Total</span>
                    <span>{currency(finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <DialogClose asChild>
              <Button variant="ghost" className="text-gray-300 hover:bg-gray-800">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
              Save & Generate
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function BillPreviewDialog({
  row,
  open,
  onOpenChange,
}) {
  if (!row) return null
  const subtotal = row.products.reduce((s, p) => s + p.qty * p.price, 0)
  const discount = row.discount || 0
  const finalTotal = Math.max(0, subtotal - discount)
  const date = new Date(row.date)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "bg-gray-800 text-white border-0 p-0",
          "sm:max-w-[800px] sm:rounded-2xl",
          "max-sm:w-[95vw] max-sm:h-[95vh] max-sm:rounded-2xl overflow-hidden",
        )}
      >
        <div className="p-6 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-white">Invoice Preview</DialogTitle>
            <DialogDescription className="text-gray-300">
              Styled invoice preview. Actions are placeholders (no backend).
            </DialogDescription>
          </DialogHeader>

          <div className="bg-gray-900 rounded-2xl p-6 space-y-6">
            <header className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Vyaapari Business</h3>
                <p className="text-gray-300">123 Market Street, City, 400001</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-white">LOGO</div>
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-gray-300">Bill No.</p>
                <p className="font-semibold">{row.billNo}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-300">Date</p>
                <p className="font-semibold">
                  {date.toLocaleDateString()} {date.toLocaleTimeString()}
                </p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-gray-300">Customer</p>
                <p className="font-semibold">{row.customerName}</p>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-700">
              <Table>
                <TableHeader className="bg-gray-800">
                  <TableRow>
                    <TableHead className="text-gray-300">Product</TableHead>
                    <TableHead className="text-gray-300">Qty</TableHead>
                    <TableHead className="text-gray-300">Price</TableHead>
                    <TableHead className="text-gray-300">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {row.products.map((p) => (
                    <TableRow key={p.id} className="hover:bg-gray-800">
                      <TableCell className="text-white">{p.name}</TableCell>
                      <TableCell className="text-white">{p.qty}</TableCell>
                      <TableCell className="text-white">{currency(p.price)}</TableCell>
                      <TableCell className="text-white">{currency(p.qty * p.price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-gray-300">Payment Method</p>
                <Badge className="bg-gray-700 text-white hover:bg-gray-700">{row.paymentMethod}</Badge>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>{currency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Discount</span>
                  <span>-{currency(discount)}</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-white">
                  <span>Final Total</span>
                  <span>{currency(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button onClick={() => alert("Stub: Download PDF")} className="bg-blue-600 hover:bg-blue-700 text-white">
              Download PDF
            </Button>
            <Button variant="ghost" className="text-gray-300 hover:bg-gray-800" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function SalesPage() {
  const [rows, setRows] = useState(initialSales)
  const [query, setQuery] = useState("")
  const [previewRow, setPreviewRow] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  // pagination
  const [page, setPage] = useState(1)
  const pageSize = 8

  const filtered = useMemo(() => {
    if (!query.trim()) return rows
    const q = query.toLowerCase()
    return rows.filter((r) => {
      const customerMatch = r.customerName.toLowerCase().includes(q)
      const productMatch = r.products.some((p) => p.name.toLowerCase().includes(q))
      return customerMatch || productMatch
    })
  }, [rows, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  const revenueThisMonth = useMemo(
    () =>
      rows
        .filter((r) => {
          const d = new Date(r.date)
          const now = new Date()
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        })
        .reduce((s, r) => s + r.total, 0),
    [rows],
  )

  const profitThisMonth = useMemo(
    () =>
      rows
        .filter((r) => {
          const d = new Date(r.date)
          const now = new Date()
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        })
        .reduce((s, r) => s + r.profit, 0),
    [rows],
  )

  const salesCount = filtered.length
  const topProduct = useMemo(() => getTopProductName(rows), [rows])

  function addSale(r) {
    setRows((prev) => [r, ...prev])
    setPage(1)
  }

  function deleteSale(id) {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  function openPreview(r) {
    setPreviewRow(r)
    setPreviewOpen(true)
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      {/* Header */}
      <h1 className="text-xl font-bold mb-4 text-pretty">Sales Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gray-800 text-white rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300">Revenue this month</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{currency(revenueThisMonth)}</CardContent>
        </Card>

        <Card className="bg-gray-800 text-white rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300">Profit this month</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{currency(profitThisMonth)}</CardContent>
        </Card>

        <Card className="bg-gray-800 text-white rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300">Number of sales</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{salesCount}</CardContent>
        </Card>

        <Card className="bg-gray-800 text-white rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300">Top product this month</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">{topProduct}</CardContent>
        </Card>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <div className="w-full md:max-w-sm">
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Search by customer or product…"
            className="bg-gray-800 border-0 text-white placeholder:text-gray-400 rounded-2xl"
          />
        </div>
        <CreateBillDialog onAddSale={addSale} />
      </div>

      {/* Table */}
      <Card className="bg-gray-800 text-white rounded-2xl shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-800">
                <TableRow>
                  <TableHead className="text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-300">Customer Name</TableHead>
                  <TableHead className="text-gray-300">Products Sold</TableHead>
                  <TableHead className="text-gray-300">Total Amount</TableHead>
                  <TableHead className="text-gray-300">Profit</TableHead>
                  <TableHead className="text-gray-300">Payment Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((r) => {
                  const d = new Date(r.date)
                  return (
                    <TableRow key={r.id} className="hover:bg-gray-700/60">
                      <TableCell className="text-white">
                        {d.toLocaleDateString()} {d.toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="text-white">{r.customerName}</TableCell>
                      <TableCell className="text-white">
                        <div className="flex flex-wrap gap-2">
                          {r.products.map((p) => (
                            <Badge key={p.id} className="bg-gray-700 text-white hover:bg-gray-700">
                              {p.name} × {p.qty}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-white">{currency(r.total)}</TableCell>
                      <TableCell className="text-white">{currency(r.profit)}</TableCell>
                      <TableCell className="text-white">
                        <Badge className="bg-gray-700 text-white hover:bg-gray-700">{r.paymentStatus}</Badge>
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            className="text-gray-300 hover:bg-gray-700"
                            onClick={() => openPreview(r)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-gray-300 hover:bg-gray-700"
                            onClick={() => alert("Stub: Download")}
                          >
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="text-gray-300 hover:bg-gray-700">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-800 text-white border-0">
                              <DropdownMenuItem
                                className="hover:bg-gray-700 cursor-pointer"
                                onClick={() => openPreview(r)}
                              >
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="hover:bg-gray-700 cursor-pointer"
                                onClick={() => alert("Stub: Download")}
                              >
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="hover:bg-gray-700 text-gray-300 cursor-pointer"
                                onClick={() => deleteSale(r.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {pageRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-300 py-8">
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-t border-gray-700 rounded-b-2xl">
            <div className="text-sm text-gray-300">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="text-gray-300 hover:bg-gray-700"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="ghost"
                className="text-gray-300 hover:bg-gray-700"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bill Preview Modal */}
      <BillPreviewDialog row={previewRow} open={previewOpen} onOpenChange={setPreviewOpen} />
    </main>
  )
}
