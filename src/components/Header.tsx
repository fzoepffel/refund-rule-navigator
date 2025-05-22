import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import check24logo from '../assets/image.png';

const Header = () => {
  return (
    <header
      className="text-white p-4 flex justify-between items-center"
      style={{
        background: '#022d94',
        position: 'sticky',
        top: 0,
        zIndex: 200,
        width: '100%',
      }}
    >
      <div className="flex items-center">
        <img src={check24logo} alt="check24 logo" width={400} height={400} />
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          <span className="hidden md:inline-block">089 - 2424 1168 300</span>
        </div>
        <Button variant="ghost" className="text-white">
          <span className="hidden md:inline-block mr-1">Frederic Zoepffel</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
