import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

export default function App() {
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [pickLocation, setPickLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [pickLocationName, setPickLocationName] = useState('');
  const [dropLocationName, setDropLocationName] = useState('');
  const [locationPermissionError, setLocationPermissionError] = useState(false);

  useEffect(() => {
    (async () => {
      // Request permission to access device location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        setLocationPermissionError(true);
        return;
      }

      // Get user's current location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setRegion((prevRegion) => ({ ...prevRegion, latitude, longitude }));
      setPickLocation({ latitude, longitude });

      // Fetch and set initial location name
      fetchLocationName(latitude, longitude, setPickLocationName);
    })();
  }, []);

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setDropLocation({ latitude, longitude });

    // Update route coordinates for Polyline
    setRouteCoordinates([
      { latitude: pickLocation.latitude, longitude: pickLocation.longitude },
      { latitude, longitude },
    ]);

    // Fetch and set drop location name
    fetchLocationName(latitude, longitude, setDropLocationName);
  };

  const fetchLocationName = async (latitude, longitude, setName) => {
    const apiKey = 'a72b916186msh64ee2a800850d3fp16f482jsnfcf10161d7c2';
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.results.length > 0) {
        const locationName = data.results[0].formatted_address;
        setName(locationName);
      } else {
        setName('');
      }
    } catch (error) {
      console.error('Error fetching location name:', error);
    }
  };

  const openChat = () => {
    // Add the logic for opening the chat here
    console.log('Opening chat...');
  };

  return (
    <View style={styles.container}>
      {locationPermissionError && (
        <Text style={styles.errorText}>Location permission is required. Please enable it in your device settings.</Text>
      )}
      <MapView style={styles.map} region={region} onPress={handleMapPress}>
        {pickLocation && (
          <Marker coordinate={pickLocation} title={`Picked Location\n${pickLocationName}`} pinColor="blue" />
        )}
        {dropLocation && (
          <Marker coordinate={dropLocation} title={`Dropped Location\n${dropLocationName}`} pinColor="red" />
        )}
        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#FF0000" // route line color
            strokeWidth={2}
          />
        )}
      </MapView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.chatButton} onPress={openChat}>
          <Text style={styles.buttonText}>Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  chatButton: {
    backgroundColor: 'green',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    padding: 16,
  },
});
