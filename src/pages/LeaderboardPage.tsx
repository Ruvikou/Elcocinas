import { useGamificationStore } from '@/store/useGamificationStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Flame, Crown } from 'lucide-react';

export function LeaderboardPage() {
  const { getLeaderboard } = useGamificationStore();
  const { user: currentUser } = useAuthStore();
  
  const leaderboard = getLeaderboard();

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">{index + 1}</span>;
    }
  };

  const getRowStyle = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 1:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 2:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
      default:
        return 'bg-card';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/30">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Ranking de Cocineros</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Los mejores cocineros de nuestra comunidad. Compite, gana puntos y escala posiciones.
        </p>
      </div>

      {/* Podium (Top 3) */}
      {leaderboard.length >= 3 && (
        <div className="flex justify-center items-end gap-4 mb-12">
          {/* 2nd Place */}
          <div className="text-center">
            <Avatar className="w-16 h-16 mx-auto mb-2 border-4 border-gray-300">
              <AvatarFallback className="bg-gray-200 text-gray-700 text-xl">
                {leaderboard[1].username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="w-24 h-32 bg-gradient-to-t from-gray-200 to-gray-100 rounded-t-lg flex flex-col items-center justify-end pb-3">
              <Medal className="w-6 h-6 text-gray-400 mb-1" />
              <span className="font-bold text-gray-700">2º</span>
              <span className="text-xs text-gray-600 truncate max-w-[80px]">{leaderboard[1].username}</span>
              <span className="text-xs text-gray-500">{leaderboard[1].points} pts</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="text-center">
            <Avatar className="w-20 h-20 mx-auto mb-2 border-4 border-yellow-400">
              <AvatarFallback className="bg-yellow-100 text-yellow-700 text-2xl">
                {leaderboard[0].username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="w-28 h-40 bg-gradient-to-t from-yellow-200 to-yellow-50 rounded-t-lg flex flex-col items-center justify-end pb-3">
              <Crown className="w-8 h-8 text-yellow-500 mb-1" />
              <span className="font-bold text-yellow-700">1º</span>
              <span className="text-xs text-yellow-800 truncate max-w-[100px]">{leaderboard[0].username}</span>
              <span className="text-xs text-yellow-600">{leaderboard[0].points} pts</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="text-center">
            <Avatar className="w-16 h-16 mx-auto mb-2 border-4 border-amber-600">
              <AvatarFallback className="bg-amber-100 text-amber-700 text-xl">
                {leaderboard[2].username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="w-24 h-28 bg-gradient-to-t from-amber-200 to-amber-50 rounded-t-lg flex flex-col items-center justify-end pb-3">
              <Award className="w-6 h-6 text-amber-600 mb-1" />
              <span className="font-bold text-amber-700">3º</span>
              <span className="text-xs text-amber-800 truncate max-w-[80px]">{leaderboard[2].username}</span>
              <span className="text-xs text-amber-600">{leaderboard[2].points} pts</span>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="bg-card rounded-2xl border overflow-hidden">
        <div className="p-4 bg-muted/50 border-b">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-2 md:col-span-1 text-center">#</div>
            <div className="col-span-6 md:col-span-5">Cocinero</div>
            <div className="col-span-2 md:col-span-2 text-center">Nivel</div>
            <div className="col-span-2 md:col-span-2 text-center">Puntos</div>
            <div className="hidden md:block md:col-span-2 text-center">Estado</div>
          </div>
        </div>

        <div className="divide-y">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.userId}
              className={`p-4 ${getRowStyle(index)} ${
                currentUser?.id === entry.userId ? 'ring-2 ring-orange-500 ring-inset' : ''
              }`}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-2 md:col-span-1 flex justify-center">
                  {getRankIcon(index)}
                </div>
                <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                      {entry.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium truncate">{entry.username}</p>
                    {currentUser?.id === entry.userId && (
                      <Badge variant="outline" className="text-xs">Tú</Badge>
                    )}
                  </div>
                </div>
                <div className="col-span-2 md:col-span-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">{entry.level}</span>
                  </div>
                </div>
                <div className="col-span-2 md:col-span-2 text-center">
                  <span className="font-bold">{entry.points}</span>
                </div>
                <div className="hidden md:block md:col-span-2 text-center">
                  {index < 3 ? (
                    <Badge className={index === 0 ? 'bg-yellow-400 text-yellow-900' : index === 1 ? 'bg-gray-300 text-gray-700' : 'bg-amber-500 text-white'}>
                      {index === 0 ? 'Campeón' : index === 1 ? 'Subcampeón' : 'Tercero'}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Participante</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How to earn points */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">¿Cómo ganar puntos?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { action: 'Completar receta', points: '25-125', icon: '✅', color: 'bg-green-100 text-green-700' },
            { action: 'Dar like', points: '+5', icon: '❤️', color: 'bg-rose-100 text-rose-700' },
            { action: 'Comentar', points: '+10', icon: '💬', color: 'bg-blue-100 text-blue-700' },
            { action: 'Subir foto', points: '+20', icon: '📸', color: 'bg-purple-100 text-purple-700' },
          ].map((item) => (
            <div key={item.action} className="bg-card rounded-xl border p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-2xl`}>
                {item.icon}
              </div>
              <div>
                <p className="font-medium">{item.action}</p>
                <p className="text-lg font-bold">{item.points} pts</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
