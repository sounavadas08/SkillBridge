import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquareText, 
  X, 
  Send, 
  Key, 
  RotateCcw, 
  Sparkles, 
  Bot, 
  User, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { QUICK_ACTIONS } from '../../services/aiMentorPrompts';
import { 
  sendMentorMessage, 
  loadChatHistory, 
  saveChatHistory, 
  getActiveApiKey, 
  setStoredApiKey 
} from '../../services/aiMentorService';

export function AiMentorDrawer({ user, onClose, onNavigateSection }) {
  const userName = user?.name || user?.email?.split('@')[0] || 'Alex';
  
  const [messages, setMessages] = useState(() => {
    const saved = loadChatHistory(user);
    if (saved && saved.length > 0) return saved;
    return [
      {
        id: 1,
        sender: 'ai',
        text: `Hi **${userName}**! I'm your **SkillBridge AI Mentor**. I'm connected to your verified skills, target role, and skill-gap radar.\n\nHow can I help accelerate your career today? Pick a quick option below or ask me anything!`
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getActiveApiKey());
  const [keySavedStatus, setKeySavedStatus] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    saveChatHistory(user, messages);
  }, [messages, isLoading, user]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMentorMessage({
        user,
        conversationHistory: messages,
        newMessage: userMessage.text
      });

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: `*An error occurred while connecting to the AI Mentor service.* Please try again or check your API key settings.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const resetState = [
      {
        id: Date.now(),
        sender: 'ai',
        text: `Conversation reset! How can I help you next, **${userName}**?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(resetState);
    saveChatHistory(user, resetState);
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    setStoredApiKey(apiKeyInput);
    setKeySavedStatus(true);
    setTimeout(() => {
      setKeySavedStatus(false);
      setShowApiKeyModal(false);
    }, 1200);
  };

  // Helper to format basic markdown (bold, headers, bullets, inline code)
  const renderFormattedText = (content) => {
    if (!content) return null;
    
    // Split into paragraphs / lines
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      let formatted = line;

      // Header 3 / Header 4
      if (formatted.startsWith('### ')) {
        return <h3 key={idx} className="font-bold text-sm text-primary mt-2 mb-1">{formatted.replace('### ', '')}</h3>;
      }
      if (formatted.startsWith('#### ')) {
        return <h4 key={idx} className="font-semibold text-xs text-foreground mt-2 mb-1">{formatted.replace('#### ', '')}</h4>;
      }

      // Bullet points
      if (formatted.startsWith('- ') || formatted.startsWith('* ')) {
        const bulletText = formatted.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-xs my-0.5 leading-relaxed">
            {parseInlineMarkdown(bulletText)}
          </li>
        );
      }

      if (!formatted.trim()) {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p key={idx} className="text-xs my-1 leading-relaxed">
          {parseInlineMarkdown(formatted)}
        </p>
      );
    });
  };

  const parseInlineMarkdown = (text) => {
    // Basic regex parser for bold **text** and inline `code`
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-muted px-1 py-0.5 rounded font-mono text-[11px] text-primary">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const activeKey = getActiveApiKey();

  return (
    <div className="mentor-drawer border-l border-border bg-card shadow-2xl flex flex-col z-50 transition-all duration-300">
      {/* Drawer Header */}
      <div className="p-3.5 border-b border-border flex items-center justify-between bg-muted/40 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center relative shadow-xs">
            <Sparkles size={18} />
            <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-card" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm">SkillBridge AI Mentor</h3>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                Cloudflare AI
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Context-Aware Career Guide</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowApiKeyModal(true)}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
            title="Configure Gemini API Key"
          >
            <Key size={16} />
          </button>
          <button 
            onClick={handleClearHistory}
            className="p-1.5 text-muted-foreground hover:text-amber-500 hover:bg-muted rounded-md transition-colors"
            title="Reset Conversation"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* API Key Modal Overlay */}
      {showApiKeyModal && (
        <div className="p-4 bg-muted/90 border-b border-border text-xs space-y-3">
          <div className="flex items-center justify-between font-medium">
            <span className="flex items-center gap-1.5">
              <Key size={14} className="text-primary" /> Configure Gemini API Key
            </span>
            <button onClick={() => setShowApiKeyModal(false)} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Optional: Provide a free Google Gemini API key to enable live AI responses, or leave empty to use our built-in Smart Offline Engine.
          </p>
          <form onSubmit={handleSaveApiKey} className="space-y-2">
            <input 
              type="password"
              placeholder="AIzaSy..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs outline-none focus:border-primary"
            />
            <div className="flex items-center justify-between">
              {keySavedStatus ? (
                <span className="text-green-500 text-xs flex items-center gap-1">
                  <CheckCircle2 size={12} /> Saved successfully!
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Stored securely in browser local memory</span>
              )}
              <div className="flex gap-2">
                {apiKeyInput && (
                  <button 
                    type="button" 
                    onClick={() => { setApiKeyInput(''); setStoredApiKey(''); }} 
                    className="text-xs text-red-400 hover:underline"
                  >
                    Clear
                  </button>
                )}
                <button type="submit" className="px-2.5 py-1 bg-primary text-primary-foreground rounded text-xs font-medium">
                  Save Key
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={15} />
              </div>
            )}

            <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${
              msg.sender === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-none shadow-xs'
                : 'bg-muted/80 text-foreground border border-border/80 rounded-bl-none shadow-2xs'
            }`}>
              {msg.sender === 'user' ? (
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <div>
                  {renderFormattedText(msg.text)}
                  {msg.text.includes('New Target Benchmark Added!') && onNavigateSection && (
                    <div className="mt-2.5 pt-2 border-t border-border/60">
                      <button
                        onClick={() => onNavigateSection('radar')}
                        className="w-full py-1.5 px-3 bg-primary text-primary-foreground font-medium rounded-lg text-[11px] hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <span>View in Skill-Gap Radar →</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
              {msg.timestamp && (
                <div className={`text-xs mt-1 text-right ${msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {msg.timestamp}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="size-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5 border border-border">
                <User size={15} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 justify-start items-center">
            <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Bot size={15} />
            </div>
            <div className="bg-muted/80 border border-border px-3.5 py-2.5 rounded-2xl rounded-bl-none flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles size={14} className="animate-spin text-primary" />
              <span>Analyzing student profile & generating guidance...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="px-3 py-2 bg-muted/20 border-t border-border overflow-x-auto scrollbar-none flex gap-1.5 shrink-0">
        {QUICK_ACTIONS.map(action => (
          <button
            key={action.id}
            onClick={() => handleSendMessage(action.prompt)}
            disabled={isLoading}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-card border border-border hover:border-primary hover:text-primary transition-all shadow-2xs flex items-center gap-1 shrink-0 disabled:opacity-50"
          >
            <span>{action.title}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
        className="p-3 border-t border-border flex items-center gap-2 bg-card shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask AI Mentor about skills, roadmap, resume...`}
          disabled={isLoading}
          className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary transition-colors disabled:opacity-50"
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isLoading}
          className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
