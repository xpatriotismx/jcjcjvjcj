import type { ChatMessageView, ClientSocketMessage } from "@sehemistan/contracts";
import { Crown, Radio, Send } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

export function ChatPage({
  messages,
  presence,
  send
}: {
  messages: ChatMessageView[];
  presence: number;
  send(message: ClientSocketMessage): void;
}) {
  const [body, setBody] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!body.trim()) return;
    send({ type: "chat.send", roomId: "global", body: body.trim() });
    setBody("");
  };

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div><p className="eyebrow">ŞİFRELİ KANAL</p><h1>Ulak ağı</h1></div>
        <span><Radio size={16} /> {presence} çevrim içi</span>
      </header>
      <div className="chat-stream">
        {messages.map((message) => (
          <article className="chat-message" key={message.id}>
            <span className="chat-avatar">{message.user.username.slice(0, 2).toUpperCase()}</span>
            <div>
              <header>
                <strong>{message.user.username}</strong>
                {message.user.isVip && <Crown size={13} />}
                <time>{new Date(message.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</time>
              </header>
              <p>{message.body}</p>
            </div>
          </article>
        ))}
        <div ref={endRef} />
      </div>
      <form className="chat-composer" onSubmit={submit}>
        <input value={body} onChange={(event) => setBody(event.target.value)} maxLength={500} placeholder="Ulak ağına mesaj gönder..." />
        <button className="icon-button send-button" aria-label="Mesaj gönder"><Send size={19} /></button>
      </form>
    </div>
  );
}
