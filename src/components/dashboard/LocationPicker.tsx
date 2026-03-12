"use client";

import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
if (typeof window !== 'undefined') {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

interface LocationPickerProps {
    onLocationSelect: (lat: number, lng: number, address: string) => void;
    initialLat?: number;
    initialLng?: number;
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export default function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
    const defaultCenter: [number, number] = [20.5937, 78.9629]; // Center of India
    const [position, setPosition] = useState<[number, number]>(
        initialLat && initialLng ? [initialLat, initialLng] : defaultCenter
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);

    const markerEvents = useMemo(() => ({
        dragend(e: any) {
            const marker = e.target;
            const pos = marker.getLatLng();
            setPosition([pos.lat, pos.lng]);
            reverseGeocode(pos.lat, pos.lng);
        },
    }), [onLocationSelect]);

    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data.display_name) {
                onLocationSelect(lat, lng, data.display_name);
            }
        } catch (err) {
            console.error("Reverse geocoding error:", err);
            onLocationSelect(lat, lng, "");
        }
    };

    const handleSearch = async () => {
        if (!searchQuery) return;
        setSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
            const data = await res.json();
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)];
                setPosition(newPos);
                onLocationSelect(parseFloat(lat), parseFloat(lon), display_name);
            }
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearch();
                        }
                    }}
                    placeholder="Search location (e.g. Noida Sector 62)"
                    className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 text-sm"
                />
                <button
                    type="button"
                    onClick={handleSearch}
                    disabled={searching}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase disabled:opacity-50"
                >
                    {searching ? '...' : 'Search'}
                </button>
            </div>

            <div className="h-[300px] w-full rounded-2xl overflow-hidden border-2 border-slate-100 z-0 relative">
                <MapContainer center={position} zoom={initialLat ? 15 : 5} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker
                        position={position}
                        draggable={true}
                        eventHandlers={markerEvents}
                    />
                    <MapUpdater center={position} />
                </MapContainer>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                Drag the marker to pinpoint exact location
            </p>
        </div>
    );
}
