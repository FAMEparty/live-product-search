import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProductCardProps {
  title: string;
  price: string;
  image?: string;
  status: 'idle' | 'searching' | 'ready' | 'live';
  className?: string;
}

export function ProductCard({ title, price, image, status, className }: ProductCardProps) {
  return (
    <div className={cn("relative w-full max-w-md overflow-hidden rounded-sm bg-card/90 border border-border backdrop-blur-sm", className)}>
      {/* Cyber-Industrial Frame Elements */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
      
      {/* Status Indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full animate-pulse", 
          status === 'live' ? "bg-red-500" : 
          status === 'ready' ? "bg-primary" : 
          status === 'searching' ? "bg-blue-400" : "bg-slate-600"
        )} />
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {status === 'live' ? "ON AIR" : status}
        </span>
      </div>

      <div className="p-4 flex gap-4">
        {/* Product Image Area */}
        <div className="w-24 h-24 bg-black/50 rounded-sm border border-border/50 flex items-center justify-center overflow-hidden shrink-0">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-contain" />
          ) : (
            <div className="text-xs text-muted-foreground font-mono text-center p-2">
              {status === 'searching' ? "SCANNING..." : "NO SIGNAL"}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-between min-w-0 flex-1">
          <div>
            <h3 className="font-['Chakra_Petch'] font-bold text-lg leading-tight line-clamp-2 text-foreground">
              {title || "Waiting for input..."}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] font-mono text-primary bg-primary/10 px-1 py-0.5 rounded-sm">
                AMAZON.COM
              </span>
              {status === 'searching' && (
                <span className="text-[10px] font-mono text-blue-400 animate-pulse">
                  FETCHING DATA...
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-end justify-between mt-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Retail Price</span>
              <div className="text-2xl font-bold text-primary font-mono tracking-tight">
                {price || "---"}
              </div>
            </div>
            
            {/* Decorative Barcode */}
            <div className="h-6 w-16 opacity-30 flex items-end gap-[1px]">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-foreground w-full" style={{ height: `${Math.random() * 100}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Scanline Overlay */}
      <div className="absolute inset-0 bg-[url('/images/scanlines.png')] opacity-10 pointer-events-none mix-blend-overlay" />
    </div>
  );
}
