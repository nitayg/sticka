
import { ClipboardCopy, Copy, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReportDropdownMenuProps {
  icon: LucideIcon;
  label: string;
  tooltipText: string;
  onCopyNumbers: () => void;
  onCopyNamesAndNumbers: () => void;
  disabled?: boolean;
}

const ReportDropdownMenu = ({
  icon: Icon,
  label,
  tooltipText,
  onCopyNumbers,
  onCopyNamesAndNumbers,
  disabled = false
}: ReportDropdownMenuProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="flex gap-1.5"
                disabled={disabled}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="sr-only md:not-sr-only md:inline-block">{label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onCopyNumbers}>
                <ClipboardCopy className="h-4 w-4 ml-2" />
                העתק מספרים (1, 2, 3)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCopyNamesAndNumbers}>
                <Copy className="h-4 w-4 ml-2" />
                העתק מספרים ושמות
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ReportDropdownMenu;
