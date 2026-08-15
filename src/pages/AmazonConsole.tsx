import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../AuthContext';
import { 
  ArrowLeft, Activity, Cpu, Sparkles, FileSpreadsheet, Download, RefreshCw, 
  Settings, CheckCircle2, AlertTriangle, Package, Tag, Globe, Truck, List, Edit3, CheckSquare, Square
} from 'lucide-react';
import { Link } from 'react-router-dom';


interface Product {
  id: string;
  name: string;
  category: string;
  categories: string[];
  price: number;
  description: string;
  shortDescription: string;
  material: string;
  fit: string;
  care: string;
  images: string[];
  stockQuantity: number;
  availableColors?: string[];
  availableSizes?: string[];
  variations?: Array<{
    id: string;
    attributes: {
      color?: string;
      size?: string;
    };
    price: number;
    stockQuantity: number;
    images: string[];
  }>;
}

interface EnrichedAttributes {
  bulletPoints: string[];
  genericKeywords: string;
  modelName: string;
  collectionName: string;
  sleeveLengthDescription: string;
  closureType: string;
  apparelFabricWeightClass: string;
  apparelFabricStretch: string;
  fitToSizeSentiment: string;
  itemWeightGrams: number;
  colorMap: Record<string, string>;
}

const AmazonConsole: React.FC = () => {
  const { token, user, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [enrichedData, setEnrichedData] = useState<Record<string, EnrichedAttributes>>({});
  const [globalSettings, setGlobalSettings] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'identity' | 'description' | 'specifications' | 'compliance' | 'variations'>('identity');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [bulkProgress, setBulkProgress] = useState<{ current: number, total: number } | null>(null);

  // Load WooCommerce products & Global settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch settings
        const settingsRes = await fetch('/api/settings');
        const settingsData = await settingsRes.json();
        setGlobalSettings(settingsData);

        // Fetch products
        const productsRes = await fetch('/api/products?show_test=true');
        const productsData = await productsRes.json();
        if (Array.isArray(productsData)) {
          setProducts(productsData);
        }
      } catch (err) {
        console.error("Failed to load catalog data:", err);
        showNotification('error', 'Failed to retrieve catalog data.');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const showNotification = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, message: msg });
    setTimeout(() => setNotification(null), 5000);
  };

  // Admin access gate
  const adminEmails = ['chilsandco@gmail.com', 'chilsandco.com@gmail.com'];
  const canAccess = user && adminEmails.some(email => email.toLowerCase() === user.email.toLowerCase());

  if (authLoading || loading) {
    return (
      <div className="pt-36 pb-24 px-6 md:px-12 flex items-center justify-center min-h-screen bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <Activity className="animate-pulse text-accent" size={32} />
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">Mapping WooCommerce Catalog...</p>
        </div>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="pt-36 pb-24 px-6 md:px-12 flex flex-col items-center justify-center min-h-screen text-center bg-black text-white">
        <AlertTriangle className="text-red-500 mb-8" size={48} />
        <h1 className="text-4xl font-display font-bold mb-4 uppercase tracking-tighter">Access Denied</h1>
        <p className="text-neutral-500 uppercase text-[10px] tracking-widest max-w-sm">Clearance Level: Administrator required for listing syndications.</p>
      </div>
    );
  }

  // Checkbox toggle helpers
  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  // Trigger Gemini AI enrichment for single product
  const handleEnrich = async (productId: string) => {
    setEnriching(true);
    showNotification('success', 'AI scanning WooCommerce product description...');
    try {
      const res = await fetch('/api/amazon/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (data.success) {
        setEnrichedData(prev => ({
          ...prev,
          [productId]: data.enrichedAttributes
        }));
        showNotification('success', 'Enrichment complete. Attributes generated.');
      } else {
        throw new Error(data.message || 'AI enrichment failed.');
      }
    } catch (err: any) {
      console.error(err);
      showNotification('error', err.message || 'Calibration failure.');
    } finally {
      setEnriching(false);
    }
  };

  // Bulk AI Enrichment for all checked products
  const handleBulkEnrich = async () => {
    if (selectedIds.size === 0) return;
    setEnriching(true);
    setBulkProgress({ current: 0, total: selectedIds.size });
    showNotification('success', `Starting bulk AI enrichment for ${selectedIds.size} products...`);

    const idList = Array.from(selectedIds);
    let completed = 0;

    for (const id of idList) {
      try {
        const p = products.find(prod => prod.id === id);
        console.log(`[BULK ENRICH] Enriching #${id} (${p?.name})...`);
        
        const res = await fetch('/api/amazon/enrich', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId: id })
        });
        const data = await res.json();
        if (data.success) {
          setEnrichedData(prev => ({
            ...prev,
            [id as string]: data.enrichedAttributes
          }));
        }
      } catch (err) {
        console.error(`[BULK ENRICH] Failed for #${id}:`, err);
      }
      completed++;
      setBulkProgress({ current: completed, total: idList.length });
    }

    showNotification('success', `Enriched ${completed} products successfully.`);
    setEnriching(false);
    setBulkProgress(null);
  };

  // Compile spreadsheet rows & columns matching Amazon Seller Apparel flat file (Handles both Single & Bulk)
  const handleExport = async (targetProducts: Product[]) => {
    const exportable = targetProducts.filter(p => !!enrichedData[p.id]);

    if (exportable.length === 0) {
      showNotification('error', 'None of the selected products have been enriched by AI yet. Run AI enrichment first.');
      return;
    }

    showNotification('success', 'Generating macro-enabled Amazon Product Spreadsheet...');

    try {
      const res = await fetch('/api/amazon/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          products: exportable,
          enrichedData
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Spreadsheet export failed on server.' }));
        throw new Error(errorData.message || 'Export failed on server.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const fileName = exportable.length === 1 
        ? `Amazon_Listing_Feed_${exportable[0].name.replace(/\s+/g, '_')}.xlsm`
        : `Amazon_Bulk_Listing_Feed_${new Date().toISOString().split('T')[0]}.xlsm`;

      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showNotification('success', 'Spreadsheet downloaded successfully!');
    } catch (err: any) {
      console.error(err);
      showNotification('error', err.message || 'Spreadsheet export failed.');
    }
  };

  const handleEditEnrichAttribute = (key: keyof EnrichedAttributes, val: any) => {
    if (!selectedProduct) return;
    setEnrichedData(prev => {
      const current = prev[selectedProduct.id];
      if (!current) return prev;
      return {
        ...prev,
        [selectedProduct.id]: {
          ...current,
          [key]: val
        }
      };
    });
  };

  const handleEditColorMap = (rawColor: string, val: string) => {
    if (!selectedProduct) return;
    setEnrichedData(prev => {
      const current = prev[selectedProduct.id];
      if (!current) return prev;
      return {
        ...prev,
        [selectedProduct.id]: {
          ...current,
          colorMap: {
            ...current.colorMap,
            [rawColor]: val
          }
        }
      };
    });
  };

  return (
    <div className="pt-36 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto min-h-screen bg-black text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-24 right-6 md:right-12 z-50 p-4 border flex items-center gap-3 backdrop-blur-md ${
              notification.type === 'success' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-red-500/10 border-red-500/20 text-red-500'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span className="font-mono text-[10px] uppercase tracking-widest">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="mb-16">
        <Link to="/console/bespoke" className="inline-flex items-center gap-2 text-neutral-500 hover:text-accent transition-colors mb-8 uppercase text-[10px] font-bold tracking-widest">
          <ArrowLeft size={14} /> Back to Console
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="text-accent" size={16} />
              <p className="text-[10px] tracking-[0.5em] text-neutral-500 uppercase">Automated Listing Suite</p>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter uppercase mb-4">Amazon Channel Hub</h1>
            <p className="text-neutral-500 uppercase text-[10px] tracking-widest max-w-xl">
              Extract WooCommerce catalog listings, enrich using Gemini AI, and synthesize bulk-upload spreadsheets.
            </p>
          </div>
          <Link to="/admin/config" className="px-6 py-3 border border-neutral-900 hover:border-accent text-neutral-400 hover:text-white font-mono text-[9px] uppercase tracking-widest flex items-center gap-2 transition-all">
            <Settings size={14} /> Reconfigure Amazon Defaults
          </Link>
        </div>
      </header>

      {/* Bulk Progress Banner */}
      {bulkProgress && (
        <div className="mb-8 p-4 bg-accent/5 border border-accent/10 flex items-center justify-between rounded-lg">
          <div className="flex items-center gap-3">
            <RefreshCw className="animate-spin text-accent" size={14} />
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold">
              Bulk AI Enrichment in Progress: {bulkProgress.current} / {bulkProgress.total} Complete
            </span>
          </div>
          <div className="w-1/3 bg-neutral-900 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-accent h-full transition-all duration-300"
              style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Product Catalog List */}
        <div className="lg:col-span-5 border border-neutral-900 bg-neutral-950/40 p-8 rounded-xl space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleToggleSelectAll}
                className="text-accent hover:opacity-80 flex items-center justify-center"
              >
                {selectedIds.size === products.length ? (
                  <CheckSquare size={16} />
                ) : (
                  <Square size={16} className="text-neutral-700" />
                )}
              </button>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                WooCommerce Catalog ({selectedIds.size}/{products.length} Selected)
              </h3>
            </div>
            <List size={14} className="text-neutral-700" />
          </div>

          {/* Bulk Action Controls */}
          {selectedIds.size > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-lg flex items-center justify-between gap-4"
            >
              <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">{selectedIds.size} Item(s) Queued</span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkEnrich}
                  disabled={enriching}
                  className="px-4 py-2 bg-white text-black font-bold text-[9px] uppercase tracking-widest flex items-center gap-1 hover:bg-accent disabled:opacity-50"
                >
                  <Sparkles size={10} />
                  AI Enrich
                </button>
                <button
                  onClick={() => handleExport(products.filter(p => selectedIds.has(p.id)))}
                  className="px-4 py-2 bg-accent text-black font-bold text-[9px] uppercase tracking-widest flex items-center gap-1"
                >
                  <FileSpreadsheet size={10} />
                  Export Bulk
                </button>
              </div>
            </motion.div>
          )}

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {products.map(product => {
              const enriched = !!enrichedData[product.id];
              const isSelected = selectedProduct?.id === product.id;
              const isChecked = selectedIds.has(product.id);

              return (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedProduct(product)}
                  className={`flex gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-accent bg-accent/[0.03]' 
                      : 'border-neutral-900 hover:border-neutral-800 bg-neutral-950/20'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div 
                    onClick={(e) => handleToggleSelect(product.id, e)}
                    className="flex items-center justify-center text-accent"
                  >
                    {isChecked ? (
                      <CheckSquare size={16} />
                    ) : (
                      <Square size={16} className="text-neutral-800 hover:text-neutral-600" />
                    )}
                  </div>

                  <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 flex-shrink-0 rounded-md overflow-hidden flex items-center justify-center">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="text-neutral-700" size={24} />
                    )}
                  </div>

                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold tracking-tight uppercase line-clamp-1">{product.name}</h4>
                      <p className="text-[8px] font-mono text-neutral-600 uppercase tracking-widest mt-1">ID: #{product.id} | WC Variant Count: {product.variations?.length || 0}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] font-bold text-accent font-mono">INR ₹{product.price}</span>
                      {enriched ? (
                        <span className="inline-flex items-center gap-1 text-[8px] font-bold uppercase bg-accent/10 text-accent px-2 py-0.5 rounded">
                          <CheckCircle2 size={8} /> Ready
                        </span>
                      ) : (
                        <span className="text-[8px] font-bold uppercase text-neutral-600">Unenriched</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Product Details & AI Synthesis */}
        <div className="lg:col-span-7">
          {selectedProduct ? (
            <div className="border border-neutral-900 bg-neutral-950/20 p-8 rounded-xl space-y-8">
              {/* Product Header */}
              <div className="flex items-start justify-between gap-6 pb-6 border-b border-neutral-900">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                    {selectedProduct.images?.[0] && (
                      <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <span className="text-[8px] font-bold uppercase bg-neutral-900 text-neutral-500 border border-neutral-800 px-2 py-0.5 rounded">
                      WooCommerce Linked
                    </span>
                    <h2 className="text-2xl font-display font-bold uppercase tracking-tight mt-2">{selectedProduct.name}</h2>
                    <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mt-1">Variations: {selectedProduct.variations?.length || 0} Skus</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {!enrichedData[selectedProduct.id] ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleEnrich(selectedProduct.id)}
                      disabled={enriching}
                      className="px-6 py-3 bg-white text-black font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-accent disabled:opacity-50"
                    >
                      {enriching ? <RefreshCw className="animate-spin" size={12} /> : <Sparkles size={12} />}
                      {enriching ? 'Analyzing...' : 'AI Auto-Fill'}
                    </motion.button>
                  ) : (
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleEnrich(selectedProduct.id)}
                        disabled={enriching}
                        className="px-4 py-3 border border-neutral-900 hover:border-neutral-800 text-neutral-400 font-mono text-[9px] uppercase tracking-widest flex items-center justify-center"
                        title="Re-run AI synthesis"
                      >
                        <RefreshCw className={enriching ? "animate-spin" : ""} size={12} />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleExport([selectedProduct])}
                        className="px-6 py-3 bg-accent text-black font-bold text-[10px] uppercase tracking-widest flex items-center gap-2"
                      >
                        <FileSpreadsheet size={12} />
                        Export spreadsheet
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>

              {/* Enriched Attributes Dashboard */}
              {enrichedData[selectedProduct.id] ? (
                <div className="space-y-6">
                  {/* Tab Headers */}
                  <div className="flex border-b border-neutral-900 overflow-x-auto whitespace-nowrap">
                    {(['identity', 'description', 'specifications', 'compliance', 'variations'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-mono text-[9px] uppercase tracking-widest border-b-2 transition-all ${
                          activeTab === tab 
                            ? 'border-accent text-accent font-bold' 
                            : 'border-transparent text-neutral-500 hover:text-neutral-300'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-lg">
                    {activeTab === 'identity' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-600">Model Name</label>
                          <input 
                            type="text" 
                            value={enrichedData[selectedProduct.id].modelName}
                            onChange={e => handleEditEnrichAttribute('modelName', e.target.value)}
                            className="w-full bg-black border border-neutral-900 p-3 font-mono text-xs focus:border-accent outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-600">Collection Name</label>
                          <input 
                            type="text" 
                            value={enrichedData[selectedProduct.id].collectionName}
                            onChange={e => handleEditEnrichAttribute('collectionName', e.target.value)}
                            className="w-full bg-black border border-neutral-900 p-3 font-mono text-xs focus:border-accent outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-600">Amazon Brand Name</label>
                          <input 
                            type="text" 
                            disabled
                            value={globalSettings?.amazonBrandName || 'CHILS & CO.'}
                            className="w-full bg-neutral-900/50 border border-neutral-900 p-3 font-mono text-xs text-neutral-500 outline-none"
                          />
                          <p className="text-[7px] text-neutral-700 uppercase tracking-wider">Configure once in Admin Coordinates settings.</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-600">Parent SKU</label>
                          <input 
                            type="text" 
                            disabled
                            value={`P-${selectedProduct.id}`}
                            className="w-full bg-neutral-900/50 border border-neutral-900 p-3 font-mono text-xs text-neutral-500 outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'description' && (
                      <div className="space-y-6">
                        {/* Bullet Points */}
                        <div className="space-y-3">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 block">Amazon Key Product Highlights (Bullet Points)</label>
                          {enrichedData[selectedProduct.id].bulletPoints.map((bp, index) => (
                            <div key={index} className="flex gap-3">
                              <span className="w-6 h-10 border border-neutral-900 bg-neutral-900/30 flex items-center justify-center text-[10px] font-mono text-neutral-600">{index + 1}</span>
                              <input 
                                type="text" 
                                value={bp}
                                onChange={e => {
                                  const list = [...enrichedData[selectedProduct.id].bulletPoints];
                                  list[index] = e.target.value;
                                  handleEditEnrichAttribute('bulletPoints', list);
                                }}
                                className="w-full bg-black border border-neutral-900 p-3 text-xs focus:border-accent outline-none"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Search Terms */}
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 block">Generic Keywords / Search Terms</label>
                          <textarea 
                            value={enrichedData[selectedProduct.id].genericKeywords}
                            onChange={e => handleEditEnrichAttribute('genericKeywords', e.target.value)}
                            rows={3}
                            className="w-full bg-black border border-neutral-900 p-3 font-mono text-xs focus:border-accent outline-none resize-none"
                          />
                          <p className="text-[7px] text-neutral-600 uppercase tracking-wider">Separate keywords with semicolons. Limit to 250 bytes.</p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'specifications' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-600">Sleeve Length</label>
                          <select 
                            value={enrichedData[selectedProduct.id].sleeveLengthDescription}
                            onChange={e => handleEditEnrichAttribute('sleeveLengthDescription', e.target.value)}
                            className="w-full bg-black border border-neutral-900 p-3 font-mono text-xs focus:border-accent outline-none text-white appearance-none"
                          >
                            <option value="Long Sleeve">Long Sleeve</option>
                            <option value="Short Sleeve">Short Sleeve</option>
                            <option value="Sleeveless">Sleeveless</option>
                            <option value="3/4 Sleeve">3/4 Sleeve</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-600">Closure Type</label>
                          <select 
                            value={enrichedData[selectedProduct.id].closureType}
                            onChange={e => handleEditEnrichAttribute('closureType', e.target.value)}
                            className="w-full bg-black border border-neutral-900 p-3 font-mono text-xs focus:border-accent outline-none text-white appearance-none"
                          >
                            <option value="Pull-On">Pull-On</option>
                            <option value="Button">Button</option>
                            <option value="Zipper">Zipper</option>
                            <option value="Drawstring">Drawstring</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-600">Fabric Stretch</label>
                          <select 
                            value={enrichedData[selectedProduct.id].apparelFabricStretch}
                            onChange={e => handleEditEnrichAttribute('apparelFabricStretch', e.target.value)}
                            className="w-full bg-black border border-neutral-900 p-3 font-mono text-xs focus:border-accent outline-none text-white appearance-none"
                          >
                            <option value="Low Stretch">Low Stretch</option>
                            <option value="Non-Stretch">Non-Stretch</option>
                            <option value="Medium Stretch">Medium Stretch</option>
                            <option value="High Stretch">High Stretch</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-600">Fabric Weight Class</label>
                          <select 
                            value={enrichedData[selectedProduct.id].apparelFabricWeightClass}
                            onChange={e => handleEditEnrichAttribute('apparelFabricWeightClass', e.target.value)}
                            className="w-full bg-black border border-neutral-900 p-3 font-mono text-xs focus:border-accent outline-none text-white appearance-none"
                          >
                            <option value="Heavyweight">Heavyweight</option>
                            <option value="Medium weight">Medium weight</option>
                            <option value="Lightweight">Lightweight</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-600">Fit Sentiment</label>
                          <select 
                            value={enrichedData[selectedProduct.id].fitToSizeSentiment}
                            onChange={e => handleEditEnrichAttribute('fitToSizeSentiment', e.target.value)}
                            className="w-full bg-black border border-neutral-900 p-3 font-mono text-xs focus:border-accent outline-none text-white appearance-none"
                          >
                            <option value="True to Size">True to Size</option>
                            <option value="Runs Large">Runs Large</option>
                            <option value="Runs Small">Runs Small</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-600">Item Weight (Grams)</label>
                          <input 
                            type="number" 
                            value={enrichedData[selectedProduct.id].itemWeightGrams}
                            onChange={e => handleEditEnrichAttribute('itemWeightGrams', parseInt(e.target.value, 10))}
                            className="w-full bg-black border border-neutral-900 p-3 font-mono text-xs focus:border-accent outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'compliance' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 block">Country of Origin</label>
                            <input type="text" disabled value={globalSettings?.amazonOriginCountry || 'India'} className="w-full bg-neutral-900/50 border border-neutral-900 p-3 font-mono text-xs text-neutral-500 outline-none" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 block">Fulfillment Channel</label>
                            <input type="text" disabled value={globalSettings?.amazonFulfillmentChannel || 'Merchant Fulfilled'} className="w-full bg-neutral-900/50 border border-neutral-900 p-3 font-mono text-xs text-neutral-500 outline-none" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 block">Importer Details</label>
                          <textarea disabled value={globalSettings?.amazonImporterContact || ''} className="w-full bg-neutral-900/50 border border-neutral-900 p-3 font-mono text-[10px] text-neutral-500 outline-none resize-none h-16" />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 block">Packer Details</label>
                          <textarea disabled value={globalSettings?.amazonPackerContact || ''} className="w-full bg-neutral-900/50 border border-neutral-900 p-3 font-mono text-[10px] text-neutral-500 outline-none resize-none h-16" />
                        </div>
                      </div>
                    )}

                    {activeTab === 'variations' && (
                      <div className="space-y-6">
                        {/* Color Mapping Grid */}
                        <div className="space-y-3">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 block">Color Mapping (Store Color → Amazon Map)</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(enrichedData[selectedProduct.id].colorMap).map(([rawColor, mappedColor]) => (
                              <div key={rawColor} className="flex items-center gap-3 p-3 bg-black border border-neutral-900 rounded">
                                <span className="font-mono text-[10px] uppercase text-neutral-400 w-1/2 line-clamp-1">{rawColor}</span>
                                <select
                                  value={mappedColor}
                                  onChange={e => handleEditColorMap(rawColor, e.target.value)}
                                  className="bg-neutral-900 border border-neutral-800 p-2 font-mono text-[10px] uppercase tracking-wider focus:border-accent outline-none text-white w-1/2 appearance-none text-center"
                                >
                                  {["Black", "Grey", "White", "Blue", "Red", "Green", "Yellow", "Orange", "Pink", "Purple", "Brown", "Beige", "Multicolour"].map(option => (
                                    <option key={option} value={option}>{option}</option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* SKUs Feed Previews */}
                        <div className="space-y-3 pt-6 border-t border-neutral-900">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 block">Listing Variation Previews</label>
                          <div className="border border-neutral-900 rounded overflow-hidden text-[9px] font-mono">
                            <div className="grid grid-cols-4 p-3 bg-neutral-900/50 border-b border-neutral-900 font-bold uppercase tracking-wider text-neutral-500">
                              <span>SKU</span>
                              <span>Color</span>
                              <span>Size</span>
                              <span className="text-right">Price</span>
                            </div>
                            <div className="divide-y divide-neutral-900 bg-black max-h-[250px] overflow-y-auto pr-1">
                              {/* Parent preview */}
                              <div className="grid grid-cols-4 p-3 text-neutral-500 italic">
                                <span>P-{selectedProduct.id}</span>
                                <span>[Container]</span>
                                <span>[Container]</span>
                                <span className="text-right">-</span>
                              </div>
                              {/* Children preview */}
                              {selectedProduct.variations?.map(v => {
                                const color = v.attributes.color || 'Oversized';
                                const size = v.attributes.size || 'Regular';
                                return (
                                  <div key={v.id} className="grid grid-cols-4 p-3 hover:bg-neutral-950 transition-colors">
                                    <span className="font-bold text-neutral-400">C-{selectedProduct.id}-{color.replace(/\s+/g, '')}-${size}</span>
                                    <span>{color}</span>
                                    <span>{size}</span>
                                    <span className="text-right text-accent font-bold">₹{v.price || selectedProduct.price}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center gap-4 border border-dashed border-neutral-900 rounded-lg bg-neutral-950/10">
                  <Cpu className="text-neutral-800" size={32} />
                  <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-600">AI analysis needed to synthesize attributes.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-neutral-900 bg-neutral-950/20 p-8 rounded-xl h-full flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
              <Sparkles className="text-neutral-800" size={48} />
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Enrichment Terminal</h3>
              <p className="text-[10px] text-neutral-700 uppercase tracking-widest max-w-sm">Select a product from the catalog list to map and synthesize Amazon Seller attributes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AmazonConsole;
