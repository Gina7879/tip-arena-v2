'use client';

import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { Users, Trophy } from 'lucide-react';
import { Room } from '../lib/supabase';

interface Props {
  room: Room;
}

export default function RoomCard({ room }: Props) {
  const router = useRouter();
  const { publicKey } = useWallet();

  const handleJoin = () => {
    if (!publicKey) {
      alert('请先连接钱包');
      return;
    }
    router.push(`/room/${room.id}`);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/20 rounded-xl p-6 hover:border-yellow-500/50 transition-all hover:shadow-lg hover:shadow-yellow-500/20">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-yellow-400 mb-2">{room.game_name}</h3>
          <p className="text-gray-400 text-sm line-clamp-2">{room.rule}</p>
        </div>
        <div className="bg-yellow-500/10 px-3 py-1 rounded-full">
          <span className="text-yellow-400 font-bold text-sm">{room.status === 'active' ? '活跃' : '已满'}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-yellow-500" />
          <span className="text-white font-medium">1/{room.player_count}</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-yellow-500" />
          <span className="text-white font-medium">{room.amount_per_person} SOL</span>
        </div>
      </div>
      
      {room.contact_info && (
        <p className="text-gray-500 text-xs mb-4">联系: {room.contact_info}</p>
      )}
      
      <button
        onClick={handleJoin}
        disabled={room.status !== 'active'}
        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold py-2 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        加入房间
      </button>
    </div>
  );
}
