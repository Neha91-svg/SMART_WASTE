import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';
import { MdSend, MdImage, MdSmartToy, MdPerson, MdClose, MdAutoAwesome } from 'react-icons/md';

const QUICK_PROMPTS = [
  'How to recycle plastic bottles?',
  'Where to dispose old batteries?',
  'How to recycle e-waste safely?',
  'Can I recycle shampoo bottles?',
];

/**
 * AI Chatbot Page — Premium Light UI Assistant
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
        return <div key={i} className="flex items-start gap-2.5 my-1.5"><span className="text-emerald-500 mt-1"><MdAutoAwesome size={14}/></span><span dangerouslySetInnerHTML={{ __html: rendered }} /></div>;
      }
      const numMatch = rendered.trim().match(/^(\d+)\.\s(.+)/);
      if (numMatch) {
        return <div key={i} className="flex items-start gap-2.5 my-1.5"><span className="text-xs font-bold mt-0.5 bg-emerald-500/10 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center shrink-0">{numMatch[1]}</span><span dangerouslySetInnerHTML={{ __html: numMatch[2] }} /></div>;
      }
      if (!rendered.trim()) return <br key={i} />;
      return <p key={i} className="my-1.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: rendered }} />;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] lg:h-[calc(100vh-3rem)] premium-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 flex items-center gap-4 bg-white border-b border-slate-100 z-10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[14px] flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <MdSmartToy size={26} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">EcoBot AI</h1>
          <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase mt-0.5">Powered by Gemma 3</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 bg-slate-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 shadow-sm ${
              msg.role === 'ai' ? 'bg-white text-emerald-500 border border-slate-100' : 'bg-gradient-to-tr from-blue-500 to-indigo-500 text-white'
            }`}>
              {msg.role === 'ai' ? <MdSmartToy size={20} /> : <MdPerson size={20} />}
            </div>
            
            {/* Message Bubble */}
            <div className={`px-5 py-4 text-[15px] font-medium leading-relaxed shadow-sm ${
              msg.role === 'ai' 
                ? 'bg-white border border-slate-100/50 text-slate-700 rounded-2xl rounded-tl-sm' 
                : 'bg-emerald-500 text-white rounded-2xl rounded-tr-sm'
            }`}>
              {msg.image && <img src={msg.image} alt="Uploaded" className="rounded-xl mb-3 max-h-48 object-cover w-full shadow-sm" />}
              <div>{renderText(msg.text)}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-3xl">
            <div className="w-10 h-10 rounded-[14px] bg-white border border-slate-100 text-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
              <MdSmartToy size={20} />
            </div>
            <div className="bg-white border border-slate-100/50 rounded-2xl rounded-tl-sm px-5 py-5 shadow-sm flex gap-1.5 items-center">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-100 pt-4 pb-4 px-4 md:px-6 relative z-10">
        
        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button key={i} onClick={() => handleSend(prompt)}
                className="text-xs font-bold px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-slate-500 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 hover:-translate-y-0.5 transition-all shadow-sm">
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-20 rounded-xl border-2 border-slate-200 shadow-md object-cover" />
            <button onClick={removeImage} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
              <MdClose size={14} />
            </button>
          </div>
        )}

        {/* Text Input Bar */}
        <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-400 transition-all">
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-[12px] bg-white border border-slate-200 text-slate-500 flex items-center justify-center shrink-0 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm" title="Upload image">
            <MdImage size={20} />
          </button>
          
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Ask EcoBot anything..."
            className="flex-1 resize-none border-0 outline-none text-[15px] font-medium bg-transparent py-2.5 px-2 max-h-32 min-h-[44px] text-slate-800 placeholder:text-slate-400 placeholder:font-medium"
            rows={1} />
            
          <button onClick={() => handleSend()} disabled={loading || (!input.trim() && !imageBase64)}
            className="w-10 h-10 rounded-[12px] bg-emerald-500 text-white flex items-center justify-center shrink-0 hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
            <MdSend size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
