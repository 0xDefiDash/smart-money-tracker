
'use client'

import { useEffect, useState } from 'react'
import { AIChatWidget } from './ai-chat-widget'

// Legacy Loomlay component for compatibility (can be removed later)
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'loomlay-chat': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'chat-title'?: string
        'chat-title-colour'?: string
        'greeting-message'?: string
        'headerBg'?: string
        'sendButtonBg'?: string
        'open-btn-bg'?: string
        'messageInputColor'?: string
        'openChatButtonColor'?: string
        'accesskey'?: string
      }, HTMLElement>
      agents: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
      agent: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        uuid?: string
        name?: string
        description?: string
      }, HTMLElement>
    }
  }
}

export function EnhancedDefidashAgent() {
  const [useAIWidget, setUseAIWidget] = useState(true);

  // Use the new AI widget by default, with fallback to Loomlay if needed
  if (useAIWidget) {
    return <AIChatWidget />;
  }

  // Legacy Loomlay fallback (hidden by default)
  return (
    <div style={{ display: 'none' }}>
      <loomlay-chat
        chat-title="Defidash Agent"
        chat-title-colour="white"
        greeting-message="Hello, how can I help you with DeFi and crypto analysis?"
        headerBg="#2e323b"
        sendButtonBg="#25ffc1"
        open-btn-bg="#25ffc1"
        messageInputColor="#1d1d20"
        openChatButtonColor="#25ffc1"
        accesskey=""
      >
        <agents>
          <agent
            uuid="25001a0b9866417d8e1229ed1f87e7ad"
            name="Defidash Agent"
            description="AI assistant for DeFi and cryptocurrency analysis, market insights, and wallet monitoring"
          />
        </agents>
      </loomlay-chat>
    </div>
  )
}
