import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";

export default function OBSOverlay() {
  const [product, setProduct] = useState<{ title: string; price: string; image?: string } | null>(null);
  const [status, setStatus] = useState<'idle' | 'searching' | 'ready' | 'live'>('idle');

  // Listen for updates from the main control panel (via localStorage or WebSocket)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'obs_product_data') {
        const data = e.newValue ? JSON.parse(e.newValue) : null;
        setProduct(data);
      }
      if (e.key === 'obs_status') {
        setStatus(e.newValue as any || 'idle');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Initial load
    const savedProduct = localStorage.getItem('obs_product_data');
    const savedStatus = localStorage.getItem('obs_status');
    if (savedProduct) setProduct(JSON.parse(savedProduct));
    if (savedStatus) setStatus(savedStatus as any);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <ProductCard 
        title={product?.title || ""} 
        price={product?.price || ""} 
        image={product?.image}
        status={status}
        className="max-w-md"
      />
    </div>
  );
}
