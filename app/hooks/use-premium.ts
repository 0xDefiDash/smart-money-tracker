
'use client';

import { useState, useEffect } from 'react';

interface PremiumStatus {
  isPremium: boolean;
  isTrialActive: boolean;
  trialEndsAt: string | null;
  premiumExpiresAt: string | null;
  trialMinutesLeft: number;
  hasPremiumAccess: boolean;
  loading: boolean;
}

export function usePremium(): PremiumStatus {
  const [status, setStatus] = useState<PremiumStatus>({
    isPremium: false,
    isTrialActive: false,
    trialEndsAt: null,
    premiumExpiresAt: null,
    trialMinutesLeft: 0,
    hasPremiumAccess: false,
    loading: true
  });

  useEffect(() => {
    fetchPremiumStatus();
  }, []);

  const fetchPremiumStatus = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        const now = new Date();
        const trialEnd = data.user?.trialEndsAt ? new Date(data.user.trialEndsAt) : null;
        const isTrialActive = trialEnd ? trialEnd > now : false;
        const trialMinutesLeft = isTrialActive && trialEnd
          ? Math.max(0, Math.floor((trialEnd.getTime() - now.getTime()) / 60000))
          : 0;
        const hasPremiumAccess = data.user?.isPremium || isTrialActive;

        setStatus({
          isPremium: data.user?.isPremium || false,
          isTrialActive,
          trialEndsAt: data.user?.trialEndsAt || null,
          premiumExpiresAt: data.user?.premiumExpiresAt || null,
          trialMinutesLeft,
          hasPremiumAccess,
          loading: false
        });
      } else {
        // If API fails, assume no premium access
        setStatus(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Failed to fetch premium status:', error);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  return status;
}
