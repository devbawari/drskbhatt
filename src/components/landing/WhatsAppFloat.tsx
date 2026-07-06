'use client';

import React from 'react';
import './WhatsAppFloat.css';

export const WhatsAppIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.999 0C5.373 0 0 5.373 0 12c0 2.123.553 4.118 1.54 5.864L.033 24l6.305-1.636c1.688.92 3.614 1.444 5.661 1.444 6.626 0 11.999-5.373 11.999-12S18.625 0 11.999 0zm0 21.808c-1.84 0-3.581-.486-5.109-1.343l-.367-.206-3.793.985 1.012-3.682-.225-.371A9.74 9.74 0 0 1 2.191 12c0-5.412 4.405-9.808 9.808-9.808 5.403 0 9.808 4.396 9.808 9.808 0 5.412-4.405 9.808-9.808 9.808zm5.465-7.382c-.3-.15-1.774-.875-2.049-.975-.275-.1-.475-.15-.675.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.265-.465-2.409-1.485-.89-.795-1.49-1.775-1.665-2.075-.175-.3-.018-.462.132-.612.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.587-.492-.51-.675-.52-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5 0 1.475 1.075 2.9 1.225 3.1.15.2 2.116 3.23 5.128 4.532.717.31 1.277.495 1.715.634.72.23 1.375.198 1.892.12.578-.088 1.774-.725 2.024-1.425.25-.7.25-1.3.175-1.425-.075-.125-.275-.2-.575-.35z"/>
  </svg>
);

export default function WhatsAppFloat() {
  const whatsappNumber = "918808080088"; // +91 8808080088
  const defaultMessage = "Hello Dr. SK Bhatt, I would like to inquire about a homeopathic consultation.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Chat on WhatsApp with Dr. SK Bhatt"
    >
      <div className="whatsapp-tooltip">Chat with Doctor</div>
      <div className="whatsapp-icon-wrapper">
        <WhatsAppIcon size={32} />
      </div>
      <span className="whatsapp-pulse"></span>
    </a>
  );
}
