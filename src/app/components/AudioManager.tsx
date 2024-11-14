import React, { useState, useEffect } from "react";
import { AudioDevices } from "@/utils/recorder";

interface AudioManagerProps {
  stream: MediaStream;
}

export const AudioManager: React.FC<AudioManagerProps> = ({ stream }) => {
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    const devices = new AudioDevices();
    devices.addEventListener("changeDevices", () => {
      setAudioDevices(devices.devices);
    });
    return () => {
      devices.removeEventListener("changeDevices", () => {
        setAudioDevices(devices.devices);
      });
    };
  }, []);

  return (
    <div>
      <h2>Audio Devices</h2>
      <ul>
        {audioDevices.map((device) => (
          <li key={device.deviceId}>{device.label}</li>
        ))}
      </ul>
    </div>
  );
};
