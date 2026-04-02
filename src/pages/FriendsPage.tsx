import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocialStore } from '@/store/useSocialStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  UserPlus, 
  Check, 
  X, 
  UserCheck,
  Clock
} from 'lucide-react';

export function FriendsPage() {
  const { user } = useAuthStore();
  const { 
    friendships, 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest,
    getFriends,
    getPendingRequests 
  } = useSocialStore();
  
  const [searchQuery, setSearchQuery] = useState('');

  const friends = user ? getFriends(user.id) : [];
  const pendingRequests = user ? getPendingRequests(user.id) : [];
  const sentRequests = friendships.filter(f => 
    f.requesterId === user?.id && f.isPending
  );

  const handleSendRequest = (userId: string) => {
    if (user) {
      sendFriendRequest(user.id, userId);
    }
  };

  // Mock users for search (in a real app, this would come from the API)
  const mockUsers = [
    { id: 'user1', username: 'chef_ana', level: 5, points: 450 },
    { id: 'user2', username: 'cocinero_juan', level: 3, points: 280 },
    { id: 'user3', username: 'gourmet_maria', level: 7, points: 720 },
    { id: 'user4', username: 'chef_carlos', level: 4, points: 380 },
  ];

  const filteredUsers = mockUsers.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
    u.id !== user?.id &&
    !friends.includes(u.id)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Amigos</h1>
        <p className="text-muted-foreground">
          Conecta con otros cocineros y comparte tu pasión por la gastronomía
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar cocineros por nombre de usuario..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 py-6 text-lg"
        />
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Resultados de búsqueda</h2>
          {filteredUsers.length === 0 ? (
            <p className="text-muted-foreground">No se encontraron usuarios</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((foundUser) => (
                <div key={foundUser.id} className="bg-card rounded-xl border p-4 flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                      {foundUser.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{foundUser.username}</p>
                    <p className="text-sm text-muted-foreground">
                      Nivel {foundUser.level} • {foundUser.points} pts
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleSendRequest(foundUser.id)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">
            <UserCheck className="w-4 h-4 mr-2" />
            Mis Amigos ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            <Clock className="w-4 h-4 mr-2" />
            Solicitudes ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            <UserPlus className="w-4 h-4 mr-2" />
            Enviadas ({sentRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-6">
          {friends.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No tienes amigos aún</h3>
              <p className="text-muted-foreground mb-4">
                Busca cocineros arriba y envía solicitudes de amistad.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friendId) => (
                <div key={friendId} className="bg-card rounded-xl border p-4 flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                      {friendId.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">Usuario {friendId.slice(0, 8)}</p>
                    <Badge variant="secondary">Amigo</Badge>
                  </div>
                  <Button variant="ghost" size="sm">Ver perfil</Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No tienes solicitudes pendientes</h3>
              <p className="text-muted-foreground">
                Las solicitudes que recibas aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-card rounded-xl border p-4 flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                      {request.requesterId.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">Usuario {request.requesterId.slice(0, 8)}</p>
                    <Badge variant="outline">Pendiente</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={() => acceptFriendRequest(request.id)}
                    >
                      <Check className="w-4 h-4 text-green-500" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={() => rejectFriendRequest(request.id)}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          {sentRequests.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No has enviado solicitudes</h3>
              <p className="text-muted-foreground">
                Las solicitudes que envíes aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sentRequests.map((request) => (
                <div key={request.id} className="bg-card rounded-xl border p-4 flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                      {request.addresseeId.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">Usuario {request.addresseeId.slice(0, 8)}</p>
                    <Badge variant="outline">Enviada</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
