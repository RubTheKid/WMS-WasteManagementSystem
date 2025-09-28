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

      // Radioactive materials
      'cesium', 'cesium-137', 'uranium', 'plutonium', 'radium', 'radon',
      'cobalt-60', 'strontium-90', 'iodine-131', 'technetium-99',
      'americium', 'thorium', 'tritium', 'carbon-14',

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
      'spontaneously combustible', 'water reactive',

      // Additional chemicals
      'phenol', 'toluene-diisocyanate', 'formalin', 'hydrazine', 'acetaldehyde',
      'perchlorate', 'nitroglycerin', 'cyanide', 'sulfur dioxide', 'hydrogen peroxide',

      // Batteries and electronics
      'smartphone battery', 'tablet battery', 'camera battery', 'laptop battery',
      'capacitor electrolyte', 'pcb board', 'microchip', 'led lamp', 'uv lamp',

      // Oils, fuels, lubricants
      'engine oil', 'gear oil', 'grease', 'heating oil', 'biofuel', 'motor lubricant',

      // Medical & pharma
      'vaccine', 'blood bag', 'lab sample', 'pathogenic culture', 'sharps container',
      'antibiotic', 'insulin', 'cytotoxic drug',

      // Radioactive
      'uranium-235', 'uranium-238', 'plutonium-239', 'iodine-129', 'technetium-98',

      // Industrial & construction
      'fire extinguisher', 'solvent-based adhesive', 'chemical drum', 'resin batch',
      'epoxy glue', 'paint thinner', 'oil-based paint', 'glue residue', 'contaminated sand',

      // Hazard characteristics
      'explosive powder', 'combustible dust', 'reactive solid', 'water reactive powder'
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
      'non-toxic', 'safe', 'inert', 'stable',
      
      // Paper / Cardboard
      'catalog', 'leaflet', 'postcard', 'receipt', 'paperboard',

      // Organic / Food
      'coffee grounds', 'tea leaves', 'egg shells', 'fruit peel', 'vegetable peel',
      'grass clippings', 'fallen leaves', 'compost bag', 'garden trimmings',

      // Plastics
      'yogurt cup', 'milk carton', 'plastic wrapper', 'plastic tray', 'PET bottle cap',
      'plastic straw', 'plastic packaging film', 'clean food container',

      // Metals
      'aluminum foil', 'tin can', 'copper wire', 'steel pipe', 'iron scrap',
      'brass fitting', 'zinc sheet', 'clean metal sheet', 'unpainted scrap',

      // Glass
      'glass jar lid', 'wine bottle', 'beer bottle', 'glass panel', 'mirror shard',
      'window frame', 'ceramic tile', 'porcelain cup', 'clean glass bottle',

      // Textiles
      'old t-shirt', 'jeans', 'socks', 'wool sweater', 'cotton towel',
      'linen sheet', 'denim jacket', 'clean fabric scrap', 'textile offcut',

      // Construction / Wood
      'plywood', 'timber', 'wooden beam', 'drywall', 'flooring scrap',
      'clean brick', 'gravel pile', 'sand bag', 'stone slab',

      // Household / Misc
      'plastic toy', 'plastic container', 'empty box', 'cardboard packaging',
      'office paper', 'printer paper', 'magazine stack', 'clean packaging',
      'household item', 'reusable container', 'inert material', 'non-toxic material'
    ];
  }
}
