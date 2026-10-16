"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { customersApi } from "../../lib/api/customers";
import { RegionDistribution } from "../../types/api";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

interface RegionMapProps {
  campusId: number | null;
}

const INDONESIA_CENTER: [number, number] = [-2.5, 118];
const INDONESIA_ZOOM = 5;

export function RegionMap({ campusId }: RegionMapProps) {
  const [points, setPoints] = useState<RegionDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params = campusId ? { campusId } : undefined;
        const result = await customersApi.getDistribution("district", params);
        setPoints(result.filter((r) => r.latitude != null && r.longitude != null));
      } catch (error) {
        console.error("Failed to fetch region map data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [campusId]);

  const maxCount = points.reduce((max, p) => Math.max(max, p.count), 1);

  return (
    <Card className="border-primary/10 shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Peta Sebaran Domisili (per Kecamatan)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[380px] w-full rounded-xl" />
        ) : points.length === 0 ? (
          <div className="flex justify-center items-center h-[380px] text-muted-foreground text-sm">
            Belum ada data domisili peserta
          </div>
        ) : (
          <div className="h-[380px] w-full rounded-xl overflow-hidden border">
            <MapContainer
              center={INDONESIA_CENTER}
              zoom={INDONESIA_ZOOM}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {points.map((p) => (
                <CircleMarker
                  key={p.code}
                  center={[p.latitude as number, p.longitude as number]}
                  radius={6 + (p.count / maxCount) * 22}
                  pathOptions={{
                    color: "#2D7A4F",
                    fillColor: "#2D7A4F",
                    fillOpacity: 0.45,
                    weight: 1,
                  }}
                >
                  <Popup>
                    <div className="text-xs">
                      <strong>{p.name}</strong>
                      <br />
                      {p.count} peserta
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        )}
        <p className="mt-2 text-[10px] text-muted-foreground">
          Titik berdasarkan centroid kecamatan (sebagian perkiraan). Ukuran lingkaran proporsional jumlah peserta.
        </p>
      </CardContent>
    </Card>
  );
}
