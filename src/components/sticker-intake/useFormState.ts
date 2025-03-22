
import { useState } from "react";

type SourceType = "exchange" | "pack" | "other";

export function useFormState(defaultStickerNumbers = "", defaultExchangePartner = "") {
  const [stickerNumbers, setStickerNumbers] = useState(defaultStickerNumbers);
  const [source, setSource] = useState<SourceType>("pack");
  const [exchangePartner, setExchangePartner] = useState(defaultExchangePartner);
  const [otherDetails, setOtherDetails] = useState("");
  const [albumId, setAlbumId] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setStickerNumbers("");
    setSource("pack");
    setExchangePartner("");
    setOtherDetails("");
    setValidationError("");
    setIsSubmitting(false);
  };

  return {
    stickerNumbers, setStickerNumbers,
    source, setSource,
    exchangePartner, setExchangePartner,
    otherDetails, setOtherDetails,
    albumId, setAlbumId,
    validationError, setValidationError,
    isSubmitting, setIsSubmitting,
    resetForm
  };
}
