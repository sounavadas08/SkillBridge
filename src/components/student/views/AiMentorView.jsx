import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  RotateCcw, 
  Key, 
  Bot, 
  User, 
  CheckCircle2, 
  Target, 
  Compass, 
  FileCheck, 
  MessageSquareCode, 
  Lightbulb, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { QUICK_ACTIONS } from '../../../services/aiMentorPrompts';
import { 
  sendMentorMessage, 
  loadChatHistory, 
  saveChatHistory, 
  getActiveApiKey, 
  setStoredApiKey 
} from '../../../services/aiMentorService';

export function AiMentorView({ user, onNavigateSection }) {
  const userName = user?.name || user?.email?.split('@')[0] || 'Alex Chen';
  
  const [messages, setMessages] = useState(() => {
    const saved = loadChatHistory(user);
    if (saved && saved.length > 0) return saved;
    return [
      {
        id: 1,
        sender: 'ai',
        text: `Welcome to your **AI Mentor Studio**, ${userName}! 🚀\n\nI have analyzed your **SkillVault** and **Skill-Gap Radar**. You currently have strong foundations in React and Node.js, with high-priority growth areas in **TypeScript**, **Docker**, and **Security & Auth**.\n\nChoose an action card below or type any question to start building your personalized career path!`
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getActiveApiKey());
  const [keySavedStatus, setKeySavedStatus] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
          text: ` *Connection issue encountered.* Please check your network or Gemini API key settings.`,
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
        text: `Workspace history reset! What would you like to focus on today, **${userName}**?`,
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

  const renderFormattedText = (content) => {
    if (!content) return null;
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="font-bold text-base text-primary mt-3 mb-1.5">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={idx} className="font-semibold text-sm text-foreground mt-2 mb-1">{line.replace('#### ', '')}</h4>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-5 list-disc text-sm my-1 leading-relaxed">
            {parseInlineMarkdown(line.substring(2))}
          </li>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-sm my-1 leading-relaxed">
          {parseInlineMarkdown(line)}
        </p>
      );
    });
  };

  const parseInlineMarkdown = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs text-primary">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const activeKey = getActiveApiKey();

  const getActionIcon = (id) => {
    switch(id) {
      case 'skill-gap-plan': return Target;
      case 'career-roadmap': return Compass;
      case 'resume-review': return FileCheck;
      case 'mock-interview': return MessageSquareCode;
      default: return Lightbulb;
    }
  };

  return (
    <div className="space-y-6 pb-12 transition-all duration-300">
      {/* Header Banner */}
      <div className="border border-border bg-card p-6 rounded-2xl shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1.5">
                <Sparkles size={13} /> AI Career Coach
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium border border-emerald-500/20">
                Live Cloudflare AI (Llama 3.1)
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">AI Mentor Studio</h1>
            <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
              Your personalized 24/7 technical career guide. Integrated directly with your verified skills, gap metrics, and target developer roles.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowApiKeyModal(!showApiKeyModal)}
              className="flex items-center gap-2 px-3.5 py-2 border border-border rounded-xl text-xs font-medium bg-card hover:bg-muted transition-colors shadow-2xs"
            >
              <Key size={15} className="text-primary" />
              <span>{activeKey ? 'Update API Key' : 'Add Gemini Key'}</span>
            </button>
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-3.5 py-2 border border-border rounded-xl text-xs font-medium text-muted-foreground hover:text-amber-500 hover:bg-muted transition-colors"
              title="Reset Chat History"
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* API Key Modal Banner */}
        {showApiKeyModal && (
          <div className="mt-5 pt-4 border-t border-border bg-muted/30 -mx-6 -mb-6 p-6 rounded-b-2xl">
            <h4 className="font-semibold text-sm flex items-center gap-2 mb-1">
              <Key size={16} className="text-primary" /> Gemini API Key Configuration
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              SkillBridge works out of the box with our built-in Smart Offline Engine. To use live Google Gemini LLM responses, paste your API key below.
            </p>
            <form onSubmit={handleSaveApiKey} className="flex flex-col sm:flex-row gap-2 max-w-xl">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="flex-1 bg-background border border-border rounded-xl px-3.5 py-2 text-xs outline-none focus:border-primary"
              />
              <div className="flex items-center gap-2">
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-medium hover:bg-primary/90">
                  Save Key
                </button>
                {apiKeyInput && (
                  <button 
                    type="button" 
                    onClick={() => { setApiKeyInput(''); setStoredApiKey(''); }}
                    className="px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 rounded-xl"
                  >
                    Clear Key
                  </button>
                )}
              </div>
            </form>
            {keySavedStatus && (
              <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1 font-medium">
                <CheckCircle2 size={14} /> Key saved successfully!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Preset Quick Actions Cards */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Recommended Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {QUICK_ACTIONS.map((action) => {
            const IconComponent = getActionIcon(action.id);
            return (
              <div
                key={action.id}
                onClick={() => handleSendMessage(action.prompt)}
                className="border border-border bg-card p-4 rounded-xl hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComponent size={18} />
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {action.badge}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    "{action.prompt}"
                  </p>
                </div>
                <div className="mt-3 flex items-center text-xs font-medium text-primary group-hover:translate-x-1 transition-transform">
                  <span>Run action</span>
                  <ChevronRight size={14} className="ml-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Chat Window */}
      <div className="border border-border bg-card rounded-2xl shadow-xs flex flex-col h-[620px] overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Interactive Session</h3>
              <p className="text-xs text-muted-foreground">Context: {userName} • Target Role: Frontend & Full-Stack Developer</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border">
            {messages.length} messages
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                  <Bot size={18} />
                </div>
              )}

              <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-xs shadow-xs'
                  : 'bg-muted/60 text-foreground border border-border rounded-bl-xs shadow-2xs'
              }`}>
                {msg.sender === 'user' ? (
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div>
                    {renderFormattedText(msg.text)}
                    {msg.text.includes('New Target Benchmark Added!') && onNavigateSection && (
                      <div className="mt-3 pt-2.5 border-t border-border/60">
                        <button
                          onClick={() => onNavigateSection('radar')}
                          className="py-2 px-4 bg-primary text-primary-foreground font-medium rounded-xl text-xs hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-2xs"
                        >
                          <Target size={14} />
                          <span>View in Skill-Gap Radar →</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {msg.timestamp && (
                  <div className={`text-[10px] mt-2 text-right ${msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {msg.timestamp}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="size-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-1 border border-border">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Bot size={18} />
              </div>
              <div className="bg-muted/60 border border-border px-4 py-3 rounded-2xl rounded-bl-xs flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles size={16} className="animate-spin text-primary" />
                <span>SkillBridge AI is crafting your tailored response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="p-4 border-t border-border flex items-center gap-3 bg-card"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI Mentor about skill gaps, project architectures, or career strategies..."
            disabled={isLoading}
            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-5 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-sm shadow-xs"
          >
            <span>Send</span>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
