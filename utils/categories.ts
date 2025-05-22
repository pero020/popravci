// Top-level service categories
export const TOP_CATEGORIES = [
  "Električne instalacije",
  "Vodoinstalacije",
  "Stolarija / Vrata / Prozori",
  "Bravarija",
  "Kupaonica",
  "Kuhinja",
  "Bijela tehnika (servis)",
  "Klima / Grijanje",
  "Zidovi / Strop",
  "Pomoć u kući / Sitni radovi"
];

// All service categories with their subcategories
export const SERVICE_CATEGORIES = [
  {
    id: "1",
    name: "1. Električne instalacije",
    subcategories: [
      { id: "1.1", name: "Ne radi utičnica" },
      { id: "1.2", name: "Ne radi svjetlo" },
      { id: "1.3", name: "Zamjena prekidača ili utičnice" },
      { id: "1.4", name: "Postavljanje rasvjete/lustre" },
      { id: "1.5", name: "Problemi s osiguračima" }
    ]
  },
  {
    id: "2",
    name: "2. Vodoinstalacije",
    subcategories: [
      { id: "2.1", name: "Curi voda (sudoper, sifon, WC...)" },
      { id: "2.2", name: "Začepljenje odvoda" },
      { id: "2.3", name: "Zamjena slavine ili tuša" },
      { id: "2.4", name: "Problemi s kotlićem" },
      { id: "2.5", name: "Ugradnja perilice/sušilice" }
    ]
  },
  {
    id: "3",
    name: "3. Stolarija / Vrata / Prozori",
    subcategories: [
      { id: "3.1", name: "Podešavanje vrata/prozora" },
      { id: "3.2", name: "Zamjena brava/kvaka" },
      { id: "3.3", name: "Popravak namještaja" },
      { id: "3.4", name: "Montaža kuhinje/ormara" }
    ]
  },
  {
    id: "4",
    name: "4. Bravarija",
    subcategories: [
      { id: "4.1", name: "Otvaranje zaključanih vrata" },
      { id: "4.2", name: "Zamjena cilindara" },
      { id: "4.3", name: "Popravak rešetki, ograda" }
    ]
  },
  {
    id: "5",
    name: "5. Kupaonica",
    subcategories: [
      { id: "5.1", name: "Silikoniranje tuša/kade" },
      { id: "5.2", name: "Zamjena WC školjke" },
      { id: "5.3", name: "Ugradnja tuš kabine" }
    ]
  },
  {
    id: "6",
    name: "6. Kuhinja",
    subcategories: [
      { id: "6.1", name: "Popravak ormarića" },
      { id: "6.2", name: "Zamjena šarki / vodilica" },
      { id: "6.3", name: "Sitne montaže i dorade" }
    ]
  },
  {
    id: "7",
    name: "7. Bijela tehnika (servis)",
    subcategories: [
      { id: "7.1", name: "Perilica rublja" },
      { id: "7.2", name: "Sušilica" },
      { id: "7.3", name: "Perilica suđa" },
      { id: "7.4", name: "Hladnjak" }
    ]
  },
  {
    id: "8",
    name: "8. Klima / Grijanje",
    subcategories: [
      { id: "8.1", name: "Servis klime" },
      { id: "8.2", name: "Montaža klime" },
      { id: "8.3", name: "Radijatori / grijanje" }
    ]
  },
  {
    id: "9",
    name: "9. Zidovi / Strop",
    subcategories: [
      { id: "9.1", name: "Zakrpavanje rupa" },
      { id: "9.2", name: "Krečenje manjih površina" },
      { id: "9.3", name: "Postavljanje polica, slika" }
    ]
  },
  {
    id: "10",
    name: "10. Pomoć u kući / Sitni radovi",
    subcategories: [
      { id: "10.1", name: "Sastavljanje namještaja (IKEA i sl.)" },
      { id: "10.2", name: "Vješanje TV-a na zid" },
      { id: "10.3", name: "Montaža zavjesa, roleta" }
    ]
  }
];