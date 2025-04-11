
import { DiscountRule } from "../models/ruleTypes";

export const sampleRules: DiscountRule[] = [
  {
    id: "1",
    name: "Standard Widerruf bis 50€",
    triggers: ["widerruf", "reklamation"],
    calculationBase: "fester_betrag",
    value: 50,
    roundingRule: "keine_rundung",
    costCenter: "merchant",
    returnHandling: "automatisches_label"
  },
  {
    id: "2",
    name: "20% vom VK",
    triggers: ["widerruf", "reklamation"],
    calculationBase: "prozent_vom_vk",
    value: 20,
    roundingRule: "keine_rundung",
    costCenter: "merchant",
    returnHandling: "automatisches_label"
  },
  {
    id: "3",
    name: "Komplexe Widerruf/Reklamation Staffelung",
    triggers: ["widerruf", "reklamation"],
    calculationBase: "preisstaffel",
    roundingRule: "auf_5_euro",
    costCenter: "merchant",
    returnHandling: "manuelles_label",
    priceThresholds: [
      { minPrice: 0, maxPrice: 400, value: 10 },
      { minPrice: 400, value: 5 }
    ]
  },
  {
    id: "4",
    name: "40%-60% Mehrstufiges Angebot",
    triggers: ["widerruf", "reklamation"],
    calculationBase: "angebotsstaffel",
    roundingRule: "keine_rundung",
    costCenter: "merchant",
    returnHandling: "manuelles_label",
    discountLevels: [40, 60, 100],
    checkIfProductOpened: true,
    offerDiscountBeforeReturn: true,
    notes: "Zusätzlich zu Bildern vorher immer abfragen, ob Produkt/Matratze bereits geöffnet wurde!"
  },
  {
    id: "5",
    name: "Betragsstaffel nach VK",
    triggers: ["widerruf", "reklamation"],
    calculationBase: "preisstaffel",
    roundingRule: "keine_rundung",
    costCenter: "merchant",
    returnHandling: "automatisches_label",
    priceThresholds: [
      { minPrice: 0, maxPrice: 100, value: 10 },
      { minPrice: 100, maxPrice: 150, value: 15 },
      { minPrice: 150, maxPrice: 200, value: 20 },
      { minPrice: 200, value: 30 }
    ]
  },
  {
    id: "6",
    name: "10% Leifheit ohne Rundung",
    triggers: ["widerruf", "reklamation"],
    calculationBase: "prozent_vom_vk",
    value: 10,
    roundingRule: "keine_rundung",
    costCenter: "merchant",
    returnHandling: "manuelles_label",
    notes: "Leifheit legt Retourenlabel im Paket bei."
  },
  {
    id: "7",
    name: "CHECK24 30% mit 10€ Rundung",
    triggers: ["widerruf", "reklamation"],
    calculationBase: "prozent_vom_vk",
    value: 30,
    roundingRule: "auf_10_euro",
    costCenter: "check24",
    returnHandling: "automatisches_label"
  },
  {
    id: "8",
    name: "Beschädigte Produkte - Ästhetischer Schaden",
    triggers: ["beschaedigte_ware_leicht"],
    calculationBase: "prozent_vom_vk",
    value: 15,
    roundingRule: "auf_5_euro",
    costCenter: "merchant",
    returnHandling: "keine_retoure",
    requestPictures: true
  },
  {
    id: "9",
    name: "Stark beschädigte Produkte - Eingeschränkt benutzbar",
    triggers: ["beschaedigte_ware_mittel"],
    calculationBase: "prozent_vom_vk",
    value: 35,
    roundingRule: "auf_5_euro",
    costCenter: "merchant",
    returnHandling: "keine_retoure",
    requestPictures: true,
    consultPartnerBeforePayout: true
  },
  {
    id: "10",
    name: "Schwer beschädigte Produkte",
    triggers: ["beschaedigte_ware_schwer", "beschaedigte_ware_unbrauchbar"],
    calculationBase: "angebotsstaffel",
    discountLevels: [50, 70, 100],
    roundingRule: "keine_rundung",
    costCenter: "check24",
    returnHandling: "keine_retoure",
    requestPictures: true,
    consultPartnerBeforePayout: true,
    noReturnOnFullRefund: true
  }
];
