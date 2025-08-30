"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoaderIcon, LocateFixedIcon } from "lucide-react";
import { toast } from "sonner";

import type { LatLngTuple, Map as LeafletMap } from "leaflet";

const Geofencing = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 font-sans text-white">
      <div className="w-full max-w-4xl overflow-hidden rounded-lg border border-gray-700 shadow-2xl">
        <h1 className="bg-gray-800 p-4 text-3xl font-bold text-gray-100">
          Set a geofence:
        </h1>
        <MapView />
      </div>
    </div>
  );
};

export const MapView: React.FC = () => {
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
  const [patientLocation] = useState<LatLngTuple>([13.0827, 80.2707]);

  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // State for managing the confirmation dialog and the drawn shape
  const [showFinalize, setShowFinalize] = useState(false);
  const [latestGeoJSON, setLatestGeoJSON] = useState<any>(null);
  const lastLayerRef = useRef<any>(null);
  const drawnItemsRef = useRef<any>(null);

  useEffect(() => {
    let L: typeof import("leaflet");

    const initMap = async () => {
      // Dynamically import leaflet and leaflet-draw
      const leafletModule = await import("leaflet");
      await import("leaflet-draw");
      L = leafletModule;

      const leafletCss = document.createElement("link");
      leafletCss.rel = "stylesheet";
      leafletCss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(leafletCss);

      const leafletDrawCss = document.createElement("link");
      leafletDrawCss.rel = "stylesheet";
      leafletDrawCss.href =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css";
      document.head.appendChild(leafletDrawCss);

      if (mapContainerRef.current && !mapRef.current) {
        const map = L.map(mapContainerRef.current).setView(patientLocation, 13);
        mapRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        L.marker(patientLocation)
          .addTo(map)
          .bindPopup("<b>Patient Location</b>");

        const drawnItems = new L.FeatureGroup();
        drawnItemsRef.current = drawnItems;
        map.addLayer(drawnItems);

        const drawControl = new L.Control.Draw({
          edit: {
            featureGroup: drawnItems,
          },
          draw: {
            polyline: false,
            marker: false,
            circlemarker: false,
          },
        });
        map.addControl(drawControl);

        map.on("draw:created", (e: any) => {
          const layer = e.layer;
          if (lastLayerRef.current) {
            drawnItems.removeLayer(lastLayerRef.current);
          }
          drawnItems.addLayer(layer);
          lastLayerRef.current = layer;

          const geoJSON = layer.toGeoJSON();
          setLatestGeoJSON(geoJSON);
          setShowFinalize(true); // Show the confirmation card
        });
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [patientLocation]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      const msg = "Location services are not supported by your browser.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation: LatLngTuple = [latitude, longitude];
        setUserLocation(newLocation);

        if (mapRef.current) {
          mapRef.current.setView(newLocation, 13);
          import("leaflet").then((L) => {
            L.marker(newLocation)
              .addTo(mapRef.current!)
              .bindPopup("<b>Your location</b>")
              .openPopup();
          });
        }
        setIsLoading(false);
        toast.success("Location found!");
      },
      (err) => {
        setError(`Error getting location: ${err.message}`);
        toast.error(`Error: ${err.message}`);
        setIsLoading(false);
      },
    );
  };

  return (
    <>
      <div
        ref={mapContainerRef}
        style={{ height: "60vh", width: "100%", backgroundColor: "#1a1a1a" }}
      />
      <div className="flex w-full flex-col items-center justify-between bg-gray-800 p-4 sm:flex-row">
        <p className="mb-2 text-sm text-gray-400 sm:mb-0">
          Draw a circle, polygon, or rectangle on the map.
        </p>
        <Button
          onClick={handleGetLocation}
          disabled={isLoading}
          className="flex transform items-center gap-2 rounded-lg px-6 py-3 font-bold transition duration-300 ease-in-out disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <LoaderIcon className="animate-spin" />
          ) : (
            <>
              <LocateFixedIcon />
            </>
          )}
        </Button>
      </div>
      {error && (
        <p className="text-destructive w-full bg-gray-800 p-4 text-center">
          {error}
        </p>
      )}

      {showFinalize && (
        <ConfirmShapeCard
          onConfirm={() => {
            // console.log("Geofence confirmed:", latestGeoJSON); 
            toast.success("Geofence saved!");
            setShowFinalize(false);
            // Use router push to send to next page in flow.
          }}
          onCancel={() => {
            if (drawnItemsRef.current && lastLayerRef.current) {
              drawnItemsRef.current.removeLayer(lastLayerRef.current);
              lastLayerRef.current = null;
            }
            toast.error("Geofence discarded");
            setShowFinalize(false);
          }}
        />
      )}
    </>
  );
};

interface ConfirmShapeCardProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmShapeCard: React.FC<ConfirmShapeCardProps> = ({
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="w-full border-t p-4">
      <div className="mx-auto flex max-w-full flex-col items-center justify-between sm:flex-row">
        <p className="mb-3 font-semibold text-white sm:mr-4 sm:mb-0">
          Finalize this shape as the geofence?
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={onCancel}
            className="bg-destructive"
          >
            No, Discard
          </Button>
          <Button onClick={onConfirm} className="">
            Yes, Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return <Geofencing />;
}
