import { DiscountRule } from "../models/ruleTypes";

export const sampleRules: DiscountRule[] = [
  {
    id: "rule1",
    name: "Defekte Teile",
    requestCategory: "Reklamation", // Added requestCategory
    requestType: "Artikel zurücksenden",
    triggers: ["Teile oder Zubehör fehlen", "Falscher Artikel"],
    calculationBase: "fester_betrag",
    value: 50,
    roundingRule: "keine_rundung",
    returnHandling: "automatisches_label",
    shippingType: "paket",
    returnStrategy: "discount_then_return" // Added returnStrategy
  },
  {
    id: "rule2",
    name: "Preisreduzierung",
    requestCategory: "Widerruf", // Added requestCategory
    requestType: "Preisnachlass gewünscht",
    triggers: ["Teile oder Zubehör fehlen", "Falscher Artikel"],
    calculationBase: "prozent_vom_vk",
    value: 10,
    roundingRule: "keine_rundung",
    returnHandling: "automatisches_label",
    shippingType: "paket",
    returnStrategy: "discount_then_return" // Added returnStrategy
  },
];

export default sampleRules;
