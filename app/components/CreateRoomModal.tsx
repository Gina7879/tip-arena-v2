'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { X } from 'lucide-react';
import { supabase, RoomInsert } from '../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateRoomModal({ isOpen, onClose, onSuccess }: Props) {
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    game_name: '',
    player_count: 2,
    rule: '',
    amount_per_person: 0,
    contact_info: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      alert('请先连接钱包');
      return;
    }

    setLoading(true);
    try {
      const newRoom: RoomInsert = {
        ...formData,
        owner_address: publicKey.toBase58(),
        status: 'active',
      };

      const { error } = await supabase.from('rooms').insert([newRoom] as never);
      
      if (error) throw error;
      
      // Reset form
      setFormData({
        game_name: '',
        player_count: 2,
        rule: '',
        amount_per_person: 0,
        contact_info: '',
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('创建房间失败:', error);
      alert('创建房间失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
          发布游戏请求
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">游戏名称</label>
            <input
              type="text"
              required
              value={formData.game_name}
              onChange={(e) => setFormData({ ...formData, game_name: e.target.value })}
              className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500"
              placeholder="例如：Dota 2, CSGO, LOL"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">最大人数</label>
            <input
              type="number"
              required
              min="2"
              max="10"
              value={formData.player_count}
              onChange={(e) => setFormData({ ...formData, player_count: parseInt(e.target.value) })}
              className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">游戏规则</label>
            <textarea
              required
              value={formData.rule}
              onChange={(e) => setFormData({ ...formData, rule: e.target.value })}
              className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500 h-24"
              placeholder="描述游戏规则和赔付方式"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">每人金额 (SOL)</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.amount_per_person}
              onChange={(e) => setFormData({ ...formData, amount_per_person: parseFloat(e.target.value) })}
              className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500"
              placeholder="0.1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">联系方式</label>
            <input
              type="text"
              value={formData.contact_info}
              onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
              className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500"
              placeholder="Discord 或 Telegram"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !publicKey}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold py-3 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '创建中...' : '创建房间'}
          </button>
        </form>
      </div>
    </div>
  );
}
