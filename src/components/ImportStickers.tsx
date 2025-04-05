
import { CSVImportDialog } from "./csv-import/CSVImportDialog";

interface ImportStickersProps {
  albumId: string;
  onImportComplete: () => void;
}

const ImportStickers = ({ albumId, onImportComplete }: ImportStickersProps) => {
  return <CSVImportDialog albumId={albumId} onImportComplete={onImportComplete} />;
};

export default ImportStickers;
