"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
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

  const buildIcon = (count: number) => {
    // Ukuran lingkaran selalu sama agar titik dengan jumlah besar tidak
    // menutupi titik wilayah lain. Hanya ukuran font yang menyesuaikan.
    const size = 34;
    const digits = String(count).length;
    const fontSize = digits >= 5 ? 8 : digits === 4 ? 9 : 11;
    return L.divIcon({
      className: "",
      html: `<div style="background:#2D7A4F;color:#FFFFFF;border-radius:9999px;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-size:${fontSize}px;font-weight:700;line-height:1;border:2px solid #FFFFFF;box-shadow:0 1px 4px rgba(0,0,0,.4)">${count}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

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
                <Marker
                  key={p.code}
                  position={[p.latitude as number, p.longitude as number]}
                  icon={buildIcon(p.count)}
                >
                  <Popup>
                    <div className="min-w-[190px] space-y-1 text-xs">
                      <div className="font-semibold text-foreground">
                        Kecamatan {p.districtName || p.name}
                      </div>
                      <div className="text-muted-foreground">
                        {[p.cityName, p.provinceName].filter(Boolean).join(", ")}
                      </div>
                      <div className="font-medium text-foreground">
                        {p.count} peserta
                      </div>
                      {p.villages && p.villages.length > 0 && (
                        <div className="border-t border-border pt-1">
                          <div className="mb-1 font-medium text-foreground">
                            Kelurahan/Desa:
                          </div>
                          <ul className="max-h-32 space-y-0.5 overflow-y-auto">
                            {p.villages.map((village) => (
                              <li
                                key={village.code}
                                className="flex items-center justify-between gap-3"
                              >
                                <span className="text-muted-foreground">{village.name}</span>
                                <span className="shrink-0 font-medium text-foreground">
                                  {village.count}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
        <p className="mt-2 text-[10px] text-muted-foreground">
          Angka pada titik = jumlah peserta di kecamatan tersebut. Ukuran lingkaran
          seragam agar tidak menutupi wilayah lain. Klik angka untuk melihat
          kecamatan, kabupaten/kota, provinsi, dan rincian kelurahan/desa. Titik
          berdasarkan centroid kecamatan (sebagian perkiraan).
        </p>
      </CardContent>
    </Card>
  );
}
