"use client";

import type { IAgoraRTCClient, IAgoraRTCRemoteUser, ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

interface CallInfo {
  appId: string;
  channel: string;
  uid: number;
  peerUid: number;
  token: string;
  side: "patient" | "pro";
  service: string;
  when: string;
  peer: { name: string; role: string; photo: string };
}

type Phase = "loading" | "closed" | "ready" | "joining" | "live" | "ended";

const tokenFor = (id: string) => api<CallInfo>(`/calls/${id}/token`, { method: "POST", body: {} });

/** One online consultation's video call, for the patient or the Medico. */
export function CallRoom({ id }: { id: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [info, setInfo] = useState<CallInfo | null>(null);
  const [message, setMessage] = useState("");
  const [peerIn, setPeerIn] = useState(false);
  const [peerVideo, setPeerVideo] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [cameras, setCameras] = useState(0);
  // Which of your own devices made it into the call.
  const [hasMic, setHasMic] = useState(false);
  const [hasCam, setHasCam] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const client = useRef<IAgoraRTCClient | null>(null);
  const mic = useRef<IMicrophoneAudioTrack | null>(null);
  const cam = useRef<ICameraVideoTrack | null>(null);
  const remoteBox = useRef<HTMLDivElement>(null);
  const localBox = useRef<HTMLDivElement>(null);

  const fetchInfo = useCallback(() => tokenFor(id)
    .then((r) => { setInfo(r); setMessage(""); setPhase("ready"); })
    .catch((e: Error) => { setMessage(e.message); setPhase("closed"); }), [id]);
  const load = () => { setPhase("loading"); void fetchInfo(); };

  useEffect(() => { void fetchInfo(); }, [fetchInfo]);

  // Call length, from when you joined.
  useEffect(() => {
    if (phase !== "live") return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Releases the camera and microphone and leaves the room.
  const hangUp = useCallback(async () => {
    mic.current?.close();
    cam.current?.close();
    mic.current = cam.current = null;
    await client.current?.leave().catch(() => {});
    client.current = null;
  }, []);
  const leave = async () => { await hangUp(); setPhase("ended"); };

  // Leaving the page ends the call too.
  useEffect(() => () => { void hangUp(); }, [hangUp]);

  const join = async () => {
    if (!info) return;
    setPhase("joining");
    setMessage("");
    try {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      AgoraRTC.setLogLevel(3);
      const c = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      client.current = c;

      c.on("user-joined", (u: IAgoraRTCRemoteUser) => { if (u.uid === info.peerUid) setPeerIn(true); });
      c.on("user-left", (u: IAgoraRTCRemoteUser) => { if (u.uid === info.peerUid) { setPeerIn(false); setPeerVideo(false); } });
      c.on("user-published", async (u: IAgoraRTCRemoteUser, kind: "audio" | "video") => {
        await c.subscribe(u, kind);
        setPeerIn(true);
        if (kind === "video" && remoteBox.current) { u.videoTrack?.play(remoteBox.current, { fit: "cover" }); setPeerVideo(true); }
        if (kind === "audio") u.audioTrack?.play();
      });
      c.on("user-unpublished", (_u: IAgoraRTCRemoteUser, kind: "audio" | "video") => { if (kind === "video") setPeerVideo(false); });
      // Long consultations: fetch a fresh token before this one runs out.
      c.on("token-privilege-will-expire", async () => { const r = await tokenFor(id).catch(() => null); if (r) await c.renewToken(r.token); });

      await c.join(info.appId, info.channel, info.token, info.uid);

      // Camera and microphone; a call can still go ahead with the microphone alone.
      const tracks: (IMicrophoneAudioTrack | ICameraVideoTrack)[] = [];
      try {
        const [a, v] = await AgoraRTC.createMicrophoneAndCameraTracks({ AEC: true, ANS: true }, { encoderConfig: "720p_1", facingMode: "user" });
        mic.current = a; cam.current = v; tracks.push(a, v);
      } catch {
        try {
          mic.current = await AgoraRTC.createMicrophoneAudioTrack({ AEC: true, ANS: true });
          tracks.push(mic.current);
          setCamOn(false);
          setMessage("Your camera is not available, so the other person will only hear you.");
        } catch {
          setMicOn(false); setCamOn(false);
          setMessage("Please allow the camera and microphone for this site in your browser settings, then rejoin.");
        }
      }
      if (cam.current && localBox.current) cam.current.play(localBox.current, { mirror: true, fit: "cover" });
      setHasMic(!!mic.current); setHasCam(!!cam.current);
      if (tracks.length) await c.publish(tracks);
      AgoraRTC.getCameras().then((list) => setCameras(list.length)).catch(() => {});
      setSeconds(0);
      setPhase("live");
    } catch (e) {
      await hangUp();
      setMessage(e instanceof Error ? `Could not join the call: ${e.message}` : "Could not join the call.");
      setPhase("ready");
    }
  };

  const toggleMic = async () => { if (!mic.current) return; await mic.current.setEnabled(!micOn); setMicOn(!micOn); };
  const toggleCam = async () => { if (!cam.current) return; await cam.current.setEnabled(!camOn); setCamOn(!camOn); };
  const switchCam = async () => {
    if (!cam.current) return;
    const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
    const list = await AgoraRTC.getCameras();
    const current = cam.current.getTrackLabel();
    const next = list[(list.findIndex((d) => d.label === current) + 1) % list.length];
    if (next) await cam.current.setDevice(next.deviceId);
  };

  const back = info?.side === "pro" ? "/pro/visits" : "/account";
  const peer = info?.peer;
  const peerShort = peer?.name.startsWith("Dr.") ? peer.name : peer?.name.split(" ")[0];
  const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  if (phase === "loading") return <Screen><p className="text-white/70">Getting your consultation ready…</p></Screen>;

  if (phase === "closed") {
    return (
      <Screen>
        <VideoIcon />
        <p className="max-w-sm text-center text-[17px] leading-relaxed text-white">{message || "This call is not open."}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={load} className="cursor-pointer rounded-full bg-white px-5 py-3 text-sm font-medium text-navy">Try again</button>
          <Link href="/account" className="rounded-full border border-white/30 px-5 py-3 text-sm text-white">My bookings</Link>
        </div>
        {/log in|sign in|unauthori/i.test(message) && <Link href="/?login=patient" className="text-sm text-white/70 underline">Log in</Link>}
      </Screen>
    );
  }

  if (phase === "ended") {
    return (
      <Screen>
        <VideoIcon />
        <h1 className="text-2xl font-light tracking-tight text-white">Call ended</h1>
        <p className="text-white/70">{seconds ? `You were on the call for ${clock}.` : ""}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={load} className="cursor-pointer rounded-full border border-white/30 px-5 py-3 text-sm text-white">Rejoin</button>
          <Link href={back} className="rounded-full bg-white px-5 py-3 text-sm font-medium text-navy">{info?.side === "pro" ? "Back to visits" : "My bookings"}</Link>
        </div>
      </Screen>
    );
  }

  const inCall = phase === "live";
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0B0F2E] text-white">
      {/* The other person, full screen */}
      <div ref={remoteBox} className={`absolute inset-0 ${peerVideo ? "" : "invisible"}`} />
      {(!inCall || !peerVideo) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <Avatar name={peer?.name ?? ""} photo={peer?.photo ?? ""} />
          <div>
            <div className="text-xl font-medium tracking-tight">{peer?.name}</div>
            <div className="text-sm text-white/60">{peer?.role} · {info?.service}</div>
          </div>
          {inCall ? (
            <p className="text-white/70">{peerIn ? "Camera is off" : `Waiting for ${peerShort} to join…`}</p>
          ) : (
            <>
              <p className="max-w-sm text-white/70">{info?.when}. Allow the camera and microphone when your browser asks.</p>
              <button onClick={join} disabled={phase === "joining"} className="flex cursor-pointer items-center gap-2 rounded-full bg-[#1F9D6B] px-7 py-3.5 text-[15px] font-medium text-white disabled:opacity-60">
                <VideoIcon small />{phase === "joining" ? "Joining…" : "Join video call"}
              </button>
            </>
          )}
          {message && <p className="max-w-sm text-[13px] text-[#FFD08A]">{message}</p>}
        </div>
      )}

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 bg-gradient-to-b from-black/50 to-transparent px-4 pb-8 pt-[max(16px,env(safe-area-inset-top))]">
        <div className="min-w-0">
          <div className="truncate text-[15px] font-medium">{peer?.name}</div>
          <div className="text-[12px] text-white/70">{inCall ? clock : "Online consultation"}</div>
        </div>
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px]">Private · only you two</span>
      </div>

      {/* You, small */}
      <div className={`absolute bottom-28 right-4 aspect-[3/4] w-28 overflow-hidden rounded-2xl border border-white/20 bg-black/40 shadow-lg sm:w-40 ${inCall ? "" : "hidden"}`}>
        <div ref={localBox} className={`size-full ${camOn ? "" : "invisible"}`} />
        {!camOn && <div className="absolute inset-0 flex items-center justify-center text-[12px] text-white/70">Camera off</div>}
      </div>

      {/* Controls */}
      {inCall && (
        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-4 bg-gradient-to-t from-black/50 to-transparent px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-10">
          <Control label={micOn ? "Mute" : "Unmute"} on={micOn} onClick={toggleMic} disabled={!hasMic}>
            <path d={micOn ? "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" : "M3 3l18 18M9 9v3a3 3 0 0 0 5 2.2M15 9.3V6a3 3 0 0 0-5.7-1.3M5 11a7 7 0 0 0 11.3 5.5M19 11a7 7 0 0 1-.6 2.8M12 18v3"} />
          </Control>
          <Control label={camOn ? "Turn camera off" : "Turn camera on"} on={camOn} onClick={toggleCam} disabled={!hasCam}>
            <path d={camOn ? "M15 10l5-3v10l-5-3M4 6h11v12H4z" : "M3 3l18 18M15 10l5-3v10l-2-1.2M15 15v3H4V6h2"} />
          </Control>
          {cameras > 1 && (
            <Control label="Switch camera" on onClick={switchCam}>
              <path d="M4 7h3l2-2h6l2 2h3v12H4zM9 13a3 3 0 0 0 5.2 2M15 13a3 3 0 0 0-5.2-2M14 15h1v1M10 11H9v-1" />
            </Control>
          )}
          <button onClick={leave} aria-label="End call" className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-[#D93636] text-white shadow-lg hover:bg-[#C22F2F]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15.5c5-4.7 13-4.7 18 0l-2.2 2.2-3.3-1.3v-2.6a10 10 0 0 0-7 0v2.6l-3.3 1.3z" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 bg-[#0B0F2E] px-6 text-center">{children}</div>;
}

function Control({ label, on, onClick, disabled, children }: { label: string; on: boolean; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label} title={label}
      className={`flex size-14 cursor-pointer items-center justify-center rounded-full backdrop-blur transition-colors disabled:opacity-40 ${on ? "bg-white/15 text-white hover:bg-white/25" : "bg-white text-navy"}`}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
    </button>
  );
}

function Avatar({ name, photo }: { name: string; photo: string }) {
  const initials = name.replace("Dr. ", "").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="relative flex size-28 items-center justify-center overflow-hidden rounded-full bg-white/10 text-3xl font-light">
      {photo ? <Image src={photo} alt={name} fill sizes="112px" className="object-cover" unoptimized /> : initials}
    </div>
  );
}

function VideoIcon({ small }: { small?: boolean }) {
  const s = small ? 18 : 40;
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={small ? "currentColor" : "#fff"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10l5-3v10l-5-3M4 6h11v12H4z" /></svg>;
}
