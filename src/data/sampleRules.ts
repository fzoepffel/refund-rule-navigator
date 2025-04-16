
import { DiscountRule } from "../models/ruleTypes";

export const sampleRules: DiscountRule[] = [
  {
    id: "1",
    name: "Standard Widerruf bis 50€",
    requestType: "Artikel zurücksenden",
    triggers: ["Teile oder Zubehör fehlen", "Falscher Artikel"],
    calculationBase: "fester_betrag",
    value: 50,
    roundingRule: "keine_rundung",
    returnHandling: "automatisches_label",
    shippingType: "paket"
  },
  {
    id: "2",
    name: "20% vom VK",
    requestType: "Preisnachlass gewünscht",
    triggers: ["Falscher Artikel", "Teile oder Zubehör fehlen"],
    calculationBase: "prozent_vom_vk",
    value: 20,
    roundingRule: "keine_rundung",
    returnHandling: "automatisches_label",
    shippingType: "paket"
  },
  {
    id: "3",
    name: "Komplexe Widerruf/Reklamation Staffelung",
    requestType: "Artikel zurücksenden",
    triggers: ["Artikel beschädigt/funktioniert nicht mehr", "Versandverpackung und Artikel beschädigt"],
    calculationBase: "preisstaffel",
    roundingRule: "auf_5_euro",
    returnHandling: "manuelles_label",
    shippingType: "spedition",
    priceThresholds: [
      { minPrice: 0, maxPrice: 400, value: 10, valueType: "percent" },
      { minPrice: 400, value: 5, valueType: "percent" }
    ]
  },
  {
    id: "4",
    name: "40%-60% Mehrstufiges Angebot",
    requestType: "Preisnachlass gewünscht",
    triggers: ["Artikel beschädigt/funktioniert nicht mehr", "Versandverpackung und Artikel beschädigt"],
    calculationBase: "angebotsstaffel",
    roundingRule: "keine_rundung",
    returnHandling: "manuelles_label",
    shippingType: "spedition",
    discountLevels: [
      { value: 40, valueType: 'percent' }, 
      { value: 60, valueType: 'percent' }, 
      { value: 100, valueType: 'percent' }
    ],
    checkIfProductOpened: true,
    offerDiscountBeforeReturn: true,
    notes: "Zusätzlich zu Bildern vorher immer abfragen, ob Produkt/Matratze bereits geöffnet wurde!"
  },
  {
    id: "5",
    name: "Betragsstaffel nach VK",
    requestType: "Artikel zurücksenden",
    triggers: ["Teile oder Zubehör fehlen", "Falscher Artikel"],
    calculationBase: "preisstaffel",
    roundingRule: "keine_rundung",
    returnHandling: "automatisches_label",
    shippingType: "paket",
    priceThresholds: [
      { minPrice: 0, maxPrice: 100, value: 10, valueType: "fixed" },
      { minPrice: 100, maxPrice: 150, value: 15, valueType: "fixed" },
      { minPrice: 150, maxPrice: 200, value: 20, valueType: "fixed" },
      { minPrice: 200, value: 30, valueType: "fixed" }
    ]
  },
  {
    id: "6",
    name: "10% Leifheit ohne Rundung",
    requestType: "Preisnachlass gewünscht",
    triggers: ["Falscher Artikel", "Artikel beschädigt/funktioniert nicht mehr"],
    calculationBase: "prozent_vom_vk",
    value: 10,
    roundingRule: "keine_rundung",
    returnHandling: "manuelles_label",
    shippingType: "paket",
    notes: "Leifheit legt Retourenlabel im Paket bei."
  },
  {
    id: "7",
    name: "CHECK24 30% mit 10€ Rundung",
    requestType: "Preisnachlass gewünscht",
    triggers: ["Falscher Artikel", "Artikel beschädigt/funktioniert nicht mehr"],
    calculationBase: "prozent_vom_vk",
    value: 30,
    roundingRule: "auf_10_euro",
    returnHandling: "automatisches_label",
    shippingType: "paket"
  },
  {
    id: "8",
    name: "Beschädigte Produkte - Ästhetischer Schaden",
    requestType: "Preisnachlass gewünscht",
    triggers: ["Artikel beschädigt/funktioniert nicht mehr"],
    calculationBase: "prozent_vom_vk",
    value: 15,
    roundingRule: "auf_5_euro",
    returnHandling: "keine_retoure",
    shippingType: "paket",
    requestPictures: true
  },
  {
    id: "9",
    name: "Stark beschädigte Produkte - Eingeschränkt benutzbar",
    requestType: "Preisnachlass gewünscht",
    triggers: ["Versandverpackung und Artikel beschädigt"],
    calculationBase: "prozent_vom_vk",
    value: 35,
    roundingRule: "auf_5_euro",
    returnHandling: "keine_retoure",
    shippingType: "paket",
    requestPictures: true,
    consultPartnerBeforePayout: true
  },
  {
    id: "10",
    name: "Schwer beschädigte Produkte",
    requestType: "Preisnachlass gewünscht",
    triggers: ["Artikel beschädigt/funktioniert nicht mehr", "Versandverpackung und Artikel beschädigt"],
    calculationBase: "angebotsstaffel",
    discountLevels: [
      { value: 50, valueType: 'percent' },
      { value: 70, valueType: 'percent' },
      { value: 100, valueType: 'percent' }
    ],
    roundingRule: "keine_rundung",
    returnHandling: "keine_retoure",
    shippingType: "spedition",
    requestPictures: true,
    consultPartnerBeforePayout: true,
    returnStrategy: "discount_then_keep",
    noReturnOnFullRefund: true
  }
];
