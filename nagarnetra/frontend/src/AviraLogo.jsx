import React from 'react';

export default function AviraLogo({ className = "", style = {}, showText = true }) {
  // If the user specifies showText=false, we might still just show the full logo
  // since the supplied logo contains the text, but we'll try to crop or just rely on the image as provided.
  // The prompt says: "Do NOT type "AVIRA" beside a separately recreated icon if the supplied image already contains the complete logo. Use the image as the source of truth."
  
  return (
    <img 
      src="/avira-logo.png" 
      alt="AVIRA Logo" 
      className={`avira-logo ${className}`} 
      style={{ height: '32px', width: 'auto', display: 'block', ...style }} 
    />
  );
}
