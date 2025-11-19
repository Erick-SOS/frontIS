// src/app/[locale]/fixer/profile/page.tsx
'use client';

import { FixerProfile } from "@/Components/Fixer-profile";
import FixerMap from "@/Components/Job-offers/maps/FixerMap";
import FixerGraficCard from "@/Components/fixer/Fixer-grafic-card";
import { useGetFixerByIdQuery, useGetJobsByFixerQuery } from "@/app/redux/services/fixerApi";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/app/redux/hooks";
import { useEffect, useState } from "react";
import type { Fixer } from "@/types/fixer-component";
import type { JobOffer, Location } from "@/types/job-offer";
import { MapPin } from "lucide-react";

export default function FixerProfilePage() {
  const params = useParams();
  const fixerId = (params.id as string) || "691646c477c99dee64b21689";

  const { data: fixerProfile, isLoading: loadingFixer, error: errorFixer } = useGetFixerByIdQuery(fixerId);
  const { data: jobOffers = [], isLoading: loadingJobs } = useGetJobsByFixerQuery(fixerId);

  const userFromStore = useAppSelector((state) => state.user.user);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (userFromStore?.id === fixerId) setIsOwner(true);
  }, [userFromStore, fixerId]);

  if (loadingFixer || loadingJobs) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white rounded-2xl shadow-lg animate-pulse p-10">
          <div className="h-8 bg-gray-300 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (errorFixer || !fixerProfile) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <p className="text-red-600 text-xl font-medium">Error al cargar el perfil</p>
      </div>
    );
  }

  // Estadísticas reales
  const completedJobs = jobOffers.filter(j => j.status === 'completed').length;
  const cancelledJobs = jobOffers.filter(j => j.status === 'cancelled').length;

  const formatService = (svc: { id: string; name: string }) => svc.name;
  const formatPayment = (pay: { type: string }) => {
    const map: Record<string, string> = { cash: 'Efectivo', transfer: 'Transferencia', qr: 'Código QR' };
    return map[pay.type] || pay.type[0].toUpperCase() + pay.type.slice(1);
  };

  const getAddress = (location?: Location) => location?.address || "Zona no especificada";

  const formattedFixer: Fixer = {
    id: fixerProfile.user.id,
    name: fixerProfile.user.name,
    email: fixerProfile.user.email,
    phone: fixerProfile.user.phone,
    photo: fixerProfile.profile.photoUrl || "/placeholder-user.jpg",
    city: "Cochabamba",
    rating: 4.8,
    completedJobs,
    services: fixerProfile.profile.services.map(formatService),
    bio: fixerProfile.profile.additionalInfo?.bio || "Técnico con experiencia en reparaciones del hogar.",
    joinDate: fixerProfile.profile.createdAt
      ? new Date(fixerProfile.profile.createdAt).toISOString().split('T')[0]
      : "2024-01-01",
    jobOffers: jobOffers.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      services: job.services,
      price: job.price,
      createdAt: new Date(job.createdAt),
      city: job.city,
      rating: 4.8,
      completedJobs: 5, // Puedes calcularlo por fixer si tienes datos
      location: {
        lat: job.location?.lat ?? -17.3935,
        lng: job.location?.lng ?? -66.1468,
        address: getAddress(job.location),
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

  const hasLocation = fixerProfile.profile.location?.lat && fixerProfile.profile.location?.lng;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Perfil principal */}
      <div className="max-w-5xl mx-auto px-6 pt-12">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <FixerProfile fixer={formattedFixer} isOwner={isOwner} />
        </div>
      </div>

      {/* Tarjetas adicionales */}
      <div className="max-w-5xl mx-auto px-6 mt-12 space-y-12">

        {/* Mapa */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <MapPin className="w-8 h-8 text-blue-600" />
              Zona de Trabajo
            </h3>
            <p className="text-gray-600 mt-2">
              {hasLocation
                ? `${fixerProfile.user.name} presta servicios en esta zona de Cochabamba`
                : "Este fixer aún no ha definido su área de cobertura"}
            </p>
          </div>

          <div className="h-96 md:h-[500px]">
            {hasLocation ? (
              <FixerMap
                lat={fixerProfile.profile.location!.lat}
                lng={fixerProfile.profile.location!.lng}
                name={fixerProfile.user.name}
                photoUrl={fixerProfile.profile.photoUrl}
              />
            ) : (
              <div className="h-full bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-500">Ubicación no disponible</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico */}
        <FixerGraficCard completedJobs={completedJobs} cancelledJobs={cancelledJobs} />

      </div>
    </div>
  );
}