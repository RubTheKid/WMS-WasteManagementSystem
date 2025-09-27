export class ClassificationTrainingData {
  static getHazardousKeywords() {
    return [
      // Chemical compounds
      'acid', 'alkali', 'base', 'solvent', 'paint', 'thinner', 'stain', 'varnish',
      'pesticide', 'herbicide', 'insecticide', 'fungicide', 'fertilizer',
      'bleach', 'ammonia', 'chlorine', 'sulfuric', 'hydrochloric', 'nitric',
      'sodium hydroxide', 'potassium hydroxide', 'calcium hydroxide',
      'mercury', 'lead', 'cadmium', 'arsenic', 'chromium', 'nickel',
      'benzene', 'toluene', 'xylene', 'formaldehyde', 'acetone',
      'methanol', 'ethanol', 'isopropanol', 'ethylene glycol',

      // Batteries and electronics
      'battery', 'lithium', 'lead-acid', 'nickel-cadmium', 'mercury battery',
      'electronic waste', 'e-waste', 'circuit board', 'capacitor',
      'transformer', 'fluorescent', 'led', 'cfl', 'light bulb',

      // Oils and fuels
      'oil', 'gasoline', 'diesel', 'kerosene', 'fuel', 'lubricant',
      'motor oil', 'transmission fluid', 'brake fluid', 'antifreeze',
      'hydraulic fluid', 'cutting oil', 'coolant',

      // Medical and pharmaceutical
      'medicine', 'pharmaceutical', 'drug', 'syringe', 'needle',
      'medical waste', 'biohazard', 'infectious', 'pathogen',
      'chemotherapy', 'radioactive', 'isotope',

      // Industrial materials
      'asbestos', 'pcb', 'polychlorinated biphenyl', 'dioxin',
      'fiberglass', 'insulation', 'refractory', 'catalyst',
      'resin', 'epoxy', 'adhesive', 'glue', 'sealant',

      // Paints and coatings
      'paint', 'primer', 'coating', 'lacquer', 'enamel',
      'rust remover', 'stripper', 'cleaner', 'degreaser',

      // Laboratory chemicals
      'reagent', 'solution', 'buffer', 'indicator', 'dye',
      'stain', 'fixative', 'preservative', 'disinfectant',

      // Hazardous characteristics
      'flammable', 'combustible', 'explosive', 'corrosive',
      'toxic', 'poisonous', 'carcinogenic', 'mutagenic',
      'teratogenic', 'reactive', 'oxidizer', 'peroxide',
      'spontaneously combustible', 'water reactive'
    ];
  }

  static getNonHazardousKeywords() {
    return [
      // Paper and cardboard
      'paper', 'cardboard', 'newspaper', 'magazine', 'book',
      'document', 'file', 'folder', 'envelope', 'box',
      'packaging', 'wrapping', 'tissue', 'napkin',

      // Organic waste
      'food', 'organic', 'compost', 'vegetable', 'fruit',
      'garden', 'yard', 'grass', 'leaves', 'branches',
      'wood', 'sawdust', 'bark', 'mulch',

      // Plastics (non-hazardous)
      'plastic bottle', 'plastic container', 'plastic bag',
      'hDPE', 'ldpe', 'pp', 'ps', 'pet', 'pvc',
      'recyclable plastic', 'clean plastic',

      // Metals (non-hazardous)
      'aluminum', 'steel', 'iron', 'copper', 'brass',
      'bronze', 'tin', 'zinc', 'scrap metal', 'metal can',
      'clean metal', 'unpainted metal',

      // Glass
      'glass', 'bottle', 'jar', 'window', 'mirror',
      'ceramic', 'porcelain', 'tile', 'clean glass',

      // Textiles
      'fabric', 'cloth', 'clothing', 'textile', 'cotton',
      'wool', 'silk', 'linen', 'denim', 'clean fabric',

      // Construction materials (non-hazardous)
      'concrete', 'brick', 'stone', 'gravel', 'sand',
      'clean construction', 'demolition debris',

      // General non-hazardous
      'clean', 'uncontaminated', 'recyclable', 'reusable',
      'household', 'office', 'commercial', 'industrial',
      'non-toxic', 'safe', 'inert', 'stable'
    ];
  }
}
