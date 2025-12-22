// hooks/useSignature.ts
import { useState, useEffect } from "react";
import { getSignatureBase64 } from "@/app/actions/getSignature";

export function useSignature(initialType: "basah" | "digital" | "none" = "none") {
  const [signatureType, setSignatureType] = useState<"basah" | "digital" | "none">(initialType);
  const [secureImage, setSecureImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignature = async () => {
      if (signatureType === "none") {
        setSecureImage(null);
        return;
      }
      try {
        const base64Data = await getSignatureBase64(signatureType);
        setSecureImage(base64Data);
      } catch (error) {
        console.error("Failed to load signature", error);
        setSecureImage(null);
      }
    };
    fetchSignature();
  }, [signatureType]);

  return { signatureType, setSignatureType, secureImage };
}