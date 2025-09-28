import { format } from 'date-fns';

export const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return format(date, 'MMM dd, yyyy - HH:mm');
    } catch {
        return 'Invalid date';
    }
};


export const getHazardBadgeClass = (riskLevel: string): string => {
    switch (riskLevel.toUpperCase()) {
        case 'EXTREME':
            return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-900 border-red-300';
        case 'HIGH':
            return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border-red-200';
        case 'MODERATE':
            return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'LOW':
            return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border-green-200';
        default:
            return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border-gray-200';
    }
};

// EPA Classification badge styling
export const getClassificationBadgeClass = (classificationCode: string): string => {
    const baseClass = 'inline-flex items-center px-2 py-1 rounded text-xs font-mono font-medium border';

    if (classificationCode.startsWith('D001')) {
        return `${baseClass} bg-orange-100 text-orange-800 border-orange-300`; // Ignitable
    } else if (classificationCode.startsWith('D002')) {
        return `${baseClass} bg-red-100 text-red-800 border-red-300`; // Corrosive
    } else if (classificationCode.startsWith('D003')) {
        return `${baseClass} bg-purple-100 text-purple-800 border-purple-300`; // Reactive
    } else if (classificationCode.startsWith('D0')) {
        return `${baseClass} bg-yellow-100 text-yellow-800 border-yellow-300`; // Toxic
    } else if (classificationCode.startsWith('F')) {
        return `${baseClass} bg-blue-100 text-blue-800 border-blue-300`; // F-listed
    } else if (classificationCode.startsWith('K')) {
        return `${baseClass} bg-indigo-100 text-indigo-800 border-indigo-300`; // K-listed
    } else if (classificationCode.startsWith('P')) {
        return `${baseClass} bg-red-200 text-red-900 border-red-400`; // P-listed (acute)
    } else if (classificationCode.startsWith('U')) {
        return `${baseClass} bg-pink-100 text-pink-800 border-pink-300`; // U-listed
    } else {
        return `${baseClass} bg-gray-100 text-gray-800 border-gray-300`;
    }
};

export const getStatusBadgeClass = (status: string): string => {
    switch (status.toUpperCase()) {
        case 'SCHEDULED':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'IN_PROGRESS':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'COMPLETED':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'CANCELLED':
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

// EPA Classification descriptions
export const getClassificationDescription = (classificationCode: string): string => {
    const descriptions: Record<string, string> = {
        // Characteristic Hazardous Wastes
        'D001': 'Ignitable - Can easily catch fire (flash point <140°F)',
        'D002': 'Corrosive - Can corrode containers or cause skin/eye damage (pH ≤2 or ≥12.5)',
        'D003': 'Reactive - Unstable, explosive, or releases toxic fumes',

        // Toxic Metal Wastes
        'D004': 'Toxic - Arsenic (≥5.0 mg/L)',
        'D005': 'Toxic - Barium (≥100.0 mg/L)',
        'D006': 'Toxic - Cadmium (≥1.0 mg/L)',
        'D007': 'Toxic - Chromium (≥5.0 mg/L)',
        'D008': 'Toxic - Lead (≥5.0 mg/L)',
        'D009': 'Toxic - Mercury (≥0.2 mg/L)',
        'D010': 'Toxic - Selenium (≥1.0 mg/L)',
        'D011': 'Toxic - Silver (≥5.0 mg/L)',

        // Pesticide Wastes
        'D012': 'Toxic - Endrin',
        'D013': 'Toxic - Lindane',
        'D014': 'Toxic - Methoxychlor',
        'D015': 'Toxic - Toxaphene',
        'D016': 'Toxic - 2,4-D',
        'D017': 'Toxic - 2,4,5-TP (Silvex)',

        // Organic Toxic Wastes
        'D018': 'Toxic - Benzene',
        'D019': 'Toxic - Carbon tetrachloride',
        'D020': 'Toxic - Chlordane',
        'D021': 'Toxic - Chlorobenzene',
        'D022': 'Toxic - Chloroform',
        'D023': 'Toxic - o-Cresol',
        'D024': 'Toxic - m-Cresol',
        'D025': 'Toxic - p-Cresol',
        'D026': 'Toxic - Cresol (mixed isomers)',
        'D027': 'Toxic - 1,4-Dichlorobenzene',
        'D028': 'Toxic - 1,2-Dichloroethane',
        'D029': 'Toxic - 1,1-Dichloroethylene',
        'D030': 'Toxic - 2,4-Dinitrotoluene',
        'D031': 'Toxic - Heptachlor',
        'D032': 'Toxic - Hexachlorobenzene',
        'D033': 'Toxic - Hexachlorobutadiene',
        'D034': 'Toxic - Hexachloroethane',
        'D035': 'Toxic - Methyl ethyl ketone',
        'D036': 'Toxic - Nitrobenzene',
        'D037': 'Toxic - Pentachlorophenol',
        'D038': 'Toxic - Pyridine',
        'D039': 'Toxic - Tetrachloroethylene',
        'D040': 'Toxic - Trichloroethylene',
        'D041': 'Toxic - 2,4,5-Trichlorophenol',
        'D042': 'Toxic - 2,4,6-Trichlorophenol',
        'D043': 'Toxic - Vinyl chloride',

        // Additional Hazard Categories
        'D044': 'Acute Hazardous Waste - P-listed chemicals',
        'D045': 'Toxic - Polychlorinated Biphenyls (PCBs)',
        'D046': 'Toxic - Dioxin-containing wastes',
        'D047': 'Radioactive Mixed Waste - Contains both radioactive and hazardous components',
        'D048': 'Biohazardous - Infectious or medical waste',
        'D049': 'Persistent Organic Pollutant (POP)',
        'D050': 'Ozone Depleting Substance',

        // State-Specific or Special Categories
        'D051': 'California Hazardous - Meets CA-specific criteria',
        'D052': 'Extremely Hazardous Substance (EHS)',
        'D053': 'High Global Warming Potential',
        'D054': 'Per- and Polyfluoroalkyl Substances (PFAS)',
        'D055': 'Nanomaterial Waste'
    };

    return descriptions[classificationCode] || `EPA Classification: ${classificationCode}`;
};

