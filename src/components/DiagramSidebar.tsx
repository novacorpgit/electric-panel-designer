
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { 
  Server, 
  Database, 
  Cable, 
  Plug, 
  ToggleLeft, 
  CircuitBoard, 
  Ruler,
  Square,
  Grid3X3
} from 'lucide-react';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';

interface DiagramSidebarProps {
  allowTopLevel: boolean;
  setAllowTopLevel: (allow: boolean) => void;
  showDistances: boolean;
  setShowDistances: (show: boolean) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
}

const DiagramSidebar: React.FC<DiagramSidebarProps> = ({
  allowTopLevel,
  setAllowTopLevel,
  showDistances,
  setShowDistances,
  showGrid,
  setShowGrid
}) => {
  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-lg font-bold">Components</h2>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarGroup>
            <SidebarGroupLabel>Circuit Breakers</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                    <CircuitBoard className="h-5 w-5 text-gray-500" />
                    <span>NSX250</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                    <CircuitBoard className="h-5 w-5 text-gray-500" />
                    <span>Schneider 250A</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Power Components</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                    <Plug className="h-5 w-5 text-gray-500" />
                    <span>Busbar</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                    <ToggleLeft className="h-5 w-5 text-gray-500" />
                    <span>Circuit Breaker</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                    <Cable className="h-5 w-5 text-gray-500" />
                    <span>Transformer</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Controls</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-4 p-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowTopLevel"
                    checked={allowTopLevel}
                    onCheckedChange={(checked) => setAllowTopLevel(!!checked)}
                  />
                  <label
                    htmlFor="allowTopLevel"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Allow Top-Level Placement
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showDistances"
                    checked={showDistances}
                    onCheckedChange={setShowDistances}
                  />
                  <label
                    htmlFor="showDistances"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <Ruler className="h-4 w-4 inline mr-1" />
                    Show Distances
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showGrid"
                    checked={showGrid}
                    onCheckedChange={setShowGrid}
                  />
                  <label
                    htmlFor="showGrid"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <Grid3X3 className="h-4 w-4 inline mr-1" />
                    Show Grid
                  </label>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
};

export default DiagramSidebar;
