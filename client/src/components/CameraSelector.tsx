import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera } from "lucide-react";

interface CameraSelectorProps {
  devices: { deviceId: string; label: string }[];
  selectedDeviceId: string;
  onSelectDevice: (deviceId: string) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  error?: string;
}

export function CameraSelector({ 
  devices, 
  selectedDeviceId, 
  onSelectDevice, 
  videoRef,
  error 
}: CameraSelectorProps) {
  return (
    <div className="bg-card/50 border border-border p-4 rounded-sm">
      <div className="flex items-center gap-2 mb-3">
        <Camera className="w-4 h-4 text-primary" />
        <h3 className="font-['Chakra_Petch'] font-bold text-sm text-foreground">CAMERA SETUP</h3>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 p-2 rounded-sm mb-3">
          <p className="text-xs text-destructive font-mono">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">
            Select Camera
          </label>
          <Select value={selectedDeviceId} onValueChange={onSelectDevice}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose camera..." />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Camera Preview */}
        <div className="relative aspect-video bg-black rounded-sm overflow-hidden border border-border/50">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-mono px-2 py-1 rounded-sm animate-pulse">
            LIVE
          </div>
        </div>

        <p className="text-[10px] font-mono text-muted-foreground">
          * This camera will be used to capture product images when you press "CAPTURE + LISTEN"
        </p>
      </div>
    </div>
  );
}
