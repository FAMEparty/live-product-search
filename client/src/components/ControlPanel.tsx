import { Button } from "@/components/ui/button";
import { Mic, MicOff, MonitorPlay, RefreshCw } from "lucide-react";
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
  hasImage
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
      <div className="grid grid-cols-2 gap-3">
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
          {isListening ? "STOP AUDIO" : "CAPTURE AUDIO"}
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
          📸 CAPTURE IMAGE
          {hasImage && <span className="absolute top-1 right-1 text-green-500">✓</span>}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-current opacity-20" />
        </Button>
      </div>
      
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
