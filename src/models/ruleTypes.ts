
export type RequestType = 
  | 'Ersatzteil gewünscht'
  | 'Preisnachlass gewünscht'
  | 'Kontaktaufnahme gewünscht'
  | 'Artikel zurücksenden'
  | 'Rücksendung gewünscht'; // New option added

export type Trigger = 
  | 'Artikel beschädigt/funktioniert nicht mehr'
  | 'Versandverpackung und Artikel beschädigt'
  | 'Teile oder Zubehör fehlen'
  | 'Falscher Artikel'
  | 'Sonstiges'; // New option added
