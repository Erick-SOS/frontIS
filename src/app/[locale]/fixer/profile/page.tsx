'use client';
import { FixerProfile } from "@/Components/Fixer-profile";
import { useGetFixerByIdQuery, useGetJobsByFixerQuery } from "@/app/redux/services/fixerApi";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/app/redux/hooks";
import { useEffect, useState } from "react";
import type { Fixer } from "@/types/fixer-component";
import type { JobOffer, Location } from "@/types/job-offer"; // ← Quitamos IUserProfile, agregamos Location

export default function FixerProfilePage() {
  const params = useParams();
  const fixerId =   "691646c477c99dee64b21689";
  const { data: fixerProfile, isLoading: loadingFixer, error: errorFixer } = useGetFixerByIdQuery(fixerId);
  const { data: jobOffers = [], isLoading: loadingJobs } = useGetJobsByFixerQuery(fixerId);

  const userFromStore = useAppSelector((state) => state.user.user);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (userFromStore?.id === fixerId) {
      setIsOwner(true);
    }
  }, [userFromStore, fixerId]);

  // Esqueleto de carga
  if (loadingFixer || loadingJobs) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-white/20"></div>
              <div className="space-y-3">
                <div className="h-8 bg-white/30 rounded w-48"></div>
                <div className="h-5 bg-white/20 rounded w-32"></div>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (errorFixer || !fixerProfile) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 text-center">
        <p className="text-red-600">Error al cargar el perfil del fixer</p>
      </div>
    );
  }

  const formatService = (svc: { id: string; name: string }) => {
    return svc.name;
  };

  const formatPayment = (pay: { type: string }) => {
    const map: Record<string, string> = {
      cash: 'Efectivo',
      transfer: 'Transferencia',
      qr: 'Código QR',
    };
    return map[pay.type] || pay.type.charAt(0).toUpperCase() + pay.type.slice(1);
  };

  // Eliminamos el any – ahora usamos el tipo Location (puede ser undefined)
  const getAddress = (location?: Location): string => {
    return location?.address || "Dirección no disponible";
  };

  const formattedFixer: Fixer = {
    id: fixerProfile.user.id,
    name: fixerProfile.user.name,
    email: fixerProfile.user.email,
    phone: fixerProfile.user.phone,
    photo: fixerProfile.profile.photoUrl || "/placeholder-user.jpg",
    city: "Cochabamba",
    rating: 4.7,
    completedJobs: 0,
    services: fixerProfile.profile.services.map(formatService),
    bio: fixerProfile.profile.additionalInfo?.bio || "Técnico con experiencia en reparaciones del hogar.",
    joinDate: fixerProfile.profile.createdAt
      ? new Date(fixerProfile.profile.createdAt).toISOString().split('T')[0]
      : "2024-01-01",
    location: fixerProfile.profile.location
      ? {
          lat: fixerProfile.profile.location.lat,
          lng: fixerProfile.profile.location.lng,
          address: getAddress(fixerProfile.profile.location as Location),
        }
      : null,
    jobOffers: jobOffers.map((job: JobOffer) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      services: job.services,
      price: job.price,
      createdAt: new Date(job.createdAt),
      city: job.city,
      rating: 4.8,
      completedJobs: 5,
      location: {
        lat: job.location?.lat ?? -17.3935,
        lng: job.location?.lng ?? -66.1468,
        address: getAddress(job.location), // Ahora usa el location real cuando exista
      },
      fixerId: job.fixerId,
      fixerName: job.fixerName,
      tags: job.tags,
      whatsapp: job.whatsapp,
      photos: job.photos,
    })),
    paymentMethods: fixerProfile.profile.paymentMethods.map(formatPayment),
    whatsapp: fixerProfile.user.phone.replace(/\D/g, '').slice(3),
  };

  return <FixerProfile fixer={formattedFixer} isOwner={isOwner} />;
}