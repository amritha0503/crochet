import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';


export default function Admin() {
  const [passkey, setPasskey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for Add/Edit Form
  const [editingProduct, setEditingProduct] = useState(null); // null means adding new
  const [showForm, setShowForm] = useState(false);
  
  const initialFormState = {
    id: '', name: '', slug: '', description: '', price: 0, 
    compare_price: null, category: 'amigurumi', tags: '', 
    images: [], stock: 0, is_featured: false, is_active: true, weight_grams: 100
  };
  const [formData, setFormData] = useState(initialFormState);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_URL}/admin/verify`, {}, {
        headers: { 'x-admin-passkey': passkey }
      });
      setIsAuthenticated(true);
      fetchData();
    } catch (err) {
      setError("Invalid passkey. Access denied.");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [prodRes, ordRes] = await Promise.all([
        axios.get(`${API_URL}/products/`),
        axios.get(`${API_URL}/admin/orders`, { headers: { 'x-admin-passkey': passkey } })
      ]);
      setProducts(prodRes.data);
      setOrders(ordRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }));
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      ...product,
      tags: product.tags ? product.tags.join(', ') : '',
      images: product.images ? product.images : [],
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({ ...initialFormState, id: `prod_${Date.now()}` });
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingImage(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/admin/upload`, data, {
        headers: { 
          'x-admin-passkey': passkey,
          'Content-Type': 'multipart/form-data'
        }
      });
      if(res.data.success) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, res.data.url]
        }));
      }
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_URL}/admin/products/${id}`, {
        headers: { 'x-admin-passkey': passkey }
      });
      fetchData();
    } catch (err) {
      alert("Failed to delete product.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      images: formData.images,
      created_at: editingProduct ? editingProduct.created_at : new Date().toISOString() + "Z",
      updated_at: new Date().toISOString() + "Z"
    };

    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/admin/products/${payload.id}`, payload, {
          headers: { 'x-admin-passkey': passkey }
        });
      } else {
        await axios.post(`${API_URL}/admin/products`, payload, {
          headers: { 'x-admin-passkey': passkey }
        });
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to save product.");
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/admin/orders/${orderId}/status`, { status: newStatus }, {
        headers: { 'x-admin-passkey': passkey }
      });
      // Locally update order state rather than re-fetching entirely for snappiness
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch(err) {
      alert("Failed to update status");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-md border border-[#fdf6f0] text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h1 className="text-2xl font-bold text-[#3d2314] mb-6">Admin Access</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="password" 
            value={passkey} 
            onChange={(e) => setPasskey(e.target.value)} 
            placeholder="Enter Admin Passkey" 
            className="w-full p-3 border border-[#d4b4a0] rounded-lg focus:ring-2 focus:ring-[#c47c82] outline-none text-center"
            required 
          />
          <button type="submit" disabled={loading} className="w-full bg-[#3d2314] text-white py-3 rounded-lg font-bold hover:bg-[#6b3a28] transition-colors">
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-end mb-8 border-b-2 border-[#fdf6f0] pb-4">
        <div>
          <h1 className="text-4xl font-bold text-[#3d2314] flex items-center gap-2 mb-4"><span>🛡️</span> Admin Dashboard</h1>
          <div className="flex gap-4">
            <button 
              className={`font-bold px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'products' ? 'bg-[#fdf6f0] text-[#3d2314] border-b-4 border-[#c47c82]' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => { setActiveTab('products'); setShowForm(false); }}
            >
              📦 Inventory
            </button>
            <button 
              className={`font-bold px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'orders' ? 'bg-[#fdf6f0] text-[#3d2314] border-b-4 border-[#c47c82]' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => { setActiveTab('orders'); setShowForm(false); }}
            >
              🚚 Live Orders
            </button>
          </div>
        </div>
        
        {activeTab === 'products' && !showForm && (
          <button onClick={handleAddNew} className="bg-[#2e9e56] text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-[#247c43]">
            + Add New Product
          </button>
        )}
      </div>

      {activeTab === 'products' ? (
        // PRODUCTS TAB
        <>
          {showForm ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-[#fdf6f0] mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#3d2314]">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setShowForm(false)} className="text-[#6b3a28] font-bold">✕ Cancel</button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium mb-1">Product ID</label>
                      <input name="id" value={formData.id} onChange={handleFormChange} readOnly={!!editingProduct} className="w-full p-2 border rounded bg-gray-50" required />
                   </div>
                   <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input name="name" value={formData.name} onChange={handleFormChange} className="w-full p-2 border rounded" required />
                   </div>
                   <div>
                      <label className="block text-sm font-medium mb-1">Slug</label>
                      <input name="slug" value={formData.slug} onChange={handleFormChange} className="w-full p-2 border rounded" required />
                   </div>
                   <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select name="category" value={formData.category} onChange={handleFormChange} className="w-full p-2 border rounded">
                         <option value="amigurumi">Amigurumi</option>
                         <option value="bags">Bags</option>
                         <option value="home-decor">Home Decor</option>
                         <option value="accessories">Accessories</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-sm font-medium mb-1">Price (₹)</label>
                      <input type="number" name="price" value={formData.price} onChange={handleFormChange} className="w-full p-2 border rounded" required />
                   </div>
                   <div>
                      <label className="block text-sm font-medium mb-1">Stock</label>
                      <input type="number" name="stock" value={formData.stock} onChange={handleFormChange} className="w-full p-2 border rounded" required />
                   </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleFormChange} rows="3" className="w-full p-2 border rounded" required></textarea>
                 </div>

                 <div>
                    <label className="block text-sm font-medium mb-1">Product Images</label>
                    <div className="flex gap-4 items-center flex-wrap mb-2">
                      {formData.images && formData.images.map((img, i) => (
                        <div key={i} className="relative w-16 h-16 border rounded bg-gray-100 overflow-hidden shadow-sm">
                          <img src={img} alt="preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center leading-none uppercase font-bold" 
                            onClick={() => setFormData(prev => ({...prev, images: prev.images.filter((_, idx)=>idx!==i)}))}
                          >&times;</button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="bg-white border-2 border-gray-300 text-sm font-bold px-4 py-2 rounded cursor-pointer hover:bg-gray-50 shadow-sm transition-colors text-[#3d2314]">
                        {uploadingImage ? "Uploading..." : "Upload New Image"}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                      </label>
                    </div>
                 </div>

                 <div className="flex items-center gap-6 py-2">
                    <label className="flex items-center gap-2 font-bold text-[#6b3a28]">
                      <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleFormChange} className="w-4 h-4 accent-[#c47c82]" />
                      <span>Featured on Home Page</span>
                    </label>
                    <label className="flex items-center gap-2 font-bold text-[#6b3a28]">
                      <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleFormChange} className="w-4 h-4 accent-[#c47c82]" />
                      <span>Active in Store</span>
                    </label>
                 </div>

                 <button type="submit" className="w-full bg-[#1b365d] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#122440] shadow-md mt-4">
                    Save Product
                 </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-[#fdf6f0] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f0f8ff] border-b border-[#d4b4a0]">
                    <th className="p-4 font-bold text-[#3d2314]">Product</th>
                    <th className="p-4 font-bold text-[#3d2314]">Category</th>
                    <th className="p-4 font-bold text-[#3d2314]">Price</th>
                    <th className="p-4 font-bold text-[#3d2314]">Stock</th>
                    <th className="p-4 font-bold text-[#3d2314] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b border-gray-100 opacity-90 hover:opacity-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-semibold text-[#6b3a28] flex items-center gap-3">
                        {p.images && p.images[0] ? (
                          <img src={p.images[0]} alt="thumb" className="w-10 h-10 object-cover rounded-md border" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-md border flex items-center justify-center text-xl">🧶</div>
                        )}
                        <span>
                          {p.name} {p.is_featured && '⭐'} {!p.is_active && <span className="text-red-400 text-xs">(Hidden)</span>}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-600 uppercase tracking-wider">{p.category}</td>
                      <td className="p-4 font-bold text-[#3d2314]">₹{p.price}</td>
                      <td className="p-4 font-bold">
                        <span className={`px-2 py-1 rounded-full text-xs ${p.stock > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleEdit(p)} className="px-3 py-1.5 bg-[#fdf0ff] text-[#9b4ac4] border border-[#e8c0f8] rounded-md hover:bg-[#f6dfff] text-sm font-bold shadow-sm">Edit</button>
                        <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 text-sm font-bold shadow-sm">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && <div className="p-8 text-center text-gray-500 font-medium">No products found in inventory.</div>}
            </div>
          )}
        </>
      ) : (
        // ORDERS TAB
        <div className="space-y-6">
           {orders.map(order => (
             <div key={order.id} className="bg-white rounded-xl shadow-sm border border-[#fdf6f0] p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-[#3d2314]">{order.id}</h3>
                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div className="mt-4 md:mt-0 flex gap-4 items-center">
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                      Payment: {order.payment_status.toUpperCase()}
                    </span>
                    <select 
                      value={order.status} 
                      onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                      className={`font-bold px-3 py-1 rounded-full border outline-none cursor-pointer text-sm ${
                        order.status === 'delivered' ? 'bg-[#fdf0ff] text-[#9b4ac4] border-[#e8c0f8]' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }`}
                    >
                      <option value="pending">🟡 Pending</option>
                      <option value="processing">⚙️ Processing</option>
                      <option value="shipped">🚚 Shipped</option>
                      <option value="delivered">✅ Delivered</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-sm text-[#6b3a28] uppercase tracking-wider mb-2">Customer</h4>
                    <p className="font-medium">{order.shipping_address.name}</p>
                    <p className="text-gray-600 text-sm">📞 {order.shipping_address.phone}</p>
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <p>{order.shipping_address.line1}</p>
                      <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                      <p>PIN: {order.shipping_address.pincode}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-sm text-[#6b3a28] uppercase tracking-wider mb-2">Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="font-bold text-[#3d2314]">₹{item.subtotal}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t mt-4 pt-2 flex justify-between font-bold text-lg text-[#3d2314]">
                      <span>Total Paid</span>
                      <span>₹{order.total}</span>
                    </div>
                  </div>
                </div>
             </div>
           ))}
           
           {orders.length === 0 && (
             <div className="bg-white p-12 rounded-xl border border-dashed border-[#d4b4a0] text-center">
               <div className="text-4xl mb-4">📭</div>
               <h3 className="text-xl font-bold text-[#3d2314]">No Orders Yet</h3>
               <p className="text-gray-500 mt-2">When customers place orders, they will appear right here!</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
