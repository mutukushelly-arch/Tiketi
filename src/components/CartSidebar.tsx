import React, { useState } from 'react';
import { X, ShoppingBag, CreditCard, Phone, Loader2 } from 'lucide-react';
import { CartItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string, type: string) => void;
  onCheckout: (phone: string) => Promise<void>;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, items, onRemove, onCheckout }) => {
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!phone.match(/^254[0-9]{9}$/)) {
      toast.error("Please enter a valid M-Pesa number (254XXXXXXXXX)");
      return;
    }
    setIsProcessing(true);
    try {
      await onCheckout(phone);
    } catch (error) {
      toast.error("Checkout failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-zinc-950 border-l border-white/10 z-[70] flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Your Cart</h2>
              </div>
              <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                  <ShoppingBag className="w-12 h-12 opacity-20" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div>
                      <h4 className="font-bold text-white">{item.name}</h4>
                      <p className="text-xs text-zinc-500">{item.type === 'ticket' ? item.ticketType : 'Drink'} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-white">KES {item.price * item.quantity}</span>
                      <button onClick={() => onRemove(item.id, item.type)} className="text-zinc-600 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-zinc-900/50 space-y-6">
                <div className="flex items-center justify-between text-xl font-bold text-white">
                  <span>Total</span>
                  <span className="text-orange-500">KES {total.toLocaleString()}</span>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input 
                      type="text" 
                      placeholder="M-Pesa Number (254...)" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-all"
                    />
                  </div>

                  <button 
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full bg-orange-600 text-white font-bold py-4 rounded-2xl hover:bg-orange-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-6 h-6" />
                        <span>Pay with M-Pesa</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-zinc-500 uppercase tracking-widest">Secure STK Push Payment</p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
