import React from 'react';
import {
  Home,
  Settings,
  ShoppingBag,
  CreditCard,
  ChevronRight,
  HelpCircle,
  Truck,
  FileText,
  MessageSquare,
  User,
  Package,
  Share2,
  Store
} from 'lucide-react';
import { Box, NavLink, ScrollArea } from '@mantine/core';

const navItems = [
  { label: 'Dashboard', icon: Home },
  { label: 'Bestellungen', icon: ShoppingBag },
  { label: 'Angebote', icon: Package, hasSubmenu: true },
  { label: 'Finanzen', icon: CreditCard, hasSubmenu: true },
  {
    label: 'Einstellungen',
    icon: Settings,
    hasSubmenu: true,
    active: true,
    submenu: [
      { label: 'Geschäftsdaten' },
      { label: 'Bankdaten' },
      { label: 'Kommunikation' },
      { label: 'Logistikdaten' },
      { label: 'Versicherungen' },
      { label: 'Versand' },
      { label: 'Rücksendung' },
      { label: 'Preisnachlassregeln', active: true },
      { label: 'Angerichtsfreiheit' },
      { label: 'Beschichtsmitteilung' },
      { label: 'Produktsicherheit (GPS)' },
      { label: 'Shop platzieren' }
    ]
  },
  { label: 'FAQ', icon: HelpCircle }
];

const Sidebar = () => (
  <Box
    w={260}
    p="md"
    style={{
      height: '100vh',
      background: '#f8f9fa',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 150,
    }}
    bg="gray.1"
  >
    <ScrollArea>
      {navItems.map((item, idx) => (
        <React.Fragment key={item.label}>
          <NavLink
            label={item.label}
            leftSection={item.icon ? <item.icon size={18} /> : undefined}
            active={item.active}
            rightSection={item.hasSubmenu ? <ChevronRight size={16} /> : undefined}
            childrenOffset={16}
            defaultOpened={item.active && !!item.submenu}
          >
            {item.submenu &&
              item.submenu.map((subitem) => (
                <NavLink
                  key={subitem.label}
                  label={subitem.label}
                  active={subitem.active}
                  style={subitem.active ? { color: '#022d94' } : undefined}
                />
              ))}
          </NavLink>
        </React.Fragment>
      ))}
    </ScrollArea>
  </Box>
);

export default Sidebar;
