
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        content: `🚀 Welcome to DefiDash Agent! I'm your advanced crypto market AI with real-time intelligence.

## 🎯 **Enhanced Capabilities:**
• **📊 Technical Analysis**: RSI, support/resistance, sentiment analysis
• **🤖 AI Market Insights**: Automated opportunity detection & risk warnings
• **🐋 Whale Intelligence**: High-impact transactions with wallet labels
• **💹 DeFi Analytics**: Protocol performance, TVL trends, APY tracking  
• **🔥 Trending Tokens**: Meme coins, social scores, risk assessments
• **⛓️ On-Chain Metrics**: Network activity, bridge flows, gas tracking
• **🎮 Block Wars**: Advanced game strategies and mechanics
• **🗺️ Platform Expert**: Complete navigation and feature guidance

**🔥 Market Status**: ${Date.now() % 2 === 0 ? '🚀 ALTCOIN SEASON ACTIVE' : '🔶 BTC DOMINANCE MODE'} | ${Date.now() % 3 === 0 ? 'Fear & Greed: 72 (GREED)' : 'High Volatility Period'}

What market intelligence do you need? 🧠💎`,
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
    { text: "Technical Analysis BTC/ETH", emoji: "📊" },
    { text: "AI Market Insights", emoji: "🤖" },
    { text: "Whale Movements & Impact", emoji: "🐋" },
    { text: "DeFi Yield Opportunities", emoji: "💹" },
    { text: "Trending Meme Coins", emoji: "🔥" },
    { text: "Risk Assessment", emoji: "⚠️" },
    { text: "Block Wars Strategy", emoji: "🎮" },
    { text: "Platform Navigation", emoji: "🗺️" }
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 w-14 h-14 p-0 group"
            >
              <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </Button>
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
              <div className="p-4 border-b bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground flex items-center gap-1">
                        DefiDash Agent <Sparkles className="w-4 h-4 text-yellow-500" />
                      </h3>
                      <p className="text-xs text-muted-foreground">Crypto Market Expert</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
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
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white ml-4'
                            : 'bg-muted text-muted-foreground mr-4'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.role === 'assistant' && (
                            <Bot className="w-4 h-4 mt-1 text-blue-500 flex-shrink-0" />
                          )}
                          {message.role === 'user' && (
                            <User className="w-4 h-4 mt-1 flex-shrink-0" />
                          )}
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 mr-4">
                        <div className="flex items-center space-x-2">
                          <Bot className="w-4 h-4 text-blue-500" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Enhanced Quick Actions */}
                {messages.length <= 1 && (
                  <div className="space-y-3 pt-4">
                    <p className="text-xs text-muted-foreground text-center font-medium">🚀 Quick Market Intelligence:</p>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {quickActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setInputValue(action.text);
                            textareaRef.current?.focus();
                          }}
                          className="text-xs h-auto py-2 px-2 justify-start hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/50 transition-colors"
                        >
                          <span className="mr-1.5 text-sm">{action.emoji}</span>
                          <span className="truncate text-left">{action.text}</span>
                        </Button>
                      ))}
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">💡 Or ask anything about crypto markets!</p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about crypto markets, platform features..."
                      className="resize-none min-h-[60px] text-sm"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary" className="text-xs">
                    🤖 AI-powered • Real-time data
                  </Badge>
                  <p className="text-xs text-muted-foreground">Press Enter to send</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
