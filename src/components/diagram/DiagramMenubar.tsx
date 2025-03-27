
import React from 'react';
import { 
  Menubar, 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem, 
  MenubarSeparator, 
} from "@/components/ui/menubar";
import { Button } from "@/components/ui/button";
import { SquarePlus } from "lucide-react";

interface DiagramMenubarProps {
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  showDistances: boolean;
  setShowDistances: (show: boolean) => void;
  onAddEnclosure: () => void;
}

const DiagramMenubar: React.FC<DiagramMenubarProps> = ({ 
  showGrid, 
  setShowGrid, 
  showDistances, 
  setShowDistances,
  onAddEnclosure
}) => {
  return (
    <div className="flex justify-between items-center rounded-none border-b border-t-0 border-l-0 border-r-0 pr-4">
      <Menubar className="border-none">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
            <MenubarItem>Open</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Save</MenubarItem>
            <MenubarItem>Save As</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Export</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
            <MenubarItem>Redo</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Cut</MenubarItem>
            <MenubarItem>Copy</MenubarItem>
            <MenubarItem>Paste</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setShowGrid(!showGrid)}>
              {showGrid ? "Hide Grid" : "Show Grid"}
            </MenubarItem>
            <MenubarItem onClick={() => setShowDistances(!showDistances)}>
              {showDistances ? "Hide Distances" : "Show Distances"}
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onAddEnclosure}
        className="flex items-center gap-1"
      >
        <SquarePlus className="h-4 w-4" />
        Add Enclosure
      </Button>
    </div>
  );
};

export default DiagramMenubar;
