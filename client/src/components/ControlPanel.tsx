import { Button } from "@/components/ui/button";
import { Mic, MicOff, MonitorPlay, RefreshCw, Barcode } from "lucide-react";
import { cn } from "@/lib/utils";

interface ControlPanelProps {
  isListening: boolean;
  transcript: string;
  onCaptureAudio: () => void;
  onCaptureImage: () => void;
  onReset: () => void;
  onPushToLive: () => void;
  status: 'idle' | 'searching' | 'ready' | 'live';
  hasAudio: boolean;
  hasImage: boolean;
  barcodeInput: string;
  onBarcodeChange: (value: string) => void;
  onBarcodeSubmit: () => void;
  isScannerActive: boolean;
  onToggleScanner: () => void;
  alwaysListening: boolean;
  onToggleAlwaysListening: () => void;
  barcodeInputRef: React.RefObject<HTMLInputElement | null>;
}

export function ControlPanel({ 
  isListening, 
  transcript, 
  onCaptureAudio,
  onCaptureImage,
  onReset, 
  onPushToLive,
  status,
  hasAudio,
  hasImage,
  barcodeInput,
  onBarcodeChange,
  onBarcodeSubmit,
  isScannerActive,
  onToggleScanner,
  alwaysListening,
  onToggleAlwaysListening,
  barcodeInputRef
}: ControlPanelProps) {
  return (
    <div className="w-full max-w-md bg-sidebar border border-sidebar-border p-4 rounded-lg shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
          Control Deck
        </h2>
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", isListening ? "bg-red-500 animate-pulse" : "bg-slate-600")} />
          <span className="text-xs font-mono text-muted-foreground">
            {isListening ? "MIC ACTIVE" : "MIC MUTED"}
          </span>
        </div>
      </div>

      {/* Transcript Display */}
      <div className="bg-black/40 border border-border/50 rounded-sm p-3 h-24 mb-4 font-mono text-sm overflow-y-auto relative">
        {transcript ? (
          <span className="text-foreground">{transcript}</span>
        ) : (
          <span className="text-muted-foreground/50 italic">Waiting for voice command...</span>
        )}
        {isListening && (
          <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse align-middle" />
        )}
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Audio Capture Button */}
        <Button 
          variant={isListening ? "destructive" : "default"} 
          className={cn("h-16 text-base font-bold font-['Chakra_Petch'] relative overflow-hidden group",
            isListening ? "bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-500" : "",
            hasAudio ? "border-green-500/50" : ""
          )}
          onClick={onCaptureAudio}
        >
          {isListening ? <MicOff className="mr-2 h-5 w-5" /> : <Mic className="mr-2 h-5 w-5" />}
          {isListening ? "STOP" : "AUDIO"}
          {hasAudio && <span className="absolute top-1 right-1 text-green-500">✓</span>}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-current opacity-20" />
        </Button>

        {/* Image Capture Button */}
        <Button 
          variant="default"
          className={cn("h-16 text-base font-bold font-['Chakra_Petch'] relative overflow-hidden",
            hasImage ? "border-green-500/50" : ""
          )}
          onClick={onCaptureImage}
        >
          📸 IMAGE
          {hasImage && <span className="absolute top-1 right-1 text-green-500">✓</span>}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-current opacity-20" />
        </Button>

        {/* Barcode Scanner Button */}
        <Button 
          variant="default"
          className={cn("h-16 text-sm font-bold font-['Chakra_Petch'] relative overflow-hidden",
            isScannerActive ? "border-blue-500/50 bg-blue-500/10" : ""
          )}
          onClick={onToggleScanner}
        >
          <Barcode className="mr-1 h-4 w-4" />
          BARCODE
          {isScannerActive && <span className="absolute top-1 right-1 text-blue-500 animate-pulse">●</span>}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-current opacity-20" />
        </Button>
      </div>

      {/* Barcode Input Field (appears when scanner is active or always listening) */}
      {(isScannerActive || alwaysListening) && (
        <div className="mt-3 space-y-2">
          <input
            ref={barcodeInputRef}
            type="text"
            value={barcodeInput}
            onChange={(e) => onBarcodeChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onBarcodeSubmit();
              }
            }}
            placeholder="Scan or type UPC/GTIN..."
            className="w-full px-3 py-2 bg-black/40 border border-border/50 rounded-sm font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
            autoFocus
          />
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            <input
              type="checkbox"
              checked={alwaysListening}
              onChange={(e) => onToggleAlwaysListening()}
              className="w-3 h-3 rounded border-border/50 bg-black/40 checked:bg-primary checked:border-primary"
            />
            <span className="font-mono">Always Listening</span>
          </label>
        </div>
      )}
      
      {/* Push Live Button */}
      <div className="mt-3">
        <Button 
          variant="outline" 
          className="w-full h-14 text-lg font-bold font-['Chakra_Petch'] border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
          onClick={onPushToLive}
          disabled={status !== 'ready'}
        >
          <MonitorPlay className="mr-2 h-5 w-5" />
          PUSH LIVE
        </Button>
      </div>

      <div className="mt-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-xs font-mono text-muted-foreground hover:text-foreground"
          onClick={onReset}
        >
          <RefreshCw className="mr-2 h-3 w-3" />
          RESET SYSTEM
        </Button>
      </div>
    </div>
  );
}
