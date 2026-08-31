export const DEFAULT_PROPERTY_TAXONOMY = {
  residenziale: [
    'Appartamento',
    'Monolocale',
    'Bilocale',
    'Trilocale',
    'Quadrilocale',
    'Attico',
    'Mansarda',
    'Loft',
    'Villa',
    'Villetta',
    'Casa indipendente',
    'Casa bifamiliare',
    'Casa a schiera',
    'Rustico / Casale',
    'Palazzo / Stabile',
    'Multiproprietà',
    'Altro residenziale',
  ],
  commerciale: [
    'Locale commerciale',
    'Negozio',
    'Ufficio',
    'Studio professionale',
    'Attività commerciale',
    'Laboratorio',
    'Magazzino',
    'Deposito',
    'Capannone',
    'Struttura ricettiva',
    'Hotel / B&B',
    'Altro commerciale',
  ],
  terreno_altro: [
    'Terreno edificabile',
    'Terreno agricolo',
    'Garage / Box',
    'Posto auto',
    'Cantina',
    'Altro',
  ],
};

export const getAvailablePropertyTypes = (
  disabledCategories: string[],
  customCategories: string[],
  preferredCategories: string[]
) => {
  const allDefaults = [
    ...DEFAULT_PROPERTY_TAXONOMY.residenziale,
    ...DEFAULT_PROPERTY_TAXONOMY.commerciale,
    ...DEFAULT_PROPERTY_TAXONOMY.terreno_altro,
  ];

  const available = allDefaults.filter((cat) => !disabledCategories.includes(cat));
  const fullList = [...available, ...customCategories];

  return {
    preferred: preferredCategories.filter((cat) => fullList.includes(cat)),
    residenziale: DEFAULT_PROPERTY_TAXONOMY.residenziale.filter((cat) => fullList.includes(cat)),
    commerciale: DEFAULT_PROPERTY_TAXONOMY.commerciale.filter((cat) => fullList.includes(cat)),
    terreno_altro: DEFAULT_PROPERTY_TAXONOMY.terreno_altro.filter((cat) => fullList.includes(cat)),
    custom: customCategories,
  };
};
