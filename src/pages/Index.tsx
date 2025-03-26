
import React from 'react';
import PanelboardDesigner from '../components/PanelboardDesigner';
import { Database } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto py-4 px-4 flex items-center">
          <Database className="h-6 w-6 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Electrical Enclosure Designer</h1>
        </div>
      </header>
      
      <main className="h-[calc(100vh-4rem)]">
        <PanelboardDesigner />
      </main>
    </div>
  );
};

export default Index;
