'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ArrowLeft, Users, Trophy, Crown, Zap } from 'lucide-react';
import { supabase, Room } from '../../lib/supabase';
import WinnerPoster from '../../components/WinnerPoster';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoomPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState(false);
  const [showPoster, setShowPoster] = useState(false);

  useEffect(() => {
    fetchRoom();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel(`room_${resolvedParams.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'rooms',
        filter: `id=eq.${resolvedParams.id}`
      }, () => {
        fetchRoom();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [resolvedParams.id]);

  const fetchRoom = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();
      
      if (error) throw error;
      setRoom(data);
    } catch (error) {
      console.error('获取房间信息失败:', error);
      alert('房间不存在');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async () => {
    if (!publicKey || !room) return;

    const confirmLoser = confirm('确认你是输家吗？你将向所有其他玩家支付。');
    if (!confirmLoser) return;

    setSettling(true);
    try {
      // For demo purposes, we'll simulate payment
      // In production, you'd create a transaction to pay each winner
      const transaction = new Transaction();
      const recipientPubkey = new PublicKey(room.owner_address);
      
      // Calculate payment (in a real app, you'd pay all winners)
      const amountInLamports = room.amount_per_person * LAMPORTS_PER_SOL * (room.player_count - 1);
      
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports: amountInLamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      // Update room status
      await supabase
        .from('rooms')
        .update({ status: 'completed' })
        .eq('id', resolvedParams.id);

      // Show winner poster
      setShowPoster(true);
    } catch (error) {
      console.error('支付失败:', error);
      alert('支付失败，请重试');
    } finally {
      setSettling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-yellow-500/20 bg-black/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            返回大厅
          </button>
          <WalletMultiButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Room Info Card */}
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 rounded-xl p-8 mb-8 shadow-lg shadow-yellow-500/10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-yellow-400 mb-2">{room.game_name}</h1>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="px-3 py-1 bg-yellow-500/10 rounded-full text-yellow-400 text-sm font-medium">
                  {room.status === 'active' ? '进行中' : '已完成'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-500">{room.amount_per_person} SOL</div>
              <div className="text-gray-400 text-sm">每人</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-black/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Users size={18} />
                <span className="text-sm">玩家人数</span>
              </div>
              <div className="text-2xl font-bold text-white">1/{room.player_count}</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Trophy size={18} />
                <span className="text-sm">总奖池</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {(room.amount_per_person * room.player_count).toFixed(2)} SOL
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-yellow-400">游戏规则</h3>
            <p className="text-gray-300 whitespace-pre-line">{room.rule}</p>
          </div>

          {room.contact_info && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-yellow-400">联系方式</h3>
              <p className="text-gray-300">{room.contact_info}</p>
            </div>
          )}

          {/* Room Owner */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="text-yellow-500" size={18} />
              <span className="text-sm text-gray-400">房主</span>
            </div>
            <p className="text-xs text-gray-500 font-mono break-all">{room.owner_address}</p>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="text-yellow-500" />
            房间内玩家
          </h2>
          <div className="space-y-3">
            <div className="bg-black/30 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                  <Crown size={20} className="text-black" />
                </div>
                <div>
                  <p className="font-medium text-white">房主</p>
                  <p className="text-xs text-gray-500 font-mono">{room.owner_address.slice(0, 8)}...{room.owner_address.slice(-6)}</p>
                </div>
              </div>
              <span className="text-yellow-500 font-bold">准备就绪</span>
            </div>
            {/* Placeholder for other players */}
            {Array.from({ length: room.player_count - 1 }).map((_, i) => (
              <div key={i} className="bg-black/10 rounded-lg p-4 flex items-center justify-between border border-dashed border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                    <Users size={20} className="text-gray-600" />
                  </div>
                  <p className="text-gray-500">等待玩家加入...</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settle Button */}
        {room.status === 'active' && (
          <div className="bg-gradient-to-br from-red-900/20 to-black border-2 border-red-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <Zap className="text-red-500 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-xl font-bold text-red-400 mb-2">结算赔付</h3>
                <p className="text-gray-400 mb-4">
                  游戏结束后，输家点击此按钮向所有赢家支付 {room.amount_per_person} SOL。
                  <br />
                  支付完成后将生成专属战绩卡片用于分享。
                </p>
              </div>
            </div>
            <button
              onClick={handleSettle}
              disabled={!publicKey || settling}
              className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white font-bold py-4 rounded-lg hover:from-red-600 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {settling ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  支付中...
                </>
              ) : (
                <>
                  <Zap size={20} />
                  我是输家，立即支付
                </>
              )}
            </button>
          </div>
        )}

        {room.status === 'completed' && (
          <div className="bg-gradient-to-br from-green-900/20 to-black border-2 border-green-500/30 rounded-xl p-6 text-center">
            <Trophy className="text-green-500 mx-auto mb-4" size={48} />
            <h3 className="text-2xl font-bold text-green-400 mb-2">游戏已结束</h3>
            <p className="text-gray-400">赔付已完成</p>
          </div>
        )}
      </main>

      {/* Winner Poster Modal */}
      {showPoster && room && (
        <WinnerPoster
          gameName={room.game_name}
          amount={room.amount_per_person * (room.player_count - 1)}
          onClose={() => {
            setShowPoster(false);
            router.push('/');
          }}
        />
      )}
    </div>
  );
}
