
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Send, Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useWeb3 } from '@/lib/web3-provider';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  kolUsername: string;
  kolDisplayName: string;
  tweetId: string;
  walletAddresses?: {
    ethAddress?: string;
    bnbAddress?: string;
    solAddress?: string;
    usdcEthAddress?: string;
    usdcBnbAddress?: string;
    usdcSolAddress?: string;
  };
}

const QUICK_AMOUNTS = [5, 10, 25, 50, 100];

export default function TipModal({
  isOpen,
  onClose,
  kolUsername,
  kolDisplayName,
  tweetId,
  walletAddresses
}: TipModalProps) {
  const { account, isConnected, connectWallet } = useWeb3();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleSendTip = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSending(true);

    try {
      // Create Coinbase Commerce charge
      const response = await fetch(`/api/shot-callers/tweets/${tweetId}/tips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kolUsername,
          fromUserAddress: account,
          fromUserName: account?.slice(0, 6) + '...' + account?.slice(-4),
          amount: parseFloat(amount),
          cryptocurrency: 'MULTI', // Coinbase Commerce supports multiple currencies
          message
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const data = await response.json();

      // Redirect to Coinbase Commerce checkout
      if (data.checkoutUrl) {
        toast.success('Redirecting to secure checkout...', {
          description: 'Complete your payment with Coinbase Commerce'
        });

        // Open Coinbase Commerce checkout in same tab
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating tip:', error);
      toast.error('Failed to create payment. Please try again.');
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Tip {kolDisplayName}
          </DialogTitle>
          <DialogDescription>
            Support your favorite KOL with crypto! Powered by Coinbase Commerce.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <Label>Quick amounts (USD)</Label>
            <div className="grid grid-cols-5 gap-2">
              {QUICK_AMOUNTS.map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={amount === value.toString() ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleQuickAmount(value)}
                  className="h-10"
                >
                  ${value}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Or enter custom amount (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Leave a message for the KOL..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={280}
            />
            {message && (
              <p className="text-xs text-muted-foreground text-right">
                {message.length}/280
              </p>
            )}
          </div>

          {/* Info Box */}
          <div className="rounded-lg border bg-blue-500/10 border-blue-500/50 p-3">
            <div className="flex items-start gap-2">
              <CreditCard className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-600 dark:text-blue-400">
                <p className="font-medium mb-1">Secure Crypto Checkout</p>
                <p className="text-blue-600/80 dark:text-blue-400/80">
                  You'll be redirected to Coinbase Commerce to complete your payment securely. 
                  Supports BTC, ETH, USDC, and more!
                </p>
              </div>
            </div>
          </div>

          {/* Send Button */}
          {!isConnected ? (
            <Button onClick={connectWallet} className="w-full" size="lg">
              <CreditCard className="mr-2 h-4 w-4" />
              Connect Wallet to Continue
            </Button>
          ) : (
            <Button
              onClick={handleSendTip}
              disabled={isSending || !amount || parseFloat(amount) <= 0}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              size="lg"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating payment...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send ${amount || '0'} Tip
                </>
              )}
            </Button>
          )}

          {/* Powered by Coinbase */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Powered by{' '}
              <a 
                href="https://commerce.coinbase.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Coinbase Commerce
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
