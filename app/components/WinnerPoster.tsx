'use client';

import { useRef, useState } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface Props {
  gameName: string;
  amount: number;
  onClose: () => void;
}

export default function WinnerPoster({ gameName, amount, onClose }: Props) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Trigger confetti on mount
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF8C00'],
    });
  }, []);

  const handleDownload = async () => {
    if (!posterRef.current) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        backgroundColor: '#000000',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `tiparena-victory-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    } finally {
      setDownloading(false);
    }
  };

  const multiplier = Math.floor(Math.random() * 30) + 20; // Random 20-50x for dramatic effect

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="max-w-lg w-full">
        <div className="flex justify-end mb-4 gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Download size={20} />
            {downloading ? '生成中...' : '下载'}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <X size={20} />
            关闭
          </button>
        </div>

        {/* Poster */}
        <div 
          ref={posterRef}
          className="bg-gradient-to-br from-black via-gray-900 to-black border-4 border-yellow-500 rounded-2xl p-8 aspect-square flex flex-col items-center justify-center relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-yellow-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-500 rounded-full blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Trophy Icon */}
            <div className="mb-6">
              <div className="text-8xl animate-pulse">🏆</div>
            </div>

            {/* Main text */}
            <div className="mb-8">
              <h2 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent leading-tight">
                {multiplier}X
              </h2>
              <div className="text-3xl md:text-4xl font-black text-white mb-2 tracking-wider">
                SKILL DIFF
              </div>
              <div className="text-yellow-400 text-xl font-bold">完全碾压</div>
            </div>

            {/* Game and amount info */}
            <div className="space-y-3">
              <div className="bg-black/50 rounded-lg px-6 py-3 border border-yellow-500/30">
                <div className="text-gray-400 text-sm mb-1">游戏</div>
                <div className="text-white font-bold text-xl">{gameName}</div>
              </div>
              <div className="bg-black/50 rounded-lg px-6 py-3 border border-yellow-500/30">
                <div className="text-gray-400 text-sm mb-1">获胜奖励</div>
                <div className="text-yellow-400 font-bold text-2xl">+{amount.toFixed(2)} SOL</div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-800">
              <div className="text-yellow-500 font-bold text-lg mb-1">TipArena</div>
              <div className="text-gray-500 text-sm">Prove Your Skills on Solana</div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 left-4 text-yellow-500/20 text-6xl font-black">⚡</div>
          <div className="absolute bottom-4 right-4 text-yellow-500/20 text-6xl font-black">⚡</div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
            <Share2 size={16} />
            分享到社交媒体，炫耀你的胜利！
          </p>
        </div>
      </div>
    </div>
  );
}
