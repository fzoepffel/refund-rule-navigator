
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, UserCircle, Store, Settings } from 'lucide-react';

const Index = () => {
  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">CHECK24 MÖBEL</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Merchant Center</span>
          <span className="text-sm font-medium">Frederic Zoepffel</span>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Merchant Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              <span>Merchants</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Verwalten Sie Merchants und deren Einstellungen
            </p>
            <div className="space-y-2">
              <Link to="/merchant-rules">
                <Button variant="outline" className="w-full justify-start">
                  Lülecci #BWVP <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">NEU</span>
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                Beispiel Merchant #1234
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Beispiel Merchant #5678
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Orders Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <span>Bestellungen</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Aufträge und Bestellungen verwalten
            </p>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Alle Bestellungen
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Offene Bestellungen
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Retourenmanagement
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Settings Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <span>Einstellungen</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Systemeinstellungen und Präferenzen
            </p>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Benutzerprofil
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Benachrichtigungen
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Sicherheit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
