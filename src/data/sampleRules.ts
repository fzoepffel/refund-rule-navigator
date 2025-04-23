import { DiscountRule } from "../models/ruleTypes";

export const sampleRules: DiscountRule[] = [
  {
    id: "1",
    name: "Standard Widerruf - Preisabhängige Staffelung",
    requestCategory: "Widerruf",
    requestType: "Artikel zurücksenden",
    triggers: ["Gefällt mir nicht mehr", "Irrtümlich bestellt"],
    calculationBase: "preisstaffel",
    roundingRule: "keine_rundung",
    returnHandling: "automatisches_label",
    shippingType: "Paket",
    priceThresholds: [
      { minPrice: 0, maxPrice: 100, value: 10, valueType: "percent", roundingRule: "keine_rundung" },
      { minPrice: 100, maxPrice: 200, value: 15, valueType: "percent", roundingRule: "keine_rundung" },
      { minPrice: 200, value: 20, valueType: "percent", roundingRule: "keine_rundung" }
    ],
    isCompleteRule: true,
    consultPartnerBeforePayout: false
  },
  {
    id: "3",
    name: "Fester Betrag - Automatische Retoure",
    requestCategory: "Widerruf",
    requestType: "Artikel zurücksenden",
    triggers: ["Falscher Artikel", "Teile oder Zubehör fehlen"],
    calculationBase: "fester_betrag",
    value: 100,
    roundingRule: "keine_rundung",
    returnHandling: "automatisches_label",
    shippingType: "Paket",
    isCompleteRule: true,
    consultPartnerBeforePayout: false,
    returnStrategy: "auto_return_full_refund"
  },
  {
    id: "4",
    name: "Preisnachlass bis 50€ - Shop Kosten",
    requestCategory: "Widerruf",
    requestType: "Preisnachlass gewünscht",
    triggers: ["Gefällt mir nicht mehr", "Irrtümlich bestellt", "Artikel beschädigt/funktioniert nicht mehr"],
    calculationBase: "fester_betrag",
    value: 50,
    roundingRule: "keine_rundung",
    returnHandling: "automatisches_label",
    shippingType: "Paket",
    isCompleteRule: true,
    consultPartnerBeforePayout: false
  },
  {
    id: "5",
    name: "20% VK - Shop Kosten",
    requestCategory: "Widerruf",
    requestType: "Preisnachlass gewünscht",
    triggers: ["Gefällt mir nicht mehr", "Irrtümlich bestellt", "Artikel beschädigt/funktioniert nicht mehr"],
    calculationBase: "prozent_vom_vk",
    value: 20,
    roundingRule: "keine_rundung",
    returnHandling: "automatisches_label",
    shippingType: "Paket",
    isCompleteRule: true,
    consultPartnerBeforePayout: false
  },
  {
    id: "6",
    name: "Reklamation - Preisabhängige Staffelung",
    requestCategory: "Reklamation",
    requestType: "Preisnachlass gewünscht",
    triggers: ["Artikel beschädigt/funktioniert nicht mehr"],
    calculationBase: "preisstaffel",
    roundingRule: "keine_rundung",
    returnHandling: "automatisches_label",
    shippingType: "Paket",
    priceThresholds: [
      { minPrice: 0, maxPrice: 150, value: 20, valueType: "percent", roundingRule: "auf_5_euro" },
      { minPrice: 150, maxPrice: 400, value: 10, valueType: "percent", roundingRule: "auf_10_euro" },
      { minPrice: 400, value: 5, valueType: "percent", roundingRule: "auf_10_euro" }
    ],
    isCompleteRule: true,
    consultPartnerBeforePayout: false
  },
  {
    id: "7",
    name: "Preisnachlass - Shop Kosten mit Staffelung",
    requestCategory: "Widerruf",
    requestType: "Preisnachlass gewünscht",
    triggers: ["Gefällt mir nicht mehr", "Irrtümlich bestellt", "Artikel beschädigt/funktioniert nicht mehr"],
    calculationBase: "preisstaffel",
    roundingRule: "keine_rundung",
    returnHandling: "manuelles_label",
    shippingType: "Paket",
    priceThresholds: [
      { minPrice: 0, maxPrice: 100, value: 20, valueType: "percent", roundingRule: "auf_5_euro" },
      { minPrice: 100, value: 10, valueType: "percent", roundingRule: "auf_10_euro" }
    ],
    isCompleteRule: true,
    consultPartnerBeforePayout: false
  },
  {
    id: "9",
    name: "Preisnachlass - Feste Beträge nach VK",
    requestCategory: "Widerruf",
    requestType: "Preisnachlass gewünscht",
    triggers: ["Gefällt mir nicht mehr", "Irrtümlich bestellt", "Artikel beschädigt/funktioniert nicht mehr"],
    calculationBase: "preisstaffel",
    roundingRule: "keine_rundung",
    returnHandling: "automatisches_label",
    shippingType: "Paket",
    priceThresholds: [
      { minPrice: 0, maxPrice: 100, value: 10, valueType: "fixed", roundingRule: "keine_rundung" },
      { minPrice: 100, maxPrice: 150, value: 15, valueType: "fixed", roundingRule: "keine_rundung" },
      { minPrice: 150, maxPrice: 200, value: 20, valueType: "fixed", roundingRule: "keine_rundung" },
      { minPrice: 200, value: 30, valueType: "fixed", roundingRule: "keine_rundung" }
    ],
    isCompleteRule: true,
    consultPartnerBeforePayout: false
  },
  {
    id: "10",
    name: "Leifheit - 10% VK ohne Runden",
    requestCategory: "Widerruf",
    requestType: "Preisnachlass gewünscht",
    triggers: ["Gefällt mir nicht mehr", "Irrtümlich bestellt"],
    calculationBase: "prozent_vom_vk",
    value: 10,
    roundingRule: "keine_rundung",
    returnHandling: "manuelles_label",
    shippingType: "Paket",
    isCompleteRule: true,
    consultPartnerBeforePayout: false
  }
];
