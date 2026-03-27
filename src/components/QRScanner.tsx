import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { X, CheckCircle2, AlertCircle, Loader2, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QRScannerProps {
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onClose }) => {
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scannerRef.current.render(onScanSuccess, onScanFailure);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, []);

  async function onScanSuccess(decodedText: string) {
    if (!isScanning) return;
    setIsScanning(false);
    
    try {
      const ticketRef = doc(db, 'tickets', decodedText);
      const ticketSnap = await getDoc(ticketRef);

      if (!ticketSnap.exists()) {
        setScanResult({ success: false, message: "Invalid Ticket ID" });
        return;
      }

      const ticketData = ticketSnap.data();
      if (ticketData.status === 'used') {
        setScanResult({ success: false, message: "Ticket Already Used!", data: ticketData });
      } else {
        await updateDoc(ticketRef, { status: 'used' });
        setScanResult({ success: true, message: "Access Granted!", data: ticketData });
      }
    } catch (error) {
      setScanResult({ success: false, message: "Verification Error" });
    }
  }

  function onScanFailure(error: any) {
    // console.warn(`Code scan error = ${error}`);
  }

  const resetScanner = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      <div className="p-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <Camera className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Staff Entry Scanner</h2>
        </div>
        <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white">
          <X className="w-8 h-8" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div id="reader" className="w-full max-w-md overflow-hidden rounded-3xl border-2 border-orange-600/20" />
        
        <AnimatePresence>
          {scanResult && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`mt-8 w-full max-w-md p-8 rounded-3xl flex flex-col items-center text-center space-y-4 ${
                scanResult.success ? 'bg-green-500/10 border border-green-500/50' : 'bg-red-500/10 border border-red-500/50'
              }`}
            >
              {scanResult.success ? (
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              ) : (
                <AlertCircle className="w-16 h-16 text-red-500" />
              )}
              
              <div>
                <h3 className={`text-2xl font-black uppercase ${scanResult.success ? 'text-green-500' : 'text-red-500'}`}>
                  {scanResult.message}
                </h3>
                {scanResult.data && (
                  <div className="mt-4 text-zinc-400 space-y-1">
                    <p className="font-bold text-white uppercase">{scanResult.data.type} Ticket</p>
                    <p className="text-xs">ID: {scanResult.data.id}</p>
                  </div>
                )}
              </div>

              <button 
                onClick={resetScanner}
                className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-zinc-200 transition-all"
              >
                Scan Next
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {isScanning && (
          <div className="mt-8 flex items-center gap-3 text-zinc-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p className="text-sm font-medium uppercase tracking-widest">Waiting for QR Code...</p>
          </div>
        )}
      </div>
    </div>
  );
};
