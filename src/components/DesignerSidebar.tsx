
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
import { Database, Cable, Plug, Switch, Server } from 'lucide-react';

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
    <Sidebar variant="sidebar" className="border-r min-h-screen">
      <SidebarHeader className="flex flex-col gap-2 p-4 border-b">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Database className="w-5 h-5" />
          <span>Electrical Components</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Drag components to the design canvas
        </p>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2">
            Circuit Breakers
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="p-2" ref={paletteRefs.circuitBreakers}></div>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2">
            <Cable className="mr-2" />
            Transformers
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="p-2" ref={paletteRefs.transformers}></div>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2">
            <Plug className="mr-2" />
            Busbars
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="p-2" ref={paletteRefs.busbars}></div>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2">
            <Switch className="mr-2" />
            Switches
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="p-2" ref={paletteRefs.switches}></div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DesignerSidebar;
