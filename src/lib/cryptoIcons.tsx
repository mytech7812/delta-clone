import { CIcon } from '@/components/CIcon';
import { 
  TokenBTC, TokenETH, TokenSOL, TokenUSDT, TokenBNB, 
  TokenXRP, TokenADA, TokenDOGE, TokenDOT, TokenAVAX, 
  TokenMATIC, TokenLINK, TokenUNI, TokenATOM, TokenLTC,
  TokenSHIB, TokenFTM, TokenNEAR, TokenALGO, TokenVET, TokenICP
} from '@web3icons/react';

export const getCryptoIcon = (sym: string, size: number = 32) => {
  const iconProps = { size, variant: 'branded' as const };
  
  switch(sym.toUpperCase()) {
    case 'BTC': return <TokenBTC {...iconProps} />;
    case 'ETH': return <TokenETH {...iconProps} />;
    case 'SOL': return <TokenSOL {...iconProps} />;
    case 'USDT': return <TokenUSDT {...iconProps} />;
    case 'BNB': return <TokenBNB {...iconProps} />;
    case 'XRP': return <TokenXRP {...iconProps} />;
    case 'ADA': return <TokenADA {...iconProps} />;
    case 'DOGE': return <TokenDOGE {...iconProps} />;
    case 'DOT': return <TokenDOT {...iconProps} />;
    case 'AVAX': return <TokenAVAX {...iconProps} />;
    case 'MATIC': return <TokenMATIC {...iconProps} />;
    case 'LINK': return <TokenLINK {...iconProps} />;
    case 'UNI': return <TokenUNI {...iconProps} />;
    case 'ATOM': return <TokenATOM {...iconProps} />;
    case 'LTC': return <TokenLTC {...iconProps} />;
    case 'SHIB': return <TokenSHIB {...iconProps} />;
    case 'FTM': return <TokenFTM {...iconProps} />;
    case 'NEAR': return <TokenNEAR {...iconProps} />;
    case 'ALGO': return <TokenALGO {...iconProps} />;
    case 'VET': return <TokenVET {...iconProps} />;
    case 'ICP': return <TokenICP {...iconProps} />;
    default: return <CIcon sym={sym} size={size} />;
  }
};