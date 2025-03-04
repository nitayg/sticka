
import { Sticker } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

type ReportFormat = 'numbers' | 'names';

export interface ReportOptions {
  stickers: Sticker[];
  format: ReportFormat;
  filterFn: (sticker: Sticker) => boolean;
  successTitle: string;
  successDescription: (count: number) => string;
  emptyTitle: string;
  emptyDescription: string;
}

export const generateAndCopyReport = (options: ReportOptions) => {
  const { toast } = useToast();
  const { 
    stickers, 
    format, 
    filterFn, 
    successTitle, 
    successDescription,
    emptyTitle,
    emptyDescription
  } = options;
  
  const filteredStickers = stickers.filter(filterFn);
  
  let clipboardText = '';
  
  if (format === 'numbers') {
    clipboardText = filteredStickers.map(s => s.number).join(', ');
  } else {
    clipboardText = filteredStickers.map(s => {
      const duplicateInfo = s.duplicateCount && s.duplicateCount > 0 
        ? ` (${s.duplicateCount} כפולים)` 
        : '';
      return `${s.number} - ${s.name || 'ללא שם'}${duplicateInfo}`;
    }).join('\n');
  }
  
  if (clipboardText) {
    navigator.clipboard.writeText(clipboardText);
    toast({
      title: successTitle,
      description: successDescription(filteredStickers.length),
    });
  } else {
    toast({
      title: emptyTitle,
      description: emptyDescription,
    });
  }
};
