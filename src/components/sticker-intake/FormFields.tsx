
import AlbumSelector from "../sticker-form/AlbumSelector";
import StickerNumbersInput from "./StickerNumbersInput";
import SourceSelector from "./SourceSelector";
import ExchangePartnerSelector from "./ExchangePartnerSelector";
import OtherDetailsInput from "./OtherDetailsInput";
import ValidationError from "./ValidationError";

type SourceType = "exchange" | "pack" | "other";

interface FormFieldsProps {
  albumId: string;
  setAlbumId: (id: string) => void;
  stickerNumbers: string;
  setStickerNumbers: (numbers: string) => void;
  source: SourceType;
  setSource: (source: SourceType) => void;
  exchangePartner: string;
  setExchangePartner: (partner: string) => void;
  otherDetails: string;
  setOtherDetails: (details: string) => void;
  defaultExchangePartner?: string;
  validationError: string;
}

const FormFields = ({
  albumId,
  setAlbumId,
  stickerNumbers,
  setStickerNumbers,
  source,
  setSource,
  exchangePartner,
  setExchangePartner,
  otherDetails,
  setOtherDetails,
  defaultExchangePartner = "",
  validationError
}: FormFieldsProps) => {
  return (
    <>
      <AlbumSelector albumId={albumId} setAlbumId={setAlbumId} />
      
      <StickerNumbersInput 
        stickerNumbers={stickerNumbers} 
        setStickerNumbers={setStickerNumbers} 
      />

      <SourceSelector source={source} setSource={setSource} />

      {source === "exchange" && (
        <ExchangePartnerSelector 
          exchangePartner={exchangePartner} 
          setExchangePartner={setExchangePartner} 
          defaultPartner={defaultExchangePartner}
        />
      )}

      {source === "other" && (
        <OtherDetailsInput 
          otherDetails={otherDetails} 
          setOtherDetails={setOtherDetails} 
        />
      )}

      <ValidationError error={validationError} />
    </>
  );
};

export default FormFields;
