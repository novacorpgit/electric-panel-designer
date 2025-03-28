
import React from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarProvider, 
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { Database, Cable, Plug, ToggleLeft, Server, CircuitBoard } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DesignerSidebarProps {
  paletteRefs: {
    circuitBreakers: React.RefObject<HTMLDivElement>;
    transformers: React.RefObject<HTMLDivElement>;
    busbars: React.RefObject<HTMLDivElement>;
    switches: React.RefObject<HTMLDivElement>;
  };
}

const DesignerSidebar: React.FC<DesignerSidebarProps> = ({ paletteRefs }) => {
  return (
    <Sidebar variant="sidebar" className="border-r min-h-screen bg-slate-50 shadow-md">
      <SidebarHeader className="flex flex-col gap-2 p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-xl font-bold flex items-center gap-2 text-blue-700">
          <CircuitBoard className="w-5 h-5" />
          <span>Components</span>
        </h2>
        <p className="text-sm text-blue-600/70">
          Drag components to design
        </p>
      </SidebarHeader>
      <SidebarContent className="p-0 overflow-visible">
        <ScrollArea className="h-[calc(100vh-120px)]">
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 py-3 bg-orange-50 text-orange-700 flex items-center font-medium">
              <Server className="w-4 h-4 mr-2" />
              Circuit Breakers
            </SidebarGroupLabel>
            <SidebarGroupContent className="max-h-none">
              <div className="p-4 grid grid-cols-2 gap-3 bg-orange-50/30" ref={paletteRefs.circuitBreakers}></div>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 py-3 bg-purple-50 text-purple-700 flex items-center font-medium">
              <Cable className="w-4 h-4 mr-2" />
              Transformers
            </SidebarGroupLabel>
            <SidebarGroupContent className="max-h-none">
              <div className="p-4 grid grid-cols-2 gap-3 bg-purple-50/30" ref={paletteRefs.transformers}></div>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 py-3 bg-blue-50 text-blue-700 flex items-center font-medium">
              <Plug className="w-4 h-4 mr-2" />
              Busbars
            </SidebarGroupLabel>
            <SidebarGroupContent className="max-h-none">
              <div className="p-4 grid grid-cols-2 gap-3 bg-blue-50/30" ref={paletteRefs.busbars}></div>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 py-3 bg-pink-50 text-pink-700 flex items-center font-medium">
              <ToggleLeft className="w-4 h-4 mr-2" />
              Switches
            </SidebarGroupLabel>
            <SidebarGroupContent className="max-h-none">
              <div className="p-4 grid grid-cols-2 gap-3 bg-pink-50/30" ref={paletteRefs.switches}></div>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
};

export default DesignerSidebar;
