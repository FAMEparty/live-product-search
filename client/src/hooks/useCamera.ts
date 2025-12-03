import { useState, useEffect, useRef } from "react";

interface CameraDevice {
  deviceId: string;
  label: string;
}

export function useCamera() {
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [isEnabled, setIsEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Manual camera enable function
  const enableCamera = async () => {
    try {
      // Request permissions
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      tempStream.getTracks().forEach(track => track.stop()); // Stop temp stream
      
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList
        .filter((device) => device.kind === "videoinput")
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.substring(0, 8)}`,
        }));

      setDevices(videoDevices);
      setIsEnabled(true);
      
      // Auto-select first device
      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err: any) {
      setError("Failed to access cameras: " + err.message);
    }
  };

  // Start camera stream when device is selected
  useEffect(() => {
    if (!selectedDeviceId) return;

    async function startStream() {
      try {
        // Stop existing stream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedDeviceId } },
        });

        setStream(newStream);

        // Attach to video element if available
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (err: any) {
        setError("Failed to start camera: " + err.message);
      }
    }

    startStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [selectedDeviceId]);

  // Capture a frame from the video stream
  const captureFrame = (): string | null => {
    if (!videoRef.current) return null;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(videoRef.current, 0, 0);

    // Return base64 image
    return canvas.toDataURL("image/jpeg", 0.8);
  };

  return {
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    videoRef,
    captureFrame,
    error,
    hasCamera: devices.length > 0,
    isEnabled,
    enableCamera,
  };
}
