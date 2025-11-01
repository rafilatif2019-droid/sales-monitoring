
import React, { useMemo } from 'react';
import { Product, StoreLevel } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface TargetProgressChartProps {
    product: Product;
}

const TargetProgressChart: React.FC<TargetProgressChartProps> = ({ product }) => {
    const { stores, sales } = useAppContext();

    const stats = useMemo(() => {
        let totalTargetCount = 0;
        
        const storesByLevel = stores.reduce((acc, store) => {
            if (!acc[store.level]) {
                acc[store.level] = [];
            }
            acc[store.level].push(store);
            return acc;
        }, {} as Record<StoreLevel, typeof stores>);

        if (product.targetCoverage && Object.keys(product.targetCoverage).length > 0) {
            for (const levelStr in product.targetCoverage) {
                const level = levelStr as StoreLevel;
                const coveragePercent = product.targetCoverage[level] || 0;
                const levelStores = storesByLevel[level] || [];
                if (levelStores.length === 0) continue;

                const requiredCount = Math.ceil(levelStores.length * (coveragePercent / 100));
                totalTargetCount += requiredCount;
            }
        }
        
        const achievedStoreIds = new Set(sales.filter(s => s.productId === product.id).map(s => s.storeId));
        const totalAchievedCount = achievedStoreIds.size;

        return {
            achieved: totalAchievedCount,
            target: totalTargetCount,
        };

    }, [product, stores, sales]);

    const percentage = stats.target > 0 ? (stats.achieved / stats.target) * 100 : 0;
    const cappedPercentage = Math.min(percentage, 100);

    const sqSize = 100;
    const strokeWidth = 12;
    const radius = (sqSize - strokeWidth) / 2;
    const viewBox = `0 0 ${sqSize} ${sqSize}`;
    const dashArray = radius * Math.PI * 2;
    const dashOffset = dashArray - (dashArray * cappedPercentage) / 100;

    return (
        <div className="bg-slate-800 p-4 rounded-lg flex flex-col items-center text-center h-full">
            <h4 className="font-bold text-lg mb-2 h-12 flex items-center">{product.name}</h4>
            <div className="relative w-32 h-32">
                 <svg width="100%" height="100%" viewBox={viewBox}>
                    <circle
                        className="fill-transparent stroke-slate-700"
                        cx={sqSize / 2}
                        cy={sqSize / 2}
                        r={radius}
                        strokeWidth={`${strokeWidth}px`}
                    />
                    <circle
                        className="fill-transparent stroke-brand-500 transition-all duration-500"
                        cx={sqSize / 2}
                        cy={sqSize / 2}
                        r={radius}
                        strokeWidth={`${strokeWidth}px`}
                        transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
                        style={{
                            strokeDasharray: dashArray,
                            strokeDashoffset: dashOffset,
                            strokeLinecap: 'round'
                        }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{Math.round(percentage)}%</span>
                </div>
            </div>
            <div className="mt-2">
                <p className="text-xl font-semibold">
                    {stats.achieved} / <span className="text-slate-400">{stats.target} Toko</span>
                </p>
                <p className="text-xs text-slate-500">Tercapai</p>
            </div>
        </div>
    );
};

export default TargetProgressChart;
