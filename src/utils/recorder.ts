import React from "react";

export class AudioDevices extends EventTarget {
  private busy = false;
  private _denied = false;
  private _devices: MediaDeviceInfo[] = [];

  get denied() {
    return this._denied;
  }

  set denied(denied: boolean) {
    if (denied !== this._denied) {
      this._denied = denied;
      this.dispatchEvent(new Event("change"));
    }
  }

  get devices() {
    return this._devices;
  }
  set devices(devices) {
    if (devices !== this._devices) {
      this._devices = devices;
      this.dispatchEvent(new Event("changeDevices"));
    }
  }

  constructor() {
    super();
    if (typeof window !== "undefined") {
      this.updateDeviceList();
      navigator.mediaDevices.addEventListener("devicechange", () => {
        this.updateDeviceList();
      });
    }
  }

  public getUserMedia = async (constraints: MediaStreamConstraints) => {
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.denied = false;
    } catch (ex) {
      this.denied = true;
    }
    this.updateDeviceList();
    return stream;
  };

  private updateDeviceList = async () => {
    const devices: MediaDeviceInfo[] =
      await navigator.mediaDevices.enumerateDevices();
    const filtered = devices.filter((device: MediaDeviceInfo) => {
      return (
        device.kind === "audioinput" &&
        device.deviceId !== "" &&
        device.label !== ""
      );
    });
    this.devices = filtered;
  };

  private promptAudioInputs = async () => {
    const permissions = await getPermissions();
    if (permissions === "denied") {
      this.denied = true;
      return;
    }

    // If permissions are prompt, we need to call getUserMedia to ask the user for permission
    if (permissions === "prompt") {
      await this.getUserMedia({
        audio: true,
        video: false,
      });
    } else {
      this.updateDeviceList();
    }
  };

  
}

const audioDevices = new AudioDevices();

async function getPermissions() {
  if (navigator?.permissions) {
    return (
      navigator.permissions
        // @ts-ignore - ignore because microphone is not in the enum of name for all browsers
        ?.query({ name: "microphone" })
        .then((result) => result.state)
        .catch((err) => {
          return "prompt";
        })
    );
  }
  return "prompt";
}


