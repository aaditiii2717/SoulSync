import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { ChatInterface } from "@/components/ChatInterface";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

function ChatPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Subtle gradient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, oklch(0.93 0.08 55 / 0.5), transparent 70%)" }}
        />
        <div
          className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full opacity-12"
          style={{ background: "radial-gradient(circle, oklch(0.90 0.07 190 / 0.5), transparent 70%)" }}
        />
      </div>
      <Navbar />
      <div className="flex-1 overflow-hidden pt-[4.5rem]">
        <ChatInterface />
      </div>
    </div>
  );
}
