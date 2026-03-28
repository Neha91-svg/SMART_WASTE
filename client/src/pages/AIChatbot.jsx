import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';
import { MdSend, MdImage, MdSmartToy, MdPerson, MdClose } from 'react-icons/md';

const QUICK_PROMPTS = [
  'How to recycle plastic bottles?',
  'Where to dispose old batteries?',
  'How to recycle e-waste safely?',
  'Can I recycle shampoo bottles?',
  'Are plastic bags recyclable?',
  'How to dispose of old light bulbs?',
];

/**
 * AI Chatbot Page — Gemini-powered recycling assistant
 */
export default function AIChatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hi! I'm **EcoBot** — your AI recycling assistant.\n\nI can help you with:\n- **Recycling guidance** for any item\n- **Photo identification** — upload a picture and I'll tell you how to recycle it\n- **Waste disposal tips** and safety info\n- **Local recycling centers** near you in Mumbai\n\nAsk me anything or upload a photo to get started!",
    }
  ]);
  const [input, setInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image too large. Please use under 5MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setImageBase64(reader.result); setImagePreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null); setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (text = input) => {
    if (!text.trim() && !imageBase64) return;
    const userMessage = { role: 'user', text: text.trim(), image: imagePreview };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const sentImage = imageBase64;
    removeImage();
    setLoading(true);
    try {
      const res = await sendChatMessage(text.trim(), sentImage);
      setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: '⚠️ Sorry, I encountered an error. Please try again.' }]);
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      let rendered = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      if (rendered.trim().startsWith('- ')) {
        rendered = rendered.trim().slice(2);
        return <div key={i} className="flex items-start gap-2 my-0.5"><span className="text-emerald-500 mt-0.5 text-xs">●</span><span dangerouslySetInnerHTML={{ __html: rendered }} /></div>;
      }
      const numMatch = rendered.trim().match(/^(\d+)\.\s(.+)/);
      if (numMatch) {
        return <div key={i} className="flex items-start gap-2 my-0.5"><span className="text-xs font-bold mt-0.5 bg-emerald-500 text-white w-5 h-5 rounded-full flex items-center justify-center shrink-0">{numMatch[1]}</span><span dangerouslySetInnerHTML={{ __html: numMatch[2] }} /></div>;
      }
      if (!rendered.trim()) return <br key={i} />;
      return <p key={i} className="my-0.5" dangerouslySetInnerHTML={{ __html: rendered }} />;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] lg:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="card !rounded-b-none border-b-0 shrink-0" style={{ borderLeft: '4px solid #059669' }}>
        <div className="px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-sm">
            <MdSmartToy size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">EcoBot AI</h1>
            <p className="text-xs text-slate-400 font-medium">Powered by Gemma 3 · Recycling Expert</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 min-h-0 bg-slate-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
              msg.role === 'ai' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'
            }`}>
              {msg.role === 'ai' ? <MdSmartToy size={16} /> : <MdPerson size={16} />}
            </div>
            <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm font-medium leading-relaxed shadow-sm ${
              msg.role === 'ai' ? 'bg-white border border-slate-200 text-slate-700' : 'bg-emerald-500 text-white'
            }`}>
              {msg.image && <img src={msg.image} alt="Uploaded" className="rounded-lg mb-2 max-h-40 object-cover w-full" />}
              <div>{renderText(msg.text)}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500 text-white shadow-sm">
              <MdSmartToy size={16} />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="px-3 pb-2 pt-1 shrink-0 bg-white border-t border-slate-100">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button key={i} onClick={() => handleSend(prompt)}
                className="text-xs font-medium px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all cursor-pointer">
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="px-3 pb-2 shrink-0 bg-white">
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-16 rounded-lg border border-slate-200 shadow-sm" />
            <button onClick={removeImage} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
              <MdClose size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="shrink-0 px-3 pb-3 pt-2 bg-white border-t border-slate-100">
        <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2">
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center shrink-0 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors" title="Upload image">
            <MdImage size={20} />
          </button>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Ask about recycling..."
            className="flex-1 resize-none border-0 outline-none text-sm font-medium bg-transparent py-2 px-1 max-h-24 min-h-[36px] font-[inherit] text-slate-700 placeholder:text-slate-400"
            rows={1} />
          <button onClick={() => handleSend()} disabled={loading || (!input.trim() && !imageBase64)}
            className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <MdSend size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
