import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../AuthContext';
import { 
  ArrowLeft, Activity, Cpu, Sparkles, FileSpreadsheet, Download, RefreshCw, 
  Settings, CheckCircle2, AlertTriangle, Package, Tag, Globe, Truck, List, Edit3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import writeXlsxFile from 'write-excel-file';

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
  const [enrichedData, setEnrichedData] = useState<Record<string, EnrichedAttributes>>({});
  const [globalSettings, setGlobalSettings] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'identity' | 'description' | 'specifications' | 'compliance' | 'variations'>('identity');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

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

  // Trigger Gemini AI enrichment
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

  // Compile spreadsheet rows & columns matching Amazon Seller Apparel flat file
  const handleExport = async (product: Product) => {
    const data = enrichedData[product.id];
    if (!data) {
      showNotification('error', 'Please run AI Auto-fill first to generate necessary attributes.');
      return;
    }

    const brand = globalSettings.amazonBrandName || 'CHILS & CO.';
    const manufacturer = globalSettings.amazonManufacturer || 'CHILS & CO.';
    const origin = globalSettings.amazonOriginCountry || 'India';
    const fulfillment = globalSettings.amazonFulfillmentChannel || 'Merchant Fulfilled';
    const handling = globalSettings.amazonHandlingTime || '5';
    const pkgLength = globalSettings.amazonDefaultPkgLength || '35';
    const pkgWidth = globalSettings.amazonDefaultPkgWidth || '25';
    const pkgHeight = globalSettings.amazonDefaultPkgHeight || '5';
    const pkgWeight = globalSettings.amazonDefaultPkgWeight || '500';
    const importer = globalSettings.amazonImporterContact || '';
    const packer = globalSettings.amazonPackerContact || '';

    // Schema definition for write-excel-file
    const schema = [
      { column: 'Feed Product Type', type: String, value: (r: any) => r.feed_product_type, width: 15 },
      { column: 'Seller SKU', type: String, value: (r: any) => r.item_sku, width: 20 },
      { column: 'Brand Name', type: String, value: (r: any) => r.brand_name, width: 15 },
      { column: 'Item Name', type: String, value: (r: any) => r.item_name, width: 45 },
      { column: 'Update Delete', type: String, value: (r: any) => r.update_delete, width: 12 },
      { column: 'Product Description', type: String, value: (r: any) => r.product_description, width: 40 },
      { column: 'Standard Price', type: Number, value: (r: any) => r.standard_price, width: 12 },
      { column: 'Quantity', type: Number, value: (r: any) => r.quantity, width: 10 },
      { column: 'Part Number', type: String, value: (r: any) => r.part_number, width: 20 },
      { column: 'Manufacturer', type: String, value: (r: any) => r.manufacturer, width: 15 },
      { column: 'Model Name', type: String, value: (r: any) => r.model_name, width: 15 },
      { column: 'Bullet Point 1', type: String, value: (r: any) => r.bullet_point1, width: 35 },
      { column: 'Bullet Point 2', type: String, value: (r: any) => r.bullet_point2, width: 35 },
      { column: 'Bullet Point 3', type: String, value: (r: any) => r.bullet_point3, width: 35 },
      { column: 'Bullet Point 4', type: String, value: (r: any) => r.bullet_point4, width: 35 },
      { column: 'Bullet Point 5', type: String, value: (r: any) => r.bullet_point5, width: 35 },
      { column: 'Search Terms', type: String, value: (r: any) => r.generic_keywords, width: 35 },
      { column: 'Parentage', type: String, value: (r: any) => r.parentage, width: 10 },
      { column: 'Parent SKU', type: String, value: (r: any) => r.parent_sku, width: 20 },
      { column: 'Relationship Type', type: String, value: (r: any) => r.relationship_type, width: 15 },
      { column: 'Variation Theme', type: String, value: (r: any) => r.variation_theme, width: 15 },
      { column: 'Color Name', type: String, value: (r: any) => r.color_name, width: 15 },
      { column: 'Color Map', type: String, value: (r: any) => r.color_map, width: 15 },
      { column: 'Size Name', type: String, value: (r: any) => r.size_name, width: 10 },
      { column: 'Size Map', type: String, value: (r: any) => r.size_map, width: 10 },
      { column: 'Fabric Type', type: String, value: (r: any) => r.fabric_type, width: 15 },
      { column: 'Material Composition', type: String, value: (r: any) => r.material_composition, width: 15 },
      { column: 'Care Instructions', type: String, value: (r: any) => r.care_instructions, width: 15 },
      { column: 'Sleeve Length Description', type: String, value: (r: any) => r.sleeve_length_description, width: 15 },
      { column: 'Closure Type', type: String, value: (r: any) => r.closure_type, width: 15 },
      { column: 'Apparel Fabric Weight Class', type: String, value: (r: any) => r.apparel_fabric_weight_class, width: 15 },
      { column: 'Garment Size Country', type: String, value: (r: any) => r.garment_size_country, width: 15 },
      { column: 'Shoulder to Bottom Hem Length', type: Number, value: (r: any) => r.shoulder_to_bottom_hem_length, width: 12 },
      { column: 'Shoulder to Bottom Hem Length Unit', type: String, value: (r: any) => r.shoulder_to_bottom_hem_length_unit, width: 12 },
      { column: 'Apparel Fabric Stretch', type: String, value: (r: any) => r.apparel_fabric_stretch, width: 15 },
      { column: 'Fit to Size Sentiment', type: String, value: (r: any) => r.fit_to_size_sentiment, width: 15 },
      { column: 'Item Weight', type: Number, value: (r: any) => r.item_weight, width: 12 },
      { column: 'Item Weight Unit', type: String, value: (r: any) => r.item_weight_unit, width: 12 },
      { column: 'Country of Origin', type: String, value: (r: any) => r.country_of_origin, width: 15 },
      { column: 'Importer Address', type: String, value: (r: any) => r.importer_address, width: 35 },
      { column: 'Packer Address', type: String, value: (r: any) => r.packer_address, width: 35 },
      { column: 'Fulfillment Channel', type: String, value: (r: any) => r.fulfillment_channel, width: 15 },
      { column: 'Handling Time', type: Number, value: (r: any) => r.handling_time, width: 12 },
      { column: 'Package Length', type: Number, value: (r: any) => r.package_length, width: 12 },
      { column: 'Package Width', type: Number, value: (r: any) => r.package_width, width: 12 },
      { column: 'Package Height', type: Number, value: (r: any) => r.package_height, width: 12 },
      { column: 'Package Weight', type: Number, value: (r: any) => r.package_weight, width: 12 },
    ];

    const rows: any[] = [];
    const parentSku = `P-${product.id}`;

    // 1. Create Parent Row (acts as container for variations)
    rows.push({
      feed_product_type: 'apparel',
      item_sku: parentSku,
      brand_name: brand,
      item_name: product.name,
      update_delete: 'Update',
      product_description: product.description,
      standard_price: null,
      quantity: null,
      part_number: parentSku,
      manufacturer: manufacturer,
      model_name: data.modelName,
      bullet_point1: data.bulletPoints[0] || '',
      bullet_point2: data.bulletPoints[1] || '',
      bullet_point3: data.bulletPoints[2] || '',
      bullet_point4: data.bulletPoints[3] || '',
      bullet_point5: data.bulletPoints[4] || '',
      generic_keywords: data.genericKeywords,
      parentage: 'parent',
      parent_sku: '',
      relationship_type: '',
      variation_theme: 'SizeColor',
      color_name: '',
      color_map: '',
      size_name: '',
      size_map: '',
      fabric_type: data.apparelFabricWeightClass === 'Heavyweight' ? 'French Terry' : 'Cotton Knit',
      material_composition: product.material || '100% Cotton',
      care_instructions: product.care || 'Machine Wash',
      sleeve_length_description: data.sleeveLengthDescription,
      closure_type: data.closureType,
      apparel_fabric_weight_class: data.apparelFabricWeightClass,
      garment_size_country: 'India',
      shoulder_to_bottom_hem_length: 70,
      shoulder_to_bottom_hem_length_unit: 'Centimentres',
      apparel_fabric_stretch: data.apparelFabricStretch,
      fit_to_size_sentiment: data.fitToSizeSentiment,
      item_weight: data.itemWeightGrams,
      item_weight_unit: 'Grams',
      country_of_origin: origin,
      importer_address: importer,
      packer_address: packer,
      fulfillment_channel: fulfillment,
      handling_time: parseInt(handling, 10),
      package_length: parseInt(pkgLength, 10),
      package_width: parseInt(pkgWidth, 10),
      package_height: parseInt(pkgHeight, 10),
      package_weight: parseInt(pkgWeight, 10),
    });

    // 2. Create Child Rows for each variation
    if (product.variations && product.variations.length > 0) {
      product.variations.forEach(v => {
        const color = v.attributes.color || 'Oversized';
        const size = v.attributes.size || 'Regular';
        const childSku = `C-${product.id}-${color.replace(/\s+/g, '')}-${size}`;
        const mappedColor = data.colorMap[color] || 'Multicolour';

        rows.push({
          feed_product_type: 'apparel',
          item_sku: childSku,
          brand_name: brand,
          item_name: `${product.name} (Color: ${color}, Size: ${size})`,
          update_delete: 'Update',
          product_description: product.description,
          standard_price: v.price || product.price,
          quantity: v.stockQuantity,
          part_number: childSku,
          manufacturer: manufacturer,
          model_name: data.modelName,
          bullet_point1: data.bulletPoints[0] || '',
          bullet_point2: data.bulletPoints[1] || '',
          bullet_point3: data.bulletPoints[2] || '',
          bullet_point4: data.bulletPoints[3] || '',
          bullet_point5: data.bulletPoints[4] || '',
          generic_keywords: data.genericKeywords,
          parentage: 'child',
          parent_sku: parentSku,
          relationship_type: 'Variation',
          variation_theme: 'SizeColor',
          color_name: color,
          color_map: mappedColor,
          size_name: size,
          size_map: size,
          fabric_type: data.apparelFabricWeightClass === 'Heavyweight' ? 'French Terry' : 'Cotton Knit',
          material_composition: product.material || '100% Cotton',
          care_instructions: product.care || 'Machine Wash',
          sleeve_length_description: data.sleeveLengthDescription,
          closure_type: data.closureType,
          apparel_fabric_weight_class: data.apparelFabricWeightClass,
          garment_size_country: 'India',
          shoulder_to_bottom_hem_length: 70,
          shoulder_to_bottom_hem_length_unit: 'Centimentres',
          apparel_fabric_stretch: data.apparelFabricStretch,
          fit_to_size_sentiment: data.fitToSizeSentiment,
          item_weight: data.itemWeightGrams,
          item_weight_unit: 'Grams',
          country_of_origin: origin,
          importer_address: importer,
          packer_address: packer,
          fulfillment_channel: fulfillment,
          handling_time: parseInt(handling, 10),
          package_length: parseInt(pkgLength, 10),
          package_width: parseInt(pkgWidth, 10),
          package_height: parseInt(pkgHeight, 10),
          package_weight: parseInt(pkgWeight, 10),
        });
      });
    }

    try {
      // Export spreadsheet
      await writeXlsxFile(rows, {
        schema,
        fileName: `Amazon_Listing_Feed_${product.name.replace(/\s+/g, '_')}.xlsx`,
      });
      showNotification('success', 'Spreadsheet generated and downloaded.');
    } catch (err) {
      console.error(err);
      showNotification('error', 'Spreadsheet export failed.');
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Product Catalog List */}
        <div className="lg:col-span-5 border border-neutral-900 bg-neutral-950/40 p-8 rounded-xl space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">WooCommerce Catalog ({products.length})</h3>
            <List size={14} className="text-neutral-700" />
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {products.map(product => {
              const enriched = !!enrichedData[product.id];
              const isSelected = selectedProduct?.id === product.id;

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
                        onClick={() => handleExport(selectedProduct)}
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
                                    <span className="font-bold text-neutral-400">C-{selectedProduct.id}-{color.replace(/\s+/g, '')}-{size}</span>
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
