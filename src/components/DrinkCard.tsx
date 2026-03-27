import React from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { Drink } from '../types';
import { motion } from 'motion/react';

interface DrinkCardProps {
  drink: Drink;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export const DrinkCard: React.FC<DrinkCardProps> = ({ drink, quantity, onAdd, onRemove }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-white/20 transition-all"
    >
      <img 
        src={drink.image} 
        alt={drink.name} 
        className="w-16 h-16 rounded-xl object-cover"
        referrerPolicy="no-referrer"
      />
      
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white">{drink.name}</h4>
          <span className="text-sm font-bold text-orange-500">KES {drink.price}</span>
        </div>
        <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{drink.description}</p>
        
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] uppercase font-bold text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded">{drink.category}</span>
          
          <div className="flex items-center gap-3">
            {quantity > 0 ? (
              <>
                <button onClick={onRemove} className="p-1 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors">
                  <Minus className="w-4 h-4 text-white" />
                </button>
                <span className="text-sm font-bold text-white w-4 text-center">{quantity}</span>
                <button onClick={onAdd} className="p-1 bg-orange-600 rounded-full hover:bg-orange-500 transition-colors">
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </>
            ) : (
              <button 
                onClick={onAdd}
                className="flex items-center gap-2 bg-zinc-800 text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-zinc-700 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
