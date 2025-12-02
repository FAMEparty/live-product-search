import { useState, useEffect } from "react";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { ProductCard } from "@/components/ProductCard";
import { ControlPanel } from "@/components/ControlPanel";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { isListening, transcript, startListening, stopListening } = useVoiceRecognition();
  const [status, setStatus] = useState<'idle' | 'searching' | 'ready' | 'live'>('idle');
  const [product, setProduct] = useState<{ title: string; price: string; image?: string; url?: string } | null>(null);

  const searchMutation = trpc.amazon.search.useMutation();

  // Auto-search when transcript settles (simple debounce logic for now)
  useEffect(() => {
    if (!isListening && transcript.length > 3 && status === 'idle') {
      handleSearch(transcript);
    }
  }, [isListening, transcript, status]);

  const handleSearch = async (query: string) => {
    setStatus('searching');
    localStorage.setItem('obs_status', 'searching');
    try {
      const result = await searchMutation.mutateAsync({ query });
      setProduct(result);
      setStatus('ready');
      localStorage.setItem('obs_product_data', JSON.stringify(result));
      localStorage.setItem('obs_status', 'ready');
    } catch (error) {
      console.error("Search failed", error);
      setStatus('idle');
      localStorage.setItem('obs_status', 'idle');
    }
  };

  const handleToggleListen = () => {
    if (isListening) {
      stopListening();
    } else {
      setProduct(null);
      setStatus('idle');
      startListening();
    }
  };

  const handlePushToLive = () => {
    setStatus('live');
    localStorage.setItem('obs_status', 'live');
    // Here we would trigger the OBS scene switch via WebSocket
    console.log("Switching OBS Scene...");
  };

  const handleReset = () => {
    setProduct(null);
    setStatus('idle');
    stopListening();
    localStorage.removeItem('obs_product_data');
    localStorage.setItem('obs_status', 'idle');
  };

  return (
    <div className="min-h-screen bg-[url('/images/cyber-grid-bg.png')] bg-cover bg-center flex flex-col items-center justify-center p-8 relative">
      {/* Overlay Background (Simulates OBS View) */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: The "Live" Preview (What OBS sees) */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-primary rounded-sm" />
            <h2 className="text-lg font-['Chakra_Petch'] font-bold text-foreground">OBS PREVIEW</h2>
          </div>
          
          {/* This is the component OBS will capture */}
          <div className="border-2 border-dashed border-primary/30 p-4 rounded-lg bg-black/20">
            <ProductCard 
              title={product?.title || ""} 
              price={product?.price || ""} 
              image={product?.image}
              status={status}
            />
          </div>
          
          <p className="text-xs font-mono text-muted-foreground mt-2">
            * Configure OBS Browser Source to crop to this area.
          </p>
        </div>

        {/* Right Column: The Control Deck (What you see) */}
        <div className="flex flex-col gap-4">
           <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-muted-foreground rounded-sm" />
            <h2 className="text-lg font-['Chakra_Petch'] font-bold text-muted-foreground">OPERATOR CONSOLE</h2>
          </div>
          
          <ControlPanel 
            isListening={isListening}
            transcript={transcript}
            onToggleListen={handleToggleListen}
            onReset={handleReset}
            onPushToLive={handlePushToLive}
            status={status}
          />

          {/* Instructions */}
          <div className="bg-card/50 border border-border p-4 rounded-sm text-sm text-muted-foreground">
            <h3 className="font-bold text-foreground mb-2">HOW TO USE:</h3>
            <ul className="list-disc list-inside space-y-1 font-mono text-xs">
              <li>Press "PUSH TO TALK" (or Stream Deck button)</li>
              <li>Say product name (e.g. "Nike Air Max")</li>
              <li>Wait for auto-search to complete</li>
              <li>Verify preview on left</li>
              <li>Press "PUSH LIVE" to switch scene</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
