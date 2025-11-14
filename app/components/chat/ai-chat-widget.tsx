
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Send, Bot, User, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Add welcome message when chat opens for the first time
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `👋 Hey there! I'm your DeFiDash Agent - your friendly crypto companion! 🤖✨

I'm here to make crypto easy and fun! Here's what I can help you with:

🎯 **My Superpowers:**
• 📊 **Market Analysis** - Real-time trends & insights
• 🐋 **Whale Watching** - Track big money moves
• 💎 **Token Research** - Find the next gems
• 📈 **DeFi Opportunities** - Best yields & protocols
• 🎮 **Block Wars Guide** - Game strategies & tips
• 🗺️ **Platform Help** - Navigate DeFiDash like a pro

💬 **Just ask me anything!** I speak human, not crypto jargon. Whether you're new or a pro, I'm here to help! 

Ready to dive in? 🚀`,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    let assistantMessage: Message | null = null;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversation: messages.map(({ role, content }) => ({ role, content }))
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      const decoder = new TextDecoder();
      let assistantContent = '';
      let buffer = '';

      assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage as Message]);
      setIsTyping(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last potentially incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            if (data === '') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content !== undefined && content !== null && assistantMessage) {
                assistantContent += content;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessage!.id 
                      ? { ...msg, content: assistantContent }
                      : msg
                  )
                );
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming chunk:', data, parseError);
              // Continue processing other chunks
            }
          }
        }
      }

      // Ensure we have some response content
      if (assistantContent.trim() === '' && assistantMessage) {
        throw new Error('No content received from AI');
      }

    } catch (error: any) {
      console.error('Chat error details:', error);
      
      let errorMessage = 'Sorry, I encountered an error. Please try again in a moment.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again with a shorter message.';
      } else if (error.message?.includes('fetch')) {
        errorMessage = 'Connection error. Please check your internet connection and try again.';
      } else if (error.message?.includes('API Error')) {
        errorMessage = 'AI service temporarily unavailable. Please try again in a few minutes.';
      }

      // Remove the assistant message if it was created but failed
      if (assistantMessage) {
        setMessages(prev => prev.filter(msg => msg.id !== assistantMessage!.id));
      }

      // Add error message
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      }]);
      
      setIsTyping(false);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { text: "What's hot in crypto?", emoji: "🔥", gradient: "from-orange-500 to-red-500" },
    { text: "Show me whale moves", emoji: "🐋", gradient: "from-blue-500 to-cyan-500" },
    { text: "Find trending tokens", emoji: "💎", gradient: "from-purple-500 to-pink-500" },
    { text: "Best DeFi yields?", emoji: "💰", gradient: "from-green-500 to-emerald-500" },
    { text: "Market analysis", emoji: "📊", gradient: "from-indigo-500 to-blue-500" },
    { text: "Block Wars tips", emoji: "🎮", gradient: "from-violet-500 to-purple-500" },
    { text: "Risk check", emoji: "⚠️", gradient: "from-yellow-500 to-orange-500" },
    { text: "Help me navigate", emoji: "🗺️", gradient: "from-teal-500 to-cyan-500" }
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Button
                onClick={() => setIsOpen(true)}
                size="lg"
                className="relative rounded-full shadow-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-800 text-white border-4 border-white/30 w-20 h-20 p-0 group overflow-hidden"
              >
                {/* Animated glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
                
                {/* Robot Avatar */}
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src="/images/defidash-agent-avatar.jpg"
                    alt="DeFiDash Agent"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    priority
                  />
                </div>
                
                {/* Pulse ring animation */}
                <div className="absolute inset-0 rounded-full border-4 border-cyan-400 animate-ping opacity-20"></div>
                
                {/* Online status indicator */}
                <motion.div 
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-background shadow-lg"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="w-3 h-3 text-white ml-0.5 mt-0.5" />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]"
          >
            <Card className="h-full flex flex-col shadow-2xl bg-background/95 backdrop-blur border">
              {/* Header */}
              <div className="p-4 border-b bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-600/20 rounded-t-lg backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div 
                      className="relative"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 via-cyan-400 to-indigo-500 p-1 shadow-lg">
                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/50">
                          <Image
                            src="/images/defidash-agent-avatar.jpg"
                            alt="DeFiDash Agent"
                            width={48}
                            height={48}
                            className="object-cover"
                            priority
                          />
                        </div>
                      </div>
                      <motion.div 
                        className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-background shadow-md"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      </motion.div>
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-foreground flex items-center gap-2">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-600">
                          DeFiDash Agent
                        </span>
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-4 h-4 text-yellow-500" />
                        </motion.div>
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-0.5">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1 h-3 bg-gradient-to-t from-green-500 to-emerald-400 rounded-full"
                              animate={{ height: ['8px', '12px', '8px'] }}
                              transition={{ 
                                duration: 0.8, 
                                repeat: Infinity, 
                                delay: i * 0.2,
                                ease: "easeInOut"
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-green-500 font-medium">Live & Active</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full h-9 w-9 p-0 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 space-y-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === 'assistant' && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 p-0.5 shadow-md">
                            <div className="w-full h-full rounded-full overflow-hidden border border-white/50">
                              <Image
                                src="/images/defidash-agent-avatar.jpg"
                                alt="DeFiDash Agent"
                                width={32}
                                height={32}
                                className="object-cover"
                              />
                            </div>
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                              : 'bg-gradient-to-r from-muted to-muted/80 text-foreground shadow-sm'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                          </div>
                        </div>
                        {message.role === 'user' && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <motion.div 
                      className="flex justify-start"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 p-0.5 shadow-md">
                          <div className="w-full h-full rounded-full overflow-hidden border border-white/50">
                            <Image
                              src="/images/defidash-agent-avatar.jpg"
                              alt="DeFiDash Agent"
                              width={32}
                              height={32}
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-muted to-muted/80 rounded-2xl px-4 py-3 shadow-sm">
                          <div className="flex items-center space-x-1.5">
                            <motion.div 
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <motion.div 
                              className="w-2 h-2 bg-cyan-500 rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                            />
                            <motion.div 
                              className="w-2 h-2 bg-indigo-500 rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                {/* Enhanced Quick Actions */}
                {messages.length <= 1 && (
                  <motion.div 
                    className="space-y-3 pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-center">
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-3 py-1">
                        ✨ Quick Start Ideas
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {quickActions.map((action, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setInputValue(action.text);
                              textareaRef.current?.focus();
                            }}
                            className={`
                              text-xs h-auto py-2.5 px-3 justify-start w-full
                              border-2 border-transparent
                              hover:border-transparent
                              bg-gradient-to-r ${action.gradient}
                              hover:shadow-lg hover:scale-105
                              transition-all duration-200
                              text-white font-medium
                            `}
                          >
                            <span className="mr-2 text-base">{action.emoji}</span>
                            <span className="truncate text-left text-xs">{action.text}</span>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-xs text-muted-foreground">💬 Or type your own question!</p>
                      <p className="text-xs text-green-500 font-medium">🟢 Always here to help</p>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-purple-500/5">
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="💬 Ask me anything about crypto..."
                      className="resize-none min-h-[60px] text-sm border-2 border-muted focus:border-blue-400 rounded-xl transition-colors pr-12"
                      disabled={isLoading}
                    />
                    {!inputValue.trim() && !isLoading && (
                      <motion.div
                        className="absolute right-3 top-3 text-muted-foreground"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                    )}
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={sendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      size="lg"
                      className="
                        bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-600 
                        hover:from-blue-600 hover:via-cyan-600 hover:to-purple-700 
                        text-white border-0 px-5 h-[60px] rounded-xl
                        shadow-lg hover:shadow-xl
                        transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                      "
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </motion.div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs px-2 py-0.5">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></div>
                      AI Active
                    </Badge>
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      ⚡ Real-time
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <kbd className="px-1.5 py-0.5 text-xs rounded bg-muted border">Enter</kbd> to send
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
