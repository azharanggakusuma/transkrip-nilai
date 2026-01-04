import { useState, useEffect } from "react";
import { getSignatureBase64 } from "@/app/actions/getSignature";

export function useSignature(initialType: "basah" | "digital" | "none" = "none") {
  const [signatureType, setSignatureType] = useState<"basah" | "digital" | "none">(initialType);
  const [secureImage, setSecureImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSignature = async () => {
      if (signatureType === "none") {
        setSecureImage(null);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const base64Data = await getSignatureBase64(signatureType);
        setSecureImage(base64Data);
      } catch (error) {
        console.error("Failed to load signature", error);
        setSecureImage(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSignature();
  }, [signatureType]);

  return { signatureType, setSignatureType, secureImage, isLoading };
}