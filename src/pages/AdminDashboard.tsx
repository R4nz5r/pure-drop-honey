import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2, LogOut, Package, ShoppingCart, RefreshCw, Search, ChevronLeft, ChevronRight, Edit2, Eye, KeyRound, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

type OrderStatus = "pending" | "confirmed" | "out_for_delivery" | "delivered" | "cancelled";

interface Order {
  id: string;
  order_ref: string;
  customer_name: string;
  phone: string;
  address: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: OrderStatus;
  created_at: string;
  product_variants: { name: string; price: number } | null;
}

interface Variant {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  stock_qty: number;
  is_active: boolean;
  weight_order: number;
}

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"orders" | "variants">("orders");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Edit order state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editOrderForm, setEditOrderForm] = useState({ customer_name: "", phone: "", address: "", quantity: 1 });
  const [editOrderLoading, setEditOrderLoading] = useState(false);

  // Variants state
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      if (!session) navigate("/admin/login");
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) navigate("/admin/login");
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session) {
      if (activeTab === "orders") fetchOrders();
      else fetchVariants();
    }
  }, [session, activeTab, page, statusFilter]);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${session?.access_token}`,
  });

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: "15" };
      if (statusFilter) params.status = statusFilter;
      if (orderSearch) params.search = orderSearch;

      const { data, error } = await supabase.functions.invoke("admin-orders", {
        headers: getAuthHeaders(),
        body: null,
        method: "GET",
      });

      // Since we can't pass query params via invoke easily, use fetch
      const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-orders`);
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

      const res = await fetch(url.toString(), {
        headers: {
          ...getAuthHeaders(),
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
      });
      const result = await res.json();

      if (result.success) {
        setOrders(result.data || []);
        setTotalPages(result.pagination?.pages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchVariants = async () => {
    setVariantsLoading(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-variants`;
      const res = await fetch(url, {
        headers: {
          ...getAuthHeaders(),
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      const result = await res.json();
      if (result.success) setVariants(result.data || []);
    } catch (err) {
      console.error("Failed to fetch variants:", err);
    } finally {
      setVariantsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-orders`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order_id: orderId, status }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Status updated!");
        fetchOrders();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const updateVariant = async (variant: Partial<Variant> & { id: string }) => {
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-variants`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(variant),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Variant updated!");
        setEditingVariant(null);
        fetchVariants();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to update variant");
    }
  };

  const openEditOrder = (order: Order) => {
    setEditingOrder(order);
    setEditOrderForm({
      customer_name: order.customer_name,
      phone: order.phone,
      address: order.address,
      quantity: order.quantity,
    });
  };

  const handleEditOrder = async () => {
    if (!editingOrder) return;
    setEditOrderLoading(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-orders`;
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order_id: editingOrder.id, ...editOrderForm }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Order updated!");
        setEditingOrder(null);
        fetchOrders();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to update order");
    } finally {
      setEditOrderLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (pwForm.newPw.length < 6) { setPwError("Password must be at least 6 characters"); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError("Passwords do not match"); return; }
    setPwLoading(true);
    try {
      // Verify current password by re-signing in
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: session?.user?.email,
        password: pwForm.current,
      });
      if (signInErr) { setPwError("Current password is incorrect"); setPwLoading(false); return; }

      const { error } = await supabase.auth.updateUser({ password: pwForm.newPw });
      if (error) throw error;
      toast.success("Password changed successfully!");
      setShowChangePassword(false);
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (err: any) {
      setPwError(err.message || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">🍯 মৌচাক Admin</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowChangePassword(true)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <KeyRound className="h-4 w-4" /> Change Password
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Change Password</h2>
              <button onClick={() => { setShowChangePassword(false); setPwError(""); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Current Password</label>
                <input type="password" required value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">New Password</label>
                <input type="password" required value={pwForm.newPw} onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                <input type="password" required value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              {pwError && <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-2">{pwError}</p>}
              <button type="submit" disabled={pwLoading}
                className="w-full rounded-xl bg-primary py-2.5 font-bold text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2">
                {pwLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</> : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Edit Order — {editingOrder.order_ref}</h2>
              <button onClick={() => setEditingOrder(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Customer Name</label>
                <input
                  value={editOrderForm.customer_name}
                  onChange={(e) => setEditOrderForm(f => ({ ...f, customer_name: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Phone</label>
                <input
                  value={editOrderForm.phone}
                  onChange={(e) => setEditOrderForm(f => ({ ...f, phone: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Address</label>
                <textarea
                  value={editOrderForm.address}
                  onChange={(e) => setEditOrderForm(f => ({ ...f, address: e.target.value }))}
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={editOrderForm.quantity}
                  onChange={(e) => setEditOrderForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="rounded-xl bg-muted/50 p-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Unit Price</span>
                <span className="font-bold text-foreground">৳{editingOrder.unit_price.toLocaleString()}</span>
              </div>
              <div className="rounded-xl bg-primary/10 p-3 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Total Price</span>
                <span className="text-lg font-bold text-primary">৳{(editingOrder.unit_price * editOrderForm.quantity).toLocaleString()}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleEditOrder}
                  disabled={editOrderLoading}
                  className="flex-1 rounded-xl bg-primary py-2.5 font-bold text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {editOrderLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                </button>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="rounded-xl border border-input px-4 py-2.5 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "orders" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingCart className="h-4 w-4" /> Orders
          </button>
          <button
            onClick={() => setActiveTab("variants")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "variants" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="h-4 w-4" /> Variants
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchOrders()}
                  placeholder="Search name, phone, order ID..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                {Object.entries(statusLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <button onClick={fetchOrders} className="rounded-lg bg-muted p-2 hover:bg-accent">
                <RefreshCw className={`h-4 w-4 ${ordersLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Orders Table */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Order</th>
                      <th className="px-4 py-3 text-left font-medium">Customer</th>
                      <th className="px-4 py-3 text-left font-medium">Phone</th>
                      <th className="px-4 py-3 text-left font-medium">Address</th>
                      <th className="px-4 py-3 text-left font-medium">Product</th>
                      <th className="px-4 py-3 text-left font-medium">Total</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ordersLoading ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No orders found</td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id} className="hover:bg-muted/50">
                          <td className="px-4 py-3 font-mono text-xs">{order.order_ref}</td>
                          <td className="px-4 py-3">{order.customer_name}</td>
                          <td className="px-4 py-3">{order.phone}</td>
                          <td className="px-4 py-3 max-w-[200px] truncate" title={order.address}>{order.address}</td>
                          <td className="px-4 py-3">
                            {order.product_variants?.name} × {order.quantity}
                          </td>
                          <td className="px-4 py-3 font-medium">৳{order.total_price.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className={`rounded-full px-2 py-1 text-xs font-medium border-0 cursor-pointer ${statusColors[order.status]}`}
                            >
                              {Object.entries(statusLabels).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString("bn-BD")}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditOrder(order)}
                                className="text-muted-foreground hover:text-foreground"
                                title="Edit order"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  toast.info(`Order: ${order.order_ref}\nAddress: ${order.address}`);
                                }}
                                className="text-muted-foreground hover:text-foreground"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="rounded-lg border border-input bg-background p-2 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="rounded-lg border border-input bg-background p-2 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Variants Tab */}
        {activeTab === "variants" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-foreground">Product Variants</h2>
              <button onClick={fetchVariants} className="rounded-lg bg-muted p-2 hover:bg-accent">
                <RefreshCw className={`h-4 w-4 ${variantsLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {variantsLoading ? (
                <div className="col-span-3 flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                variants.map((v) => (
                  <div key={v.id} className="rounded-xl border border-border bg-card p-5 space-y-3">
                    {editingVariant?.id === v.id ? (
                      <VariantEditForm
                        variant={editingVariant}
                        onSave={updateVariant}
                        onCancel={() => setEditingVariant(null)}
                      />
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-foreground">{v.name}</h3>
                            <p className="text-2xl font-bold text-primary">৳{v.price.toLocaleString()}</p>
                            {v.original_price && (
                              <p className="text-sm text-muted-foreground line-through">৳{v.original_price}</p>
                            )}
                          </div>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${v.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {v.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Stock</span>
                          <span className={`font-medium ${v.stock_qty <= 10 ? "text-destructive" : "text-foreground"}`}>
                            {v.stock_qty} units
                          </span>
                        </div>
                        <button
                          onClick={() => setEditingVariant(v)}
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <Edit2 className="h-3 w-3" /> Edit
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const VariantEditForm = ({
  variant,
  onSave,
  onCancel,
}: {
  variant: Variant;
  onSave: (v: Partial<Variant> & { id: string }) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState(variant);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground">Name</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Price</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Stock</label>
          <input
            type="number"
            value={form.stock_qty}
            onChange={(e) => setForm({ ...form, stock_qty: Number(e.target.value) })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          className="rounded"
        />
        <label className="text-sm">Active</label>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave({ id: form.id, name: form.name, price: form.price, stock_qty: form.stock_qty, is_active: form.is_active })}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Save
        </button>
        <button onClick={onCancel} className="rounded-lg border border-input px-4 py-2 text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
