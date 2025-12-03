import { useState, useEffect, useRef } from "react";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { useCamera } from "@/hooks/useCamera";
import { useProductHistory } from "@/hooks/useProductHistory";
import { ProductCard } from "@/components/ProductCard";
import { ControlPanel } from "@/components/ControlPanel";
import { CameraSelector } from "@/components/CameraSelector";
import { ProductHistory } from "@/components/ProductHistory";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { isListening, transcript, startListening, stopListening, resetTranscript } = useVoiceRecognition();
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
  const [audioTranscript, setAudioTranscript] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const [extractionData, setExtractionData] = useState<{
    originalQuery?: string;
    extractedFromVoice?: string;
    extractedFromVision?: string;
    finalQuery?: string;
  }>({});
  const [barcodeInput, setBarcodeInput] = useState<string>("");
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [alwaysListening, setAlwaysListening] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  
  const { addToHistory } = useProductHistory();

  const searchMutation = trpc.amazon.search.useMutation();

  // Auto-search when transcript settles (simple debounce logic for now)
  useEffect(() => {
    if (!isListening && transcript.length > 3 && status === 'idle') {
      handleSearch(transcript, null);
    }
  }, [isListening, transcript, status]);

  // Keyboard shortcuts for Stream Deck integration
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Shift (or Cmd+Shift on Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        switch(e.key.toUpperCase()) {
          case 'A':
            e.preventDefault();
            handleCaptureAudio();
            break;
          case 'I':
            e.preventDefault();
            handleCaptureImage();
            break;
          case 'B':
            e.preventDefault();
            handleToggleScanner();
            break;
          case '1':
            e.preventDefault();
            if (products.length >= 1) setSelectedProductIndex(0);
            break;
          case '2':
            e.preventDefault();
            if (products.length >= 2) setSelectedProductIndex(1);
            break;
          case '3':
            e.preventDefault();
            if (products.length >= 3) setSelectedProductIndex(2);
            break;
          case 'L':
            e.preventDefault();
            handlePushToLive();
            break;
          case 'R':
            e.preventDefault();
            handleReset();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, isListening]);

  const handleSearch = async (query: string, capturedImage: string | null) => {
    setStatus('searching');
    localStorage.setItem('obs_status', 'searching');
    try {
      const result = await searchMutation.mutateAsync({ 
        query,
        image: capturedImage || undefined
      });
      console.log('=== SEARCH RESULT ===');
      console.log('Full result:', result);
      console.log('Products array:', result.products);
      console.log('Products length:', result.products?.length);
      result.products?.forEach((p, i) => {
        console.log(`Product ${i}:`, {
          title: p.title,
          price: p.price,
          image: p.image,
          imageType: typeof p.image
        });
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
      setIsAnalyzing(false);
      localStorage.setItem('obs_product_data', JSON.stringify(result.products[0]));
      localStorage.setItem('obs_status', 'ready');
      
      // Add first product to history
      if (result.products.length > 0) {
        addToHistory(result.products[0], result.finalQuery || query);
      }
    } catch (error) {
      console.error("Search failed", error);
      setStatus('idle');
      setIsAnalyzing(false);
      localStorage.setItem('obs_status', 'idle');
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Could not identify product')) {
        // Vision/voice extraction failed - show helpful message
        alert('❌ No product identified\n\nPlease try:\n• Speaking the product name clearly (AUDIO)\n• Showing product packaging to camera (IMAGE)\n• Scanning the barcode (BARCODE)');
      } else {
        // Other error - show generic message
        alert(`Search failed: ${errorMessage}`);
      }
    }
  };

  const handleToggleScanner = () => {
    setIsScannerActive(!isScannerActive);
    if (!isScannerActive) {
      // Auto-focus the input when activating
      setTimeout(() => barcodeInputRef.current?.focus(), 100);
    }
  };

  const handleBarcodeSubmit = () => {
    if (barcodeInput.trim()) {
      console.log('[Barcode] Scanned:', barcodeInput);
      handleSearch(barcodeInput, null);
      setBarcodeInput("");
      if (!alwaysListening) {
        setIsScannerActive(false);
      }
    }
  };

  const handleToggleAlwaysListening = () => {
    setAlwaysListening(!alwaysListening);
    if (!alwaysListening) {
      // When enabling always listening, auto-focus the input
      setTimeout(() => barcodeInputRef.current?.focus(), 100);
    }
  };

  // Auto-focus barcode input when always listening is enabled
  useEffect(() => {
    if (alwaysListening && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [alwaysListening]);

  const handleCaptureAudio = () => {
    if (isListening) {
      // Stop listening and save transcript
      stopListening();
      setAudioTranscript(transcript);
      setHasAudio(true);
      console.log('[Audio] Captured:', transcript);
      
      // Auto-trigger search if image is also ready
      if (hasImage && capturedImage) {
        handleSearch(transcript, capturedImage);
      }
    } else {
      // Start voice recording
      setAudioTranscript("");
      setHasAudio(false);
      startListening();
    }
  };
  
  const handleCaptureImage = () => {
    // FULL SCREEN FLASH EFFECT
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 200);
    
    // Capture image from camera
    const captured = captureFrame();
    console.log('[Image] Captured:', captured ? 'YES (length: ' + captured.length + ')' : 'NO');
    setCapturedImage(captured);
    setHasImage(true);
    
    // Auto-trigger search immediately (works standalone or with audio)
    if (hasAudio && audioTranscript) {
      // Hybrid mode: use both audio and image
      handleSearch(audioTranscript, captured);
    } else {
      // Image-only mode: use vision extraction
      handleSearch('', captured);
    }
  };

  const handlePushToLive = () => {
    setStatus('live');
    localStorage.setItem('obs_status', 'live');
    // Here we would trigger the OBS scene switch via WebSocket
    console.log("Switching OBS Scene...");
  };
  
  const handleReset = () => {
    // Clear all product and capture data
    setProducts([]);
    setSelectedProductIndex(0);
    setCapturedImage(null);
    setAudioTranscript("");
    setHasAudio(false);
    setHasImage(false);
    setBarcodeInput("");
    setIsScannerActive(false);
    setExtractionData({});
    setStatus('idle');
    setIsAnalyzing(false);
    
    // Clear transcript display
    resetTranscript();
    
    // Stop listening if active
    if (isListening) {
      stopListening();
    }
    
    // Note: Camera remains enabled after reset
    localStorage.setItem('obs_status', 'idle');
  };

  return (
    <div className="min-h-screen bg-[url('/images/cyber-grid-bg.png')] bg-cover bg-center flex flex-col items-center justify-center p-8 relative">
      {/* FULL SCREEN CAMERA FLASH */}
      {showFlash && (
        <div className="fixed inset-0 bg-white z-[9999] animate-pulse" />
      )}
      
      {/* ANALYZING OVERLAY */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/70 z-[9998] flex items-center justify-center">
          <div className="bg-primary/20 border-2 border-primary p-8 rounded-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <h2 className="font-['Chakra_Petch'] font-bold text-2xl text-primary">ANALYZING IMAGE...</h2>
              <p className="font-mono text-sm text-primary/70">AI is processing your product</p>
            </div>
          </div>
        </div>
      )}
      
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
          
          <p className="text-xs font-mono text-muted-foreground mt-2">
            * Configure OBS Browser Source to crop to this area.
          </p>
        </div>

        {/* Right Column: The Control Deck (What you see) */}
        <div className="flex flex-col gap-4 relative">
          {/* Flash Feedback Overlay */}
          {isCapturing && (
            <div className="absolute inset-0 bg-white/30 z-50 rounded-sm animate-pulse pointer-events-none" />
          )}
           <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-muted-foreground rounded-sm" />
            <h2 className="text-lg font-['Chakra_Petch'] font-bold text-muted-foreground">OPERATOR CONSOLE</h2>
          </div>

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
            </div>
          )}
          
          <ControlPanel 
            isListening={isListening}
            transcript={transcript}
            onCaptureAudio={handleCaptureAudio}
            onCaptureImage={handleCaptureImage}
            onReset={handleReset}
            onPushToLive={handlePushToLive}
            status={status}
            hasAudio={hasAudio}
            hasImage={hasImage}
            barcodeInput={barcodeInput}
            onBarcodeChange={setBarcodeInput}
            onBarcodeSubmit={handleBarcodeSubmit}
            isScannerActive={isScannerActive}
            onToggleScanner={handleToggleScanner}
            alwaysListening={alwaysListening}
            onToggleAlwaysListening={handleToggleAlwaysListening}
            barcodeInputRef={barcodeInputRef}
          />

          {/* Captured Image Preview */}
          {capturedImage && (
            <div className="bg-purple-950/30 border border-purple-500/30 p-3 rounded-sm">
              <h3 className="font-['Chakra_Petch'] font-bold text-sm text-purple-400 mb-3 flex items-center gap-2">
                📸 CAPTURED IMAGE
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">ANALYZED</span>
              </h3>
              <img 
                src={capturedImage} 
                alt="Captured product" 
                className="w-full rounded border border-purple-500/30 bg-black/50"
              />
              <p className="text-xs font-mono text-purple-300 mt-2">This image was analyzed by AI vision</p>
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
      
      {/* History Button - Bottom Right Corner */}
      <button
        onClick={() => setIsHistoryOpen(true)}
        className="fixed bottom-6 right-6 bg-primary hover:bg-primary/90 text-primary-foreground font-['Chakra_Petch'] font-bold py-3 px-5 rounded-sm shadow-lg border-2 border-primary/50 flex items-center gap-2 z-50 transition-transform hover:scale-105"
      >
        <span className="text-xl">📜</span>
        HISTORY
      </button>
      
      {/* Product History Modal */}
      <ProductHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onPushLive={(product) => {
          setProducts([product]);
          setSelectedProductIndex(0);
          setStatus('ready');
          localStorage.setItem('obs_product_data', JSON.stringify(product));
          localStorage.setItem('obs_status', 'ready');
        }}
      />
    </div>
  );
}
