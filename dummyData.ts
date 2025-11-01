

import { Store, Product, StoreLevel, ProductType } from './types';

const generateDummyStores = (): Store[] => {
    const stores: Omit<Store, 'id'>[] = [];
    const levelsDistribution = {
        [StoreLevel.WS1]: 2,
        [StoreLevel.WS2]: 34,
        [StoreLevel.RitelL]: 24,
        [StoreLevel.Ritel]: 25,
        [StoreLevel.Others]: 11,
    };

    Object.entries(levelsDistribution).forEach(([level, count]) => {
        for (let i = 1; i <= count; i++) {
            stores.push({
                name: `Toko ${level} ${i}`,
                level: level as StoreLevel,
            });
        }
    });
    
    return stores.map((store, index) => ({
        ...store,
        id: `store-${index}-${new Date().getTime()}`
    }));
};

export const DUMMY_STORES: Store[] = generateDummyStores();

export const DUMMY_PRODUCTS: Product[] = [
    // Distribusi Drive - Based on user image
    { id: 'dd-1', name: 'KOPI MAYOR PACK', type: ProductType.DD, basePrice: 150000, isActive: true, targetCoverage: { [StoreLevel.WS1]: 70, [StoreLevel.WS2]: 60, [StoreLevel.RitelL]: 50, [StoreLevel.Ritel]: 50 } },
    { id: 'dd-2', name: 'KOPI TOP SUSU SCT', type: ProductType.DD, basePrice: 120000, isActive: true, targetCoverage: { [StoreLevel.WS1]: 70, [StoreLevel.WS2]: 60, [StoreLevel.RitelL]: 50, [StoreLevel.Ritel]: 50 } },
    { id: 'dd-3', name: 'SEDAAP MIE GORENG', type: ProductType.DD, basePrice: 95000, isActive: true, targetCoverage: { [StoreLevel.WS1]: 70, [StoreLevel.WS2]: 60, [StoreLevel.RitelL]: 50, [StoreLevel.Ritel]: 40 } },
    { id: 'dd-4', name: 'KECAP SEDAAP', type: ProductType.DD, basePrice: 75000, isActive: true, targetCoverage: { [StoreLevel.WS1]: 70, [StoreLevel.WS2]: 60, [StoreLevel.RitelL]: 50, [StoreLevel.Ritel]: 40 } },
    { id: 'dd-5', name: 'POWER F', type: ProductType.DD, basePrice: 110000, isActive: true, targetCoverage: { [StoreLevel.WS1]: 70, [StoreLevel.WS2]: 60, [StoreLevel.RitelL]: 50, [StoreLevel.Others]: 70 } },

    // Item Fokus - Generic targets for demonstration
    { id: 'fokus-1', name: 'Snack Kentang Premium', type: ProductType.Fokus, basePrice: 210000, isActive: true, targetCoverage: { [StoreLevel.WS1]: 80, [StoreLevel.WS2]: 70, [StoreLevel.RitelL]: 60, [StoreLevel.Ritel]: 50 } },
    { id: 'fokus-2', name: 'Susu UHT Cokelat 1L', type: ProductType.Fokus, basePrice: 250000, isActive: true, targetCoverage: { [StoreLevel.WS1]: 80, [StoreLevel.WS2]: 70, [StoreLevel.RitelL]: 60, [StoreLevel.Ritel]: 50 } },
    { id: 'fokus-3', name: 'Deterjen Cair Konsentrat', type: ProductType.Fokus, basePrice: 180000, isActive: true, targetCoverage: { [StoreLevel.WS1]: 80, [StoreLevel.WS2]: 70, [StoreLevel.RitelL]: 60, [StoreLevel.Ritel]: 50 } },
];