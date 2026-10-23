"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { regionsApi } from "../../lib/api/regions";
import { RegionOption } from "../../types/api";

export interface RegionValue {
  provinceCode: string;
  cityCode: string;
  districtCode: string;
}

interface RegionCascadeProps {
  value: RegionValue;
  onChange: (value: RegionValue) => void;
  className?: string;
}

export function RegionCascade({ value, onChange, className }: RegionCascadeProps) {
  const [provinces, setProvinces] = useState<RegionOption[]>([]);
  const [cities, setCities] = useState<RegionOption[]>([]);
  const [districts, setDistricts] = useState<RegionOption[]>([]);

  useEffect(() => {
    regionsApi.getProvinces().then(setProvinces).catch(() => {});
  }, []);

  useEffect(() => {
    if (!value.provinceCode) return;
    regionsApi.getCities(value.provinceCode).then(setCities).catch(() => {});
  }, [value.provinceCode]);

  useEffect(() => {
    if (!value.cityCode) return;
    regionsApi.getDistricts(value.cityCode).then(setDistricts).catch(() => {});
  }, [value.cityCode]);

  const handleProvince = (v: string | null) => {
    setCities([]);
    setDistricts([]);
    onChange({ provinceCode: !v || v === "ALL" ? "" : v, cityCode: "", districtCode: "" });
  };

  const handleCity = (v: string | null) => {
    setDistricts([]);
    onChange({ ...value, cityCode: !v || v === "ALL" ? "" : v, districtCode: "" });
  };

  const handleDistrict = (v: string | null) =>
    onChange({ ...value, districtCode: !v || v === "ALL" ? "" : v });

  const provinceItems: Record<string, string> = {
    ALL: "Semua Provinsi",
    ...Object.fromEntries(provinces.map((p) => [p.code, p.name])),
  };
  const cityItems: Record<string, string> = {
    ALL: "Semua Kab/Kota",
    ...Object.fromEntries(cities.map((c) => [c.code, c.name])),
  };
  const districtItems: Record<string, string> = {
    ALL: "Semua Kecamatan",
    ...Object.fromEntries(districts.map((d) => [d.code, d.name])),
  };

  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="w-full md:w-[190px]">
          <Select
            value={value.provinceCode || "ALL"}
            onValueChange={handleProvince}
            items={provinceItems}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Provinsi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Provinsi</SelectItem>
              {provinces.map((p) => (
                <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-[190px]">
          <Select
            value={value.cityCode || "ALL"}
            onValueChange={handleCity}
            items={cityItems}
            disabled={!value.provinceCode}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Kab/Kota" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kab/Kota</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-[190px]">
          <Select
            value={value.districtCode || "ALL"}
            onValueChange={handleDistrict}
            items={districtItems}
            disabled={!value.cityCode}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Kecamatan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kecamatan</SelectItem>
              {districts.map((d) => (
                <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
