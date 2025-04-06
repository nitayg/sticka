
import { ImportProgressIndicator } from "../excel-import/ImportProgressIndicator";

interface ImportProgressProps {
  value: number;
  status?: "importing" | "complete" | "error";
}

export const ImportProgress = ({ value, status = "importing" }: ImportProgressProps) => {
  return (
    <div className="my-4">
      <ImportProgressIndicator value={value} status={status} />
    </div>
  );
};
