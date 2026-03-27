import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EventCard } from './components/EventCard';
import { DrinkCard } from './components/DrinkCard';
import { CartSidebar } from './components/CartSidebar';
import { TicketDisplay } from './components/TicketDisplay';
import { QRScanner } from './components/QRScanner';
import { SAMPLE_EVENTS, SAMPLE_DRINKS } from './constants';
import { CartItem, Ticket, Event } from './types';
import { auth, db } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket as TicketIcon, ShoppingBag, ArrowRight, Sparkles, Zap } from 'lucide-react';

export default function App() {
  const [user] = useAuthState(auth);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTab, setActiveTab] = useState<'events' | 'tickets'>('events');

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'tickets'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const ticketData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
        setTickets(ticketData);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const addToCart = (item: any, type: 'ticket' | 'drink', ticketType?: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.type === type && i.ticketType === ticketType);
      if (existing) {
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { 
        id: item.id, 
        type, 
        name: item.name, 
        price: type === 'ticket' ? item.prices[ticketType!] : item.price, 
        quantity: 1,
        ticketType 
      }];
    });
    toast.success(`Added ${item.name} to cart`);
  };

  const removeFromCart = (id: string, type: string) => {
    setCart(prev => prev.filter(i => !(i.id === id && i.type === type)));
  };

  const handleCheckout = async (phone: string) => {
    if (!user) {
      toast.error("Please login to checkout");
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    try {
      // 1. Create Order in Firestore
      const orderRef = await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        totalAmount: total,
        paymentStatus: 'pending',
        createdAt: serverTimestamp(),
        items: cart
      });

      // 2. Initiate M-Pesa STK Push via Backend
      const response = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount: 1, orderId: orderRef.id }) // Using 1 KES for testing
      });

      const data = await response.json();
      
      if (data.ResponseCode === "0") {
        toast.success("STK Push sent! Please enter your PIN on your phone.");
        
        // 3. Simulate Payment Success (In a real app, the callback would handle this)
        setTimeout(async () => {
          // Generate Tickets
          for (const item of cart.filter(i => i.type === 'ticket')) {
            for (let k = 0; k < item.quantity; k++) {
              await addDoc(collection(db, 'tickets'), {
                userId: user.uid,
                orderId: orderRef.id,
                eventId: item.id,
                type: item.ticketType,
                price: item.price,
                qrCode: Math.random().toString(36).substring(7),
                status: 'unused',
                createdAt: serverTimestamp()
              });
            }
          }
          setCart([]);
          setIsCartOpen(false);
          setActiveTab('tickets');
          toast.success("Payment confirmed! Your tickets are ready.");
        }, 5000);
      } else {
        throw new Error("M-Pesa initiation failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Checkout failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-600 selection:text-white">
      <Navbar 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
        onCartClick={() => setIsCartOpen(true)}
        onScannerClick={() => setIsScannerOpen(true)}
      />

      <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="relative py-12 mb-12 overflow-hidden rounded-[3rem] bg-zinc-900 border border-white/5">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="w-64 h-64 text-orange-600" />
          </div>
          
          <div className="relative z-10 px-8 md:px-16 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-orange-600/10 text-orange-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <Zap className="w-4 h-4" />
              <span>Limited Tickets Available</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6 uppercase">
              Experience the <span className="text-orange-600">Best Events</span> in Kenya.
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-xl mb-8 leading-relaxed">
              Book your tickets, pre-order your drinks, and skip the queue. 
              The ultimate event experience starts here.
            </p>
            <button 
              onClick={() => setActiveTab('events')}
              className="bg-white text-black px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-zinc-200 transition-all"
            >
              <span>Explore Events</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-12 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5 w-fit mx-auto md:mx-0">
          <button 
            onClick={() => setActiveTab('events')}
            className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${activeTab === 'events' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-zinc-500 hover:text-white'}`}
          >
            Events & Drinks
          </button>
          <button 
            onClick={() => setActiveTab('tickets')}
            className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${activeTab === 'tickets' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-zinc-500 hover:text-white'}`}
          >
            My Tickets
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'events' ? (
            <motion.div 
              key="events"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-20"
            >
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <TicketIcon className="w-8 h-8 text-orange-600" />
                    <span>Featured Events</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                  {SAMPLE_EVENTS.map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onSelect={(type) => addToCart(event, 'ticket', type)} 
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8 text-orange-600" />
                    <span>Pre-order Drinks</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {SAMPLE_DRINKS.map(drink => (
                    <DrinkCard 
                      key={drink.id} 
                      drink={drink} 
                      quantity={cart.find(i => i.id === drink.id && i.type === 'drink')?.quantity || 0}
                      onAdd={() => addToCart(drink, 'drink')}
                      onRemove={() => removeFromCart(drink.id, 'drink')}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="tickets"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {tickets.length === 0 ? (
                <div className="col-span-full py-20 text-center text-zinc-500 space-y-4">
                  <TicketIcon className="w-16 h-16 mx-auto opacity-10" />
                  <p className="text-xl font-bold uppercase tracking-widest">No tickets found</p>
                  <button 
                    onClick={() => setActiveTab('events')}
                    className="text-orange-500 font-bold hover:underline"
                  >
                    Go book some events
                  </button>
                </div>
              ) : (
                tickets.map(ticket => {
                  const event = SAMPLE_EVENTS.find(e => e.id === ticket.eventId);
                  return (
                    <TicketDisplay 
                      key={ticket.id} 
                      ticket={ticket} 
                      eventName={event?.name || 'Unknown Event'}
                      eventDate={event?.date || ''}
                      venue={event?.venue || ''}
                      userName={user?.displayName || 'Guest'}
                    />
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />

      {isScannerOpen && <QRScanner onClose={() => setIsScannerOpen(false)} />}

      <footer className="py-12 border-t border-white/5 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <TicketIcon className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tighter uppercase">TIKETI</span>
          </div>
          <p className="text-zinc-600 text-sm uppercase tracking-widest font-bold">
            © 2026 Tiketi Kenya. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6 text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      <Toaster position="bottom-right" theme="dark" richColors />
    </div>
  );
}
