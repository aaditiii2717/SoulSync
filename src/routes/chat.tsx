import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { ChatInterface } from "@/components/ChatInterface";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

function ChatPage() {
  return (
    <div className="flex flex-col h-screen pt-16">
      <Navbar />
      <ChatInterface />
    </div>
  );
}
