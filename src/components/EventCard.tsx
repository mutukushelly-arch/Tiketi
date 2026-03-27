import React from 'react';
import { Calendar, MapPin, Ticket as TicketIcon } from 'lucide-react';
import { Event } from '../types';
import { motion } from 'motion/react';

interface EventCardProps {
  event: Event;
  onSelect: (type: keyof Event['prices']) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onSelect }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden hover:border-orange-500/50 transition-all group"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={event.image} 
          alt={event.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h3 className="text-2xl font-bold text-white tracking-tight">{event.name}</h3>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-zinc-400 text-sm">
          <Calendar className="w-4 h-4" />
          <span>{new Date(event.date).toLocaleDateString('en-KE', { dateStyle: 'long' })}</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400 text-sm">
          <MapPin className="w-4 h-4" />
          <span>{event.venue}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-4">
          {Object.entries(event.prices).map(([type, price]) => (
            <button
              key={type}
              onClick={() => onSelect(type as keyof Event['prices'])}
              className="flex flex-col items-start p-3 bg-white/5 rounded-xl hover:bg-orange-600 transition-colors group/btn"
            >
              <span className="text-[10px] uppercase font-bold text-zinc-500 group-hover/btn:text-white/80">{type}</span>
              <span className="text-lg font-bold text-white">KES {price.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
