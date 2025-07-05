import React from 'react';
import { MessageSquare } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Dappit</span>
        </div>

        {/* Right: Wallet Button */}
        <div className="flex items-center">
          <WalletMultiButton className="!bg-primary !text-white !hover:brightness-110 !rounded-xl" />
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
