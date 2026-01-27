'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Plus, Swords } from 'lucide-react';
import { supabase, Room } from './lib/supabase';
import RoomCard from './components/RoomCard';
import CreateRoomModal from './components/CreateRoomModal';

export default function Home() {
  const { connected } = useWallet();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('获取房间列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('rooms_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        fetchRooms();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-yellow-500/20 bg-black/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Swords className="text-yellow-500" size={32} />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              TipArena
            </h1>
          </div>
          <WalletMultiButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            组队竞技，即时赔付
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            寻找队友，开黑对战，输家用 Solana 支付 —— 展现你的实力差距
          </p>
          
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!connected}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold px-8 py-4 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 text-lg shadow-lg shadow-yellow-500/30"
          >
            <Plus size={24} />
            发布游戏请求
          </button>
          
          {!connected && (
            <p className="text-yellow-500 mt-4 text-sm">请先连接钱包</p>
          )}
        </div>

        {/* Rooms Grid */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-yellow-500">⚡</span>
            活跃的游戏请求
          </h3>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/20 rounded-xl">
              <p className="text-gray-400 text-lg">暂无活跃房间，成为第一个发布请求的人吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchRooms}
      />
    </div>
  );
}
