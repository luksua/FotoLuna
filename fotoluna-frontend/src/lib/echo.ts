/* eslint-disable @typescript-eslint/no-explicit-any */
import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const isDemo =
    typeof window !== "undefined" &&
    (window.location.hostname.includes("netlify.app") ||
        localStorage.getItem("fotoluna_demo_mode") === "true" ||
        !import.meta.env.VITE_REVERB_APP_KEY ||
        import.meta.env.VITE_REVERB_APP_KEY === "app-key");

class MockChannel {
    listen(_event: string, _callback: (data: any) => void) {
        return this;
    }
    notification(_callback: (data: any) => void) {
        return this;
    }
    stopListening(_event: string) {
        return this;
    }
}

class MockEcho {
    private mockChan = new MockChannel();
    private(_channel: string) {
        return this.mockChan;
    }
    channel(_channel: string) {
        return this.mockChan;
    }
    leave(_channel: string) {}
    leaveChannel(_channel: string) {}
    disconnect() {}
}

export const echo: Echo = isDemo
    ? (new MockEcho() as unknown as Echo)
    : new Echo({
          broadcaster: "reverb",
          key: import.meta.env.VITE_REVERB_APP_KEY ?? "app-key",
          wsHost: import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
          wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
          wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
          forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "http") === "https",
          enabledTransports: ["ws", "wss"],
      });
