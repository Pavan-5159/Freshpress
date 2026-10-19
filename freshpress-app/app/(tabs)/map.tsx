import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TextInput, FlatList, TouchableOpacity, Dimensions, Platform, Modal } from 'react-native';
import { useLocationStore } from '@/store/locationStore';
import { useTheme } from '@/context/ThemeContext';
import { getNearbyShops, claimShop } from '@/services/shopService';

let MapboxGL: any = null;
if (Platform.OS !== 'web') {
  MapboxGL = require('@maplibre/maplibre-react-native').default;
  MapboxGL.setAccessToken(null);
}

interface Shop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  isClaimed: boolean;
  distance_km: number;
}

const { width } = Dimensions.get('window');

export default function MapScreen() {
  const { theme } = useTheme();
  const { currentLocation, isLoading, error, requestPermissionAndFetchLocation } = useLocationStore();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loadingShops, setLoadingShops] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    requestPermissionAndFetchLocation();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      fetchNearbyShops(currentLocation.coords.latitude, currentLocation.coords.longitude);
    }
  }, [currentLocation]);

  const fetchNearbyShops = async (lat: number, lng: number) => {
    setLoadingShops(true);
    try {
      const data = await getNearbyShops({ lat, lng, radius: 10 });
      setShops(data as any || []);
    } catch (err) {
      console.error('Failed to fetch nearby shops:', err);
    } finally {
      setLoadingShops(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      if (currentLocation) {
        fetchNearbyShops(currentLocation.coords.latitude, currentLocation.coords.longitude);
      }
      return;
    }
    
    setSearchLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        fetchNearbyShops(lat, lon);
      } else {
        alert('Location not found');
      }
    } catch (err) {
      console.error('Geocoding failed:', err);
      alert('Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!selectedShop) return;
    try {
      await claimShop(selectedShop.id);
      alert('Shop claimed successfully!');
      setShops(shops.map(s => s.id === selectedShop.id ? { ...s, isClaimed: true } : s));
      setSelectedShop({ ...selectedShop, isClaimed: true });
    } catch (err: any) {
      console.error('Claim failed:', err);
      alert(err.response?.data?.message || 'Failed to claim shop. Make sure you are logged in.');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.text, marginTop: 16 }}>Locating you...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.error }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentLocation ? (
        Platform.OS === 'web' || !MapboxGL ? (
          <View style={[styles.center, { backgroundColor: theme.bg }]}>
            <Text style={{ color: theme.text, textAlign: 'center', padding: 20 }}>
              Interactive maps are not supported on the web preview. Please use the iOS/Android app to see the map, or rely on the list below.
            </Text>
          </View>
        ) : (
          <MapboxGL.MapView
            style={styles.map}
            logoEnabled={false}
            attributionEnabled={false}
          >
            <MapboxGL.Camera
              zoomLevel={14}
              centerCoordinate={[currentLocation.coords.longitude, currentLocation.coords.latitude]}
            />

            <MapboxGL.RasterSource
              id="osm"
              tileUrlTemplates={['https://tile.openstreetmap.org/{z}/{x}/{y}.png']}
              tileSize={256}
            >
              <MapboxGL.RasterLayer id="osm-layer" sourceID="osm" />
            </MapboxGL.RasterSource>
            
            <MapboxGL.PointAnnotation
              key="user-location"
              id="user-location"
              coordinate={[currentLocation.coords.longitude, currentLocation.coords.latitude]}
            >
              <View style={[styles.userDot, { backgroundColor: '#4285F4' }]} />
            </MapboxGL.PointAnnotation>

            {shops.map((shop) => (
              <MapboxGL.PointAnnotation
                key={shop.id}
                id={shop.id}
                coordinate={[shop.lng, shop.lat]}
                onSelected={() => setSelectedShop(shop)}
              >
                <View style={[styles.markerDot, { backgroundColor: shop.isClaimed ? theme.primary : 'gray' }]} />
              </MapboxGL.PointAnnotation>
            ))}
          </MapboxGL.MapView>
        )
      ) : (
        <View style={[styles.center, { backgroundColor: theme.bg }]}>
          <Text style={{ color: theme.text }}>Waiting for location...</Text>
        </View>
      )}

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
        <TextInput
          style={[styles.searchInput, { color: theme.text, borderColor: theme.border }]}
          placeholder="Search location or shop name..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
      </View>
      
      {/* Loading overlay */}
      {(loadingShops || searchLoading) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={{ marginLeft: 8, color: '#333' }}>{searchLoading ? 'Searching...' : 'Finding nearby shops...'}</Text>
        </View>
      )}

      {/* Bottom List or Empty State */}
      <View style={styles.listContainer}>
        {shops.length > 0 ? (
          <FlatList
            horizontal
            data={shops}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.card,
                  { backgroundColor: theme.surface, borderColor: item.id === selectedShop?.id ? theme.primary : theme.border }
                ]}
                onPress={() => setSelectedShop(item)}
              >
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
                <Text style={{ color: theme.textMuted }}>{item.category || 'Shop'}</Text>
                <Text style={{ color: theme.primary, marginTop: 4 }}>{item.distance_km.toFixed(1)} km away</Text>
                {!item.isClaimed && <Text style={{ color: 'orange', fontSize: 10, marginTop: 2 }}>Unclaimed Listing</Text>}
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        ) : !loadingShops && (
          <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={{ color: theme.text, textAlign: 'center' }}>No shops found in this area. Try increasing radius or searching elsewhere.</Text>
          </View>
        )}
      </View>

      {/* Detail Modal */}
      <Modal visible={!!selectedShop} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.bg }]}>
            {selectedShop && (
              <>
                <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedShop.name}</Text>
                <Text style={{ color: theme.textMuted, marginBottom: 12 }}>{selectedShop.category || 'Shop'}</Text>
                
                <Text style={{ color: theme.text, marginBottom: 8 }}>Distance: {selectedShop.distance_km.toFixed(1)} km</Text>
                {!selectedShop.isClaimed && (
                  <View style={{ backgroundColor: '#fff3cd', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                    <Text style={{ color: '#856404' }}>This is an unclaimed OSM listing. Are you the owner?</Text>
                    <TouchableOpacity style={{ marginTop: 8 }} onPress={handleClaim}>
                      <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Claim this Shop</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity 
                  style={[styles.closeButton, { backgroundColor: theme.primary }]}
                  onPress={() => setSelectedShop(null)}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  listContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 120,
  },
  card: {
    width: width * 0.7,
    height: 100,
    marginRight: 12,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDot: {
    height: 16,
    width: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  markerDot: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  emptyCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 300,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
  }
});
