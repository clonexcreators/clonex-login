export interface AuthChallenge {
  message: string;
  nonce: string;
  timestamp: number;
}

export interface AuthError {
  type: 'WALLET_REJECTED' | 'NETWORK_ERROR' | 'SESSION_EXPIRED' | 'SIGNATURE_FAILED' | 'UNKNOWN';
  message: string;
}
