import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket } from '../types';
import { motion } from 'motion/react';
import { Download, Share2, Calendar, MapPin, User } from 'lucide-react';

interface TicketDisplayProps {
  ticket: Ticket;
  eventName: string;
  eventDate: string;
  venue: string;
  userName: string;
}

export const TicketDisplay: React.FC<TicketDisplayProps> = ({ ticket, eventName, eventDate, venue, userName }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-sm mx-auto bg-white rounded-[2.5rem] overflow-hidden shadow-2xl text-black"
    >
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            {ticket.type} Ticket
          </div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest"># {ticket.id.slice(-8).toUpperCase()}</span>
        </div>

        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tighter leading-none uppercase">{eventName}</h2>
          <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium">
            <Calendar className="w-4 h-4" />
            <span>{new Date(eventDate).toLocaleDateString('en-KE', { dateStyle: 'full' })}</span>
          </div>
        </div>

        <div className="flex justify-center p-6 bg-zinc-100 rounded-3xl">
          <QRCodeSVG value={ticket.id} size={200} level="H" includeMargin={false} />
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 pt-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Attendee</span>
            <div className="flex items-center gap-2 font-bold text-sm">
              <User className="w-4 h-4 text-orange-600" />
              <span>{userName}</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Venue</span>
            <div className="flex items-center gap-2 font-bold text-sm">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span className="truncate">{venue}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950 p-6 flex items-center justify-between">
        <button className="flex items-center gap-2 text-white font-bold text-sm hover:text-orange-500 transition-colors">
          <Download className="w-5 h-5" />
          <span>Save PDF</span>
        </button>
        <button className="flex items-center gap-2 text-white font-bold text-sm hover:text-orange-500 transition-colors">
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>
    </motion.div>
  );
};
