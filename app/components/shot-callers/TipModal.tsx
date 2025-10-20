
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Wallet, Send, Copy, Check } from 'lucide-react';
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

const CRYPTO_OPTIONS = [
  { value: 'ETH', label: 'Ethereum (ETH)', addressKey: 'ethAddress' },
  { value: 'BNB', label: 'Binance Coin (BNB)', addressKey: 'bnbAddress' },
  { value: 'SOL', label: 'Solana (SOL)', addressKey: 'solAddress' },
  { value: 'USDC_ETH', label: 'USDC (Ethereum)', addressKey: 'usdcEthAddress' },
  { value: 'USDC_BNB', label: 'USDC (BSC)', addressKey: 'usdcBnbAddress' },
  { value: 'USDC_SOL', label: 'USDC (Solana)', addressKey: 'usdcSolAddress' },
];

const CRYPTO_PRICES: Record<string, number> = {
  'ETH': 2500,
  'BNB': 300,
  'SOL': 140,
  'USDC_ETH': 1,
  'USDC_BNB': 1,
  'USDC_SOL': 1,
};

export default function TipModal({
  isOpen,
  onClose,
  kolUsername,
  kolDisplayName,
  tweetId,
  walletAddresses
}: TipModalProps) {
  const { account, isConnected, connectWallet } = useWeb3();
  const [selectedCrypto, setSelectedCrypto] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedOption = CRYPTO_OPTIONS.find(opt => opt.value === selectedCrypto);
  const recipientAddress = walletAddresses?.[selectedOption?.addressKey as keyof typeof walletAddresses];
  const usdValue = amount ? (parseFloat(amount) * CRYPTO_PRICES[selectedCrypto]).toFixed(2) : '0.00';

  const handleCopyAddress = () => {
    if (recipientAddress) {
      navigator.clipboard.writeText(recipientAddress);
      setCopied(true);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
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

    if (!recipientAddress) {
      toast.error(`No ${selectedCrypto} address found for this KOL`);
      return;
    }

    setIsSending(true);

    try {
      // In a real implementation, you would send the transaction here
      // For now, we'll just record the tip in the database
      const response = await fetch(`/api/shot-callers/tweets/${tweetId}/tips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kolUsername,
          fromUserAddress: account,
          fromUserName: account?.slice(0, 6) + '...' + account?.slice(-4),
          amount: parseFloat(amount),
          cryptocurrency: selectedCrypto,
          amountUsd: parseFloat(usdValue),
          message,
          txHash: null // Would be the actual transaction hash
        })
      });

      if (!response.ok) {
        throw new Error('Failed to record tip');
      }

      toast.success(`Tip sent to ${kolDisplayName}! 🎉`, {
        description: `You sent ${amount} ${selectedCrypto} (~$${usdValue})`
      });

      // Reset form
      setAmount('');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending tip:', error);
      toast.error('Failed to send tip. Please try again.');
    } finally {
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
            Show your appreciation with crypto! Tips go directly to the KOL.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Crypto Selection */}
          <div className="space-y-2">
            <Label htmlFor="crypto">Select Cryptocurrency</Label>
            <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
              <SelectTrigger id="crypto">
                <SelectValue placeholder="Select crypto" />
              </SelectTrigger>
              <SelectContent>
                {CRYPTO_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {selectedCrypto.replace('_', ' ')}
              </span>
            </div>
            {amount && (
              <p className="text-xs text-muted-foreground">
                ≈ ${usdValue} USD
              </p>
            )}
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
            />
          </div>

          {/* Recipient Address */}
          {recipientAddress ? (
            <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
              <Label className="text-xs text-muted-foreground">Recipient Address</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs break-all">
                  {recipientAddress}
                </code>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAddress}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3">
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                No {selectedCrypto} address available for this KOL
              </p>
            </div>
          )}

          {/* Connect Wallet / Send Button */}
          {!isConnected ? (
            <Button onClick={connectWallet} className="w-full" size="lg">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet to Tip
            </Button>
          ) : (
            <Button
              onClick={handleSendTip}
              disabled={isSending || !recipientAddress || !amount || parseFloat(amount) <= 0}
              className="w-full"
              size="lg"
            >
              <Send className="mr-2 h-4 w-4" />
              {isSending ? 'Sending...' : `Send ${amount || '0'} ${selectedCrypto.replace('_', ' ')}`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
