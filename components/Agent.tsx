"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

interface SavedMessage {
    role: "user" | "system" | "assistant";
    content: string;
}

const Agent = ({
    userName,
    userId,
    type,
}: AgentProps) => {
    const router = useRouter();
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);

    /* -------------------- VAPI EVENTS -------------------- */
    useEffect(() => {
        const onCallStart = () => {
            setCallStatus(CallStatus.ACTIVE);
        };

        const onCallEnd = () => {
            setCallStatus(CallStatus.FINISHED);
        };

        const onMessage = (message: Message) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                setMessages((prev) => [
                    ...prev,
                    { role: message.role, content: message.transcript },
                ]);
            }
        };

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);

        const onError = (error: Error) => {
            console.error("Vapi error:", error);
            setCallStatus(CallStatus.INACTIVE);
        };

        vapi.on("call-start", onCallStart);
        vapi.on("call-end", onCallEnd);
        vapi.on("message", onMessage);
        vapi.on("speech-start", onSpeechStart);
        vapi.on("speech-end", onSpeechEnd);
        vapi.on("error", onError);

        return () => {
            vapi.off("call-start", onCallStart);
            vapi.off("call-end", onCallEnd);
            vapi.off("message", onMessage);
            vapi.off("speech-start", onSpeechStart);
            vapi.off("speech-end", onSpeechEnd);
            vapi.off("error", onError);
        };
    }, []);

    /* -------------------- REDIRECT ON FINISH -------------------- */
    useEffect(() => {
        if (callStatus === CallStatus.FINISHED) {
            router.push("/");
        }
    }, [callStatus, router]);

    /* -------------------- START CALL (LATEST VAPI) -------------------- */
    const handleCall = async () => {
        try {
            setCallStatus(CallStatus.CONNECTING);

            await navigator.mediaDevices.getUserMedia({ audio: true });

            await vapi.start({
                name: "PrepX Interviewer",

                model: {
                    provider: "openai",
                    model: "gpt-4o",
                },

                voice: {
                    provider: "vapi",
                    voiceId: "Spencer",
                },

                transcriber: {
                    provider: "deepgram",
                    model: "nova-2",
                },
            });
        } catch (err) {
            console.error("Vapi start failed:", err);
            setCallStatus(CallStatus.INACTIVE);
        }
    };


    /* -------------------- END CALL -------------------- */
    const handleDisconnect = () => {
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    };

    const latestMessage = messages[messages.length - 1]?.content;
    const isCallActiveOrFinished =
        callStatus === CallStatus.ACTIVE || callStatus === CallStatus.FINISHED;

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-between bg-gradient-to-br from-[#0b0f1a] via-[#0f1224] to-black px-6 py-8 text-white">

            {/* Header */}
            <div className="w-full max-w-5xl flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Image src="/logo.png" alt="PrepX" width={32} height={32} />
                    <span className="text-lg font-semibold">PrepX</span>
                </div>
                <span className="px-3 py-1 text-xs rounded-full bg-white/10 border border-white/10">
                    Technical Interview
                </span>
            </div>

            {/* Interview Cards */}
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 items-center">

                {/* AI Interviewer */}
                <div className="relative rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 flex flex-col items-center justify-center h-[320px]">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Image
                                src="/logo.png"
                                alt="AI Interviewer"
                                width={56}
                                height={56}
                            />
                        </div>

                        {isSpeaking && (
                            <span className="absolute inset-0 rounded-full animate-ping bg-indigo-400/40" />
                        )}
                    </div>

                    <h3 className="mt-6 text-lg font-semibold">AI Interviewer</h3>
                    <p className="text-sm text-white/60 mt-1">PrepX</p>
                </div>

                {/* User */}
                <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 flex flex-col items-center justify-center h-[320px]">
                    <Image
                        src="/user-avatar.png"
                        alt="User"
                        width={120}
                        height={120}
                        className="rounded-full object-cover"
                    />
                    <h3 className="mt-6 text-lg font-semibold">{userName}</h3>
                    <p className="text-sm text-white/60 mt-1">You</p>
                </div>
            </div>

            {/* Transcript */}
            {latestMessage && (
                <div className="w-full max-w-4xl mt-6">
                    <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md px-6 py-4">
                        <p
                            key={latestMessage}
                            className={cn(
                                "text-sm text-white/90 transition-opacity duration-500 opacity-0",
                                "animate-fadeIn opacity-100"
                            )}
                        >
                            {latestMessage}
                        </p>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="mt-8 mb-4 flex justify-center">
                {callStatus !== CallStatus.ACTIVE ? (
                    <button
                        onClick={handleCall}
                        disabled={callStatus === CallStatus.CONNECTING}
                        className={cn(
                            "relative px-10 py-3 rounded-full font-semibold transition",
                            callStatus === CallStatus.CONNECTING
                                ? "bg-indigo-500 cursor-not-allowed opacity-70"
                                : "bg-indigo-600 hover:bg-indigo-700"
                        )}
                    >
                        {callStatus === CallStatus.CONNECTING && (
                            <span className="absolute inset-0 rounded-full animate-ping bg-indigo-400/50" />
                        )}
                        <span className="relative">
                            {callStatus === CallStatus.CONNECTING
                                ? "Connecting..."
                                : "Start Interview"}
                        </span>
                    </button>
                ) : (
                    <button
                        onClick={handleDisconnect}
                        className="px-10 py-3 rounded-full bg-red-600 hover:bg-red-700 transition font-semibold"
                    >
                        End Interview
                    </button>
                )}
            </div>

        </div>
    );
};

export default Agent;



