"use client";

import { MessageCircle } from "lucide-react";
import { buildStoreWhatsappUrl } from "@/config/store";

const whatsappMessage =
  "Hola, quiero recibir informacion sobre los productos de Moda Selecta.";

export function WhatsappFloatingButton() {
  return (
    <a
      href={buildStoreWhatsappUrl(whatsappMessage)}
      target="_blank"
      rel="noreferrer"
      aria-label="Escribir por WhatsApp"
      // En movil sube para no tapar las barras de compra y filtros de abajo.
      className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lift transition-transform duration-200 hover:scale-105 md:bottom-6 md:right-6"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
