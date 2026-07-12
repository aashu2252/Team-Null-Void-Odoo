import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, AlertCircle, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I am your TransitOps AI Operations Assistant. How can I assist with your logistics fleet today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const quickPrompts = [
    { label: 'Where is Trip TRK-204?', query: 'Where is Trip TRK-204?' },
    { label: 'Show delayed deliveries', query: 'Show delayed deliveries' },
    { label: 'Maintenance due this week', query: 'Which vehicles have maintenance due this week?' },
    { label: 'Fuel usage today', query: 'What is our fuel usage today?' },
    { label: 'Driver availability', query: 'Show current driver availability summary' },
    { label: 'Predict maintenance risks', query: 'Predict maintenance risks for active vehicles' },
    { label: 'Highlight bottlenecks', query: 'Highlight operational bottlenecks' }
  ];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = (text) => {
    if (!text.trim()) return;
    
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      let aiText = '';
      let widget = null;

      const lowerText = text.toLowerCase();

      if (lowerText.includes('trk-204')) {
        aiText = 'Trip TRK-204 is currently active and traveling on I-95 North, approximately 42 miles from the Baltimore Hub. The vehicle is maintaining a steady speed of 64 MPH. Temperature control is stable at 38°F.';
        widget = (
          <div className="mt-3 p-3 bg-brand-primary/5 border border-brand-primary/20 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-brand-primary">
              <span>TRK-204 Live Status</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-success"></span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-txt-secondary">
              <div><strong>Driver:</strong> Marcus Vance</div>
              <div><strong>ETA:</strong> 2:45 PM (On Time)</div>
              <div><strong>Route:</strong> NYC → WDC</div>
              <div><strong>Fuel Level:</strong> 72%</div>
            </div>
          </div>
        );
      } else if (lowerText.includes('delayed') || lowerText.includes('delay')) {
        aiText = 'I detected 2 trips with potential delays due to local congestion and port backup.';
        widget = (
          <div className="mt-3 space-y-2">
            <div className="p-2.5 bg-brand-danger/5 border border-brand-danger/20 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-brand-danger shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-txt-primary">TRK-109 — Delayed 45m</p>
                <p className="text-[10px] text-txt-secondary">Trapped in construction gridlock near Philadelphia port.</p>
              </div>
            </div>
            <div className="p-2.5 bg-brand-warning/5 border border-brand-warning/20 rounded-xl flex items-start gap-2">
              <Clock className="w-4 h-4 text-brand-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-txt-primary">TRK-302 — Alert (15m Delay)</p>
                <p className="text-[10px] text-txt-secondary">Minor delay in cargo loading at Richmond logistics site.</p>
              </div>
            </div>
          </div>
        );
      } else if (lowerText.includes('maintenance')) {
        aiText = 'Here is the summary of scheduled maintenance for this week. 3 vehicles require immediate service to maintain health scores.';
        widget = (
          <div className="mt-3 p-3 bg-card-elevated border border-border-custom rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center pb-1 border-b border-border-custom font-bold">
              <span>Vehicle</span>
              <span>Reason</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="font-semibold text-brand-primary">VH-401 (Volvo FH)</span>
                <span className="text-brand-orange">Brake inspection (Due Tue)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-brand-primary">VH-112 (Peterbilt)</span>
                <span className="text-brand-orange">Engine Oil & Filters (Due Thu)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-brand-primary">VH-209 (Freightliner)</span>
                <span className="text-brand-danger">Tire Tread wear (Immediate)</span>
              </div>
            </div>
          </div>
        );
      } else if (lowerText.includes('fuel')) {
        aiText = 'Fleet fuel usage today is 1,240 Gallons, with an average efficiency rating of 7.4 MPG. Fuel spend is currently tracking 3% lower than last Tuesday.';
        widget = (
          <div className="mt-3 p-3 bg-brand-teal/5 border border-brand-teal/20 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-txt-secondary">Fuel Today</span>
              <p className="text-lg font-bold text-brand-teal">1,240 Gal</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-txt-secondary">Efficiency</span>
              <p className="text-sm font-semibold text-txt-primary">7.4 MPG avg</p>
            </div>
          </div>
        );
      } else if (lowerText.includes('driver')) {
        aiText = 'We currently have 92 active drivers on duty. 84 are currently on active trips, and 8 drivers are on reserve standby available for emergency dispatch.';
        widget = (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="p-2 bg-brand-primary/5 rounded-xl text-center border border-brand-primary/10">
              <span className="text-[9px] uppercase text-txt-secondary">On Duty</span>
              <p className="text-base font-bold text-brand-primary">92</p>
            </div>
            <div className="p-2 bg-brand-success/5 rounded-xl text-center border border-brand-success/10">
              <span className="text-[9px] uppercase text-txt-secondary">Standby</span>
              <p className="text-base font-bold text-brand-success">8</p>
            </div>
          </div>
        );
      } else if (lowerText.includes('risk') || lowerText.includes('predict')) {
        aiText = 'Telemetry and predictive analysis suggest high failure probability on the following engine components:';
        widget = (
          <div className="mt-3 p-2.5 bg-brand-orange/5 border border-brand-orange/20 rounded-xl space-y-1">
            <p className="text-[11px] font-bold text-brand-orange">VH-305 — Fuel Injector Leakage Risk</p>
            <p className="text-[10px] text-txt-secondary">Recommendation: Replace injector during scheduled maintenance in 3 days to avoid fuel inefficiency.</p>
          </div>
        );
      } else if (lowerText.includes('bottleneck') || lowerText.includes('highlight')) {
        aiText = 'I detected a key operational bottleneck: Port Newark Cargo Handling is experiencing loading delays of 55 minutes on average, affecting 3 inbound trips. Re-routing recommended via secondary freight lanes.';
      } else {
        aiText = `Based on current operations, I've analyzed your query: "${text}". The logistics assets are performing optimally with minor weather delays in the northeast corridor. Let me know if you would like me to compile an audit report or predict upcoming service requirements.`;
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiText,
        widget: widget,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 850);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-gradient-to-tr from-brand-primary to-brand-teal text-white flex items-center justify-center shadow-lg shadow-brand-primary/30 cursor-pointer border-none"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 230 }}
            className="absolute bottom-16 right-0 w-96 h-[520px] bg-card-bg dark:bg-card-bg border border-border-custom dark:border-border-custom/50 rounded-[20px] shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-r from-brand-primary/10 to-brand-teal/10 border-b border-border-custom flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-primary animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-txt-primary">TransitOps AI</h3>
                  <span className="text-[9px] text-brand-teal font-bold tracking-wider uppercase">Operational Intel</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-txt-secondary hover:text-txt-primary p-1 rounded-lg hover:bg-surface/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-brand-primary text-white font-medium rounded-tr-none'
                        : 'bg-surface dark:bg-card-elevated text-txt-primary border border-border-custom dark:border-border-custom/40 rounded-tl-none'
                    }`}
                  >
                    <div>{msg.text}</div>
                    {msg.widget && <div className="mt-2">{msg.widget}</div>}
                    <div
                      className={`text-[9px] mt-1 text-right ${
                        msg.sender === 'user' ? 'text-white/60' : 'text-txt-muted'
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-surface dark:bg-card-elevated text-txt-secondary border border-border-custom dark:border-border-custom/40 rounded-2xl rounded-tl-none p-3.5 flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-txt-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-txt-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-txt-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {messages.length === 1 && (
              <div className="px-4 py-2 border-t border-border-custom bg-surface/30 dark:bg-surface/10 space-y-1">
                <span className="text-[9px] uppercase font-bold text-txt-muted">Operational Suggestions</span>
                <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pb-1">
                  {quickPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(p.query)}
                      className="text-[10px] px-2 py-1 bg-surface dark:bg-card-elevated hover:bg-brand-primary/10 dark:hover:bg-brand-primary/25 border border-border-custom dark:border-border-custom/40 text-txt-secondary hover:text-brand-primary rounded-lg transition-colors cursor-pointer text-left"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 border-t border-border-custom dark:border-border-custom/50 bg-card-bg flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
                placeholder="Ask AI Assistant..."
                className="flex-1 bg-surface dark:bg-card-elevated border border-border-custom dark:border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary placeholder-txt-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
              <button
                onClick={() => handleSend(inputValue)}
                className="h-8 w-8 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl flex items-center justify-center shadow-md shadow-brand-primary/10 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
