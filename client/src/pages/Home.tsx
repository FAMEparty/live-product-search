import { useState, useEffect } from "react";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { useCamera } from "@/hooks/useCamera";
import { ProductCard } from "@/components/ProductCard";
import { ControlPanel } from "@/components/ControlPanel";
import { CameraSelector } from "@/components/CameraSelector";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { isListening, transcript, startListening, stopListening } = useVoiceRecognition();
  const { devices, selectedDeviceId, setSelectedDeviceId, videoRef, captureFrame, error: cameraError, hasCamera, isEnabled, enableCamera } = useCamera();
  
  const [status, setStatus] = useState<'idle' | 'searching' | 'ready' | 'live'>('idle');
  const [products, setProducts] = useState<Array<{
    title: string;
    price: string;
    image: string;
    url: string;
    asin?: string;
  }>>([]);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractionData, setExtractionData] = useState<{
    originalQuery?: string;
    extractedFromVoice?: string;
    extractedFromVision?: string;
    finalQuery?: string;
  }>({});

  const searchMutation = trpc.amazon.search.useMutation();

  // Auto-search when transcript settles (simple debounce logic for now)
  useEffect(() => {
    if (!isListening && transcript.length > 3 && status === 'idle') {
      handleSearch(transcript, null);
    }
  }, [isListening, transcript, status]);

  const handleSearch = async (query: string, capturedImage: string | null) => {
    setStatus('searching');
    localStorage.setItem('obs_status', 'searching');
    try {
      const result = await searchMutation.mutateAsync({ 
        query,
        image: capturedImage || undefined
      });
      setProducts(result.products);
      setSelectedProductIndex(0);
      setCapturedImage(result.capturedImage || null);
      setExtractionData({
        originalQuery: result.originalQuery,
        extractedFromVoice: result.extractedFromVoice,
        extractedFromVision: result.extractedFromVision,
        finalQuery: result.finalQuery,
      });
      setStatus('ready');
      localStorage.setItem('obs_product_data', JSON.stringify(result.products[0]));
      localStorage.setItem('obs_status', 'ready');
    } catch (error) {
      console.error("Search failed", error);
      setStatus('idle');
      localStorage.setItem('obs_status', 'idle');
    }
  };

  const handleCaptureAndListen = () => {
    if (isListening) {
      // Stop listening and process
      stopListening();
      
      // Capture image from camera
      const capturedImage = captureFrame();
      
      // Search with both voice transcript and image
      if (transcript || capturedImage) {
        handleSearch(transcript, capturedImage);
      }
    } else {
      // Start fresh capture + listen session
      setProducts([]);
      setSelectedProductIndex(0);
      setCapturedImage(null);
      setExtractionData({});
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
    setProducts([]);
    setSelectedProductIndex(0);
    setCapturedImage(null);
    setExtractionData({});
    setStatus('idle');
    stopListening();
    localStorage.removeItem('obs_product_data');
    localStorage.setItem('obs_status', 'idle');
  };

  return (
    <div className="min-h-screen bg-[url('/images/cyber-grid-bg.png')] bg-cover bg-center flex flex-col items-center justify-center p-8 relative">
      {/* Overlay Background (Simulates OBS View) */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: The "Live" Preview (What OBS sees) */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-primary rounded-sm" />
            <h2 className="text-lg font-['Chakra_Petch'] font-bold text-foreground">OBS PREVIEW</h2>
          </div>
          
          {/* This is the component OBS will capture */}
          <div className="border-2 border-dashed border-primary/30 p-4 rounded-lg bg-black/20">
            <ProductCard 
              title={products[selectedProductIndex]?.title || ""} 
              price={products[selectedProductIndex]?.price || ""} 
              image={products[selectedProductIndex]?.image}
              status={status}
            />
          </div>
          
          {/* Product Selection (if multiple results) */}
          {products.length > 1 && (
            <div className="bg-card/50 border border-border p-4 rounded-sm">
              <h3 className="font-['Chakra_Petch'] font-bold text-sm text-foreground mb-3">SELECT BEST MATCH:</h3>
              <div className="grid grid-cols-3 gap-2">
                {products.slice(0, 3).map((prod, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedProductIndex(idx);
                      localStorage.setItem('obs_product_data', JSON.stringify(prod));
                    }}
                    className={`p-2 border rounded-sm transition-all ${
                      selectedProductIndex === idx 
                        ? 'border-primary bg-primary/20' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img 
                      src={prod.image} 
                      alt={prod.title} 
                      className="w-full aspect-square object-contain mb-2 bg-white rounded"
                    />
                    <p className="text-xs font-mono text-foreground/70 line-clamp-2">{prod.title}</p>
                    <p className="text-xs font-bold text-primary mt-1">{prod.price}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Captured Image Preview */}
          {capturedImage && (
            <div className="bg-card/50 border border-border p-4 rounded-sm">
              <h3 className="font-['Chakra_Petch'] font-bold text-sm text-foreground mb-3">📸 CAPTURED IMAGE:</h3>
              <img 
                src={capturedImage} 
                alt="Captured product" 
                className="w-full rounded border border-primary/30"
              />
            </div>
          )}
          
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
            onToggleListen={handleCaptureAndListen}
            onReset={handleReset}
            onPushToLive={handlePushToLive}
            status={status}
          />

          {/* Camera Setup */}
          {isEnabled ? (
            <CameraSelector
              devices={devices}
              selectedDeviceId={selectedDeviceId}
              onSelectDevice={setSelectedDeviceId}
              videoRef={videoRef}
              error={cameraError}
            />
          ) : (
            <div className="bg-card/50 border border-border p-4 rounded-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 text-primary">📷</div>
                <h3 className="font-['Chakra_Petch'] font-bold text-sm text-foreground">CAMERA SETUP</h3>
              </div>
              <p className="text-xs font-mono text-muted-foreground mb-3">
                Enable camera access to capture product images for hybrid AI recognition.
              </p>
              <button
                onClick={enableCamera}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-['Chakra_Petch'] font-bold py-2 px-4 rounded-sm text-sm"
              >
                ENABLE CAMERA
              </button>
              {cameraError && (
                <p className="text-xs text-destructive font-mono mt-2">{cameraError}</p>
              )}
            </div>
          )}

          {/* AI Extraction Debug Info */}
          {(extractionData.extractedFromVoice || extractionData.extractedFromVision) && (
            <div className="bg-blue-950/30 border border-blue-500/30 p-3 rounded-sm text-sm">
              <h3 className="font-bold text-blue-400 mb-2 font-mono text-xs">🤖 AI EXTRACTION:</h3>
              <div className="space-y-2 font-mono text-xs">
                {extractionData.originalQuery && (
                  <div>
                    <span className="text-muted-foreground">You said:</span>
                    <p className="text-foreground/70 italic mt-1">" {extractionData.originalQuery} "</p>
                  </div>
                )}
                {extractionData.extractedFromVoice && (
                  <div>
                    <span className="text-green-400">🎤 Voice extracted:</span>
                    <p className="text-green-300 font-bold mt-1">{extractionData.extractedFromVoice}</p>
                  </div>
                )}
                {extractionData.extractedFromVision && (
                  <div>
                    <span className="text-purple-400">📷 Vision extracted:</span>
                    <p className="text-purple-300 font-bold mt-1">{extractionData.extractedFromVision}</p>
                  </div>
                )}
                {extractionData.finalQuery && (
                  <div>
                    <span className="text-blue-400">🔍 Final search:</span>
                    <p className="text-blue-300 font-bold mt-1">{extractionData.finalQuery}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-card/50 border border-border p-4 rounded-sm text-sm text-muted-foreground">
            <h3 className="font-bold text-foreground mb-2">HOW TO USE:</h3>
            <ul className="list-disc list-inside space-y-1 font-mono text-xs">
              <li>Select your camera (Hollyland Venus LIV)</li>
              <li>Press "CAPTURE + LISTEN" (or Stream Deck)</li>
              <li>Hold product up to camera & say name</li>
              <li>AI analyzes image + voice for accuracy</li>
              <li>Verify preview, then "PUSH LIVE"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
