
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Product, ProductType, Store, StoreLevel, DailyVisitPlan } from '../types';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';
import { PencilSquareIcon, ArrowUpIcon, ArrowDownIcon, MinusIcon } from '../components/icons';
import TargetProgressChart from '../components/TargetProgressChart';

const DailyPlanEditModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    day: number;
    dayName: string;
}> = ({ isOpen, onClose, day, dayName }) => {
    const { stores, dailyVisitPlan, setDailyVisitPlan } = useAppContext();
    const [selectedStoreIds, setSelectedStoreIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isOpen) {
            setSelectedStoreIds(new Set(dailyVisitPlan[day] || []));
        }
    }, [isOpen, day, dailyVisitPlan]);

    const handleToggleStore = (storeId: string) => {
        const newSet = new Set(selectedStoreIds);
        if (newSet.has(storeId)) {
            newSet.delete(storeId);
        } else {
            newSet.add(storeId);
        }
        setSelectedStoreIds(newSet);
    };

    const handleSave = () => {
        // FIX: Explicitly type `newPlan` to avoid type inference issues with index signatures.
        const newPlan: DailyVisitPlan = { ...dailyVisitPlan, [day]: Array.from(selectedStoreIds) };
        setDailyVisitPlan(newPlan);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Atur Rencana Kunjungan: ${dayName}`}>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {stores.map(store => (
                    <label key={store.id} htmlFor={`store-plan-${store.id}`} className="flex items-center space-x-3 bg-slate-900 p-3 rounded-lg cursor-pointer hover:bg-slate-950 transition-colors">
                        <input
                            id={`store-plan-${store.id}`}
                            type="checkbox"
                            checked={selectedStoreIds.has(store.id)}
                            onChange={() => handleToggleStore(store.id)}
                            className="h-5 w-5 rounded bg-slate-700 border-slate-600 text-brand-500 focus:ring-brand-500"
                        />
                        <span className="font-semibold text-white">{store.name}</span>
                    </label>
                ))}
            </div>
            <div className="flex justify-end space-x-2 pt-4 mt-4 border-t border-slate-700">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 rounded-md hover:bg-slate-500">Batal</button>
                <button onClick={handleSave} className="px-4 py-2 bg-brand-600 rounded-md hover:bg-brand-500">Simpan</button>
            </div>
        </Modal>
    );
};

const TargetChecklistModal: React.FC<{
    store: Store | null;
    isOpen: boolean;
    onClose: () => void;
}> = ({ store, isOpen, onClose }) => {
    const { products, settings, sales, logSale, deleteSale } = useAppContext();
    
    if (!store) return null;

    const activeProducts = products.filter(p => p.isActive);
    const ddProducts = activeProducts.filter(p => p.type === ProductType.DD);
    const fokusProducts = activeProducts.filter(p => p.type === ProductType.Fokus);

    const handleCheckboxChange = (product: Product, isChecked: boolean) => {
        if (isChecked) {
            logSale({ storeId: store.id, productId: product.id, quantity: 1 });
        } else {
            deleteSale(store.id, product.id);
        }
    };
    
    const ProductChecklistItem: React.FC<{product: Product}> = ({ product }) => {
        const isChecked = sales.some(s => s.storeId === store.id && s.productId === product.id);
        const discountPercentage = settings.discounts[store.level];
        const finalPrice = product.basePrice * (1 - discountPercentage / 100);

        return (
             <label htmlFor={`product-${product.id}-${store.id}`} className="flex items-center space-x-3 bg-slate-900 p-3 rounded-lg cursor-pointer hover:bg-slate-950 transition-colors">
                <input
                    id={`product-${product.id}-${store.id}`}
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handleCheckboxChange(product, e.target.checked)}
                    className="h-5 w-5 rounded bg-slate-700 border-slate-600 text-brand-500 focus:ring-brand-500"
                />
                <div className="flex-1">
                    <p className="font-semibold text-white">{product.name}</p>
                    <p className="text-xs text-slate-400">
                        Harga: Rp {product.basePrice.toLocaleString()} &rarr; <span className="font-bold text-brand-400">Rp {finalPrice.toLocaleString()}</span> (Disc. {discountPercentage}%)
                    </p>
                </div>
            </label>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Target Produk: ${store.name}`}>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                    <h4 className="text-lg font-bold text-brand-400">Distribusi Drive</h4>
                    <p className="text-xs text-slate-400 mb-3">Target jangka pendek & promosi.</p>
                    <div className="space-y-2">
                        {ddProducts.length > 0 ? ddProducts.map(p => <ProductChecklistItem key={p.id} product={p} />) : <p className="text-slate-500 text-sm">Tidak ada target produk DD aktif.</p>}
                    </div>
                </div>
                 <div>
                    <h4 className="text-lg font-bold text-brand-400">Item Fokus</h4>
                    <p className="text-xs text-slate-400 mb-3">Produk prioritas jangka panjang.</p>
                    <div className="space-y-2">
                         {fokusProducts.length > 0 ? fokusProducts.map(p => <ProductChecklistItem key={p.id} product={p} />) : <p className="text-slate-500 text-sm">Tidak ada target produk Fokus aktif.</p>}
                    </div>
                </div>
            </div>
             <div className="flex justify-end mt-6">
                <button onClick={onClose} className="px-4 py-2 bg-slate-600 rounded-md hover:bg-slate-500">Tutup</button>
            </div>
        </Modal>
    );
};


const StoreCard: React.FC<{ store: Store }> = ({ store }) => {
    const { products, sales } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const activeProducts = products.filter(p => p.isActive);
    const ddProducts = activeProducts.filter(p => p.type === ProductType.DD);
    const fokusProducts = activeProducts.filter(p => p.type === ProductType.Fokus);

    const storeSales = sales.filter(s => s.storeId === store.id);
    
    const ddAchieved = ddProducts.filter(p => storeSales.some(s => s.productId === p.id)).length;
    const fokusAchieved = fokusProducts.filter(p => storeSales.some(s => s.productId === p.id)).length;

    const levelColorMap: Record<StoreLevel, string> = {
        [StoreLevel.WS1]: "bg-red-500",
        [StoreLevel.WS2]: "bg-orange-500",
        [StoreLevel.RitelL]: "bg-yellow-500",
        [StoreLevel.Ritel]: "bg-green-500",
        [StoreLevel.Others]: "bg-blue-500",
    };

    return (
        <div className="bg-slate-800 rounded-lg p-4 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">{store.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${levelColorMap[store.level]}`}>{store.level}</span>
                </div>
                <div className="mt-4 space-y-4">
                    <ProgressBar value={ddAchieved} max={ddProducts.length} label="Distribusi Drive" />
                    <ProgressBar value={fokusAchieved} max={fokusProducts.length} label="Item Fokus" />
                </div>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="mt-4 w-full bg-brand-600 text-white font-semibold py-2 rounded-md hover:bg-brand-500 transition-colors">
                Cek Target
            </button>
            <TargetChecklistModal store={store} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: number; change: number; }> = ({ title, value, change }) => {
    const changeIcon = change > 0 ? <ArrowUpIcon /> : change < 0 ? <ArrowDownIcon /> : <MinusIcon />;
    const changeColor = change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-slate-400';
    const changeText = change > 0 ? `+${change}` : change;

    return (
        <div className="bg-slate-800 p-4 rounded-lg">
            <h4 className="text-sm text-slate-400">{title}</h4>
            <div className="flex justify-between items-baseline">
                <p className="text-3xl font-bold">{value}</p>
                <div className={`flex items-center gap-1 font-semibold ${changeColor}`}>
                    {changeIcon}
                    <span>{change === 0 ? '-' : changeText}</span>
                </div>
            </div>
            <p className="text-xs text-slate-500">vs minggu lalu</p>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { stores, products, sales, dailyVisitPlan, settings } = useAppContext();
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [showDeadlineWarning, setShowDeadlineWarning] = useState(false);
    
    const deadline = settings.deadline;

    useEffect(() => {
        if (deadline) {
            const deadlineDate = new Date(deadline);
            const today = new Date();
            // Reset time to compare dates only
            deadlineDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            
            const timeDiff = deadlineDate.getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            setShowDeadlineWarning(daysDiff <= 7 && daysDiff >= 0);
        }
    }, [deadline]);

    const activeProducts = products.filter(p => p.isActive);
    const ddProducts = activeProducts.filter(p => p.type === ProductType.DD);
    const fokusProducts = activeProducts.filter(p => p.type === ProductType.Fokus);
    
    const weeklyStats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const getWeekStart = (date: Date) => {
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            const startDate = new Date(d.setDate(diff));
            startDate.setHours(0, 0, 0, 0);
            return startDate;
        };

        const weekStart = getWeekStart(today);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const lastWeekStart = new Date(weekStart);
        lastWeekStart.setDate(weekStart.getDate() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        lastWeekEnd.setHours(23, 59, 59, 999);

        const getStatsForPeriod = (startDate: Date, endDate: Date) => {
            const periodSales = sales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate >= startDate && saleDate <= endDate;
            });

            const visitedStores = new Set(periodSales.map(s => s.storeId)).size;
            
            const achievedTargets = periodSales.reduce((acc, sale) => {
                const product = products.find(p => p.id === sale.productId);
                if (product) {
                    if (product.type === ProductType.DD) {
                        acc.dd++;
                    } else if (product.type === ProductType.Fokus) {
                        acc.fokus++;
                    }
                }
                return acc;
            }, { dd: 0, fokus: 0 });

            return {
                visitedStores,
                ddAchieved: achievedTargets.dd,
                fokusAchieved: achievedTargets.fokus
            };
        };

        const thisWeek = getStatsForPeriod(weekStart, weekEnd);
        const lastWeek = getStatsForPeriod(lastWeekStart, lastWeekEnd);

        return { thisWeek, lastWeek };
    }, [sales, products]);

    const overallStats = useMemo(() => {
        const storesByLevel = stores.reduce((acc, store) => {
            if (!acc[store.level]) {
                acc[store.level] = [];
            }
            acc[store.level].push(store);
            return acc;
        }, {} as Record<StoreLevel, Store[]>);

        let ddTargetsMet = 0;
        let fokusTargetsMet = 0;

        for (const product of activeProducts) {
            let isProductTargetMet = true;
            if (!product.targetCoverage || Object.keys(product.targetCoverage).length === 0) {
                isProductTargetMet = false;
                 continue; // Skip products without defined targets
            }

            for (const levelStr in product.targetCoverage) {
                const level = levelStr as StoreLevel;
                const coveragePercent = product.targetCoverage[level] || 0;
                
                const levelStores = storesByLevel[level] || [];
                if (levelStores.length === 0) continue; 

                const requiredCount = Math.ceil(levelStores.length * (coveragePercent / 100));
                
                const achievedCount = levelStores.filter(s => 
                    sales.some(sale => sale.storeId === s.id && sale.productId === product.id)
                ).length;
                
                if (achievedCount < requiredCount) {
                    isProductTargetMet = false;
                    break;
                }
            }

            if (isProductTargetMet) {
                if (product.type === ProductType.DD) {
                    ddTargetsMet++;
                } else {
                    fokusTargetsMet++;
                }
            }
        }
        
        return {
            ddTargetsMet,
            fokusTargetsMet
        };
    }, [activeProducts, stores, sales]);
    
    const filteredStores = useMemo(() => {
        if (selectedDay === null) return stores;
        const plannedStoreIds = dailyVisitPlan[selectedDay] || [];
        return stores.filter(store => plannedStoreIds.includes(store.id));
    }, [stores, selectedDay, dailyVisitPlan]);

    const weekDays = useMemo(() => {
        const today = new Date();
        // Adjust to Monday (1) through Sunday (7, then mapped to 0)
        const currentDay = today.getDay() === 0 ? 6 : today.getDay() - 1; 
        const monday = new Date(today);
        monday.setDate(today.getDate() - currentDay);
        
        const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return days.map((name, index) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + index);
            return {
                dayIndex: index + 1,
                name: name,
                date: date.getDate(),
                isToday: today.toDateString() === date.toDateString(),
            };
        });
    }, []);

    return (
        <div>
            {showDeadlineWarning && (
                 <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
                    <strong className="font-bold">Perhatian!</strong>
                    <span className="block sm:inline ml-2">Tenggat waktu distribusi akan segera berakhir. Tingkatkan fokus!</span>
                </div>
            )}

            <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
            
             <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold">Rencana Kunjungan Harian</h3>
                    {selectedDay !== null && (
                         <button onClick={() => setIsPlanModalOpen(true)} className="flex items-center gap-2 bg-slate-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-slate-500 transition-colors">
                            <PencilSquareIcon />
                            <span>Atur Rencana</span>
                        </button>
                    )}
                </div>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {weekDays.map(day => {
                        const isSelected = selectedDay === day.dayIndex;
                        const storeCount = dailyVisitPlan[day.dayIndex]?.length || 0;
                        return (
                            <button
                                key={day.dayIndex}
                                onClick={() => setSelectedDay(prev => prev === day.dayIndex ? null : day.dayIndex)}
                                className={`p-4 rounded-xl text-center transition-all duration-200 transform hover:-translate-y-1 ${
                                    isSelected ? 'bg-brand-600 text-white shadow-lg ring-2 ring-brand-400' :
                                    day.isToday ? 'bg-slate-700/80 text-white ring-2 ring-slate-500' : 
                                    'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                                <div className="text-sm font-semibold opacity-80">{day.name}</div>
                                <div className="text-5xl font-bold my-1">{day.date}</div>
                                <div className="text-xs font-medium opacity-90">{storeCount} Toko</div>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4">Kinerja Mingguan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                        title="Toko Dikunjungi"
                        value={weeklyStats.thisWeek.visitedStores}
                        change={weeklyStats.thisWeek.visitedStores - weeklyStats.lastWeek.visitedStores}
                    />
                    <StatCard
                        title="Target DD Tercapai"
                        value={weeklyStats.thisWeek.ddAchieved}
                        change={weeklyStats.thisWeek.ddAchieved - weeklyStats.lastWeek.ddAchieved}
                    />
                    <StatCard
                        title="Target Fokus Tercapai"
                        value={weeklyStats.thisWeek.fokusAchieved}
                        change={weeklyStats.thisWeek.fokusAchieved - weeklyStats.lastWeek.fokusAchieved}
                    />
                </div>
            </div>
            
            <DailyPlanEditModal
                isOpen={isPlanModalOpen}
                onClose={() => setIsPlanModalOpen(false)}
                day={selectedDay!}
                dayName={weekDays.find(d => d.dayIndex === selectedDay)?.name || ''}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="bg-slate-800 p-6 rounded-lg">
                    <h3 className="text-slate-400">Total Toko</h3>
                    <p className="text-4xl font-bold">{stores.length}<span className="text-lg text-slate-300">/96</span></p>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg">
                    <h3 className="text-slate-400">Target Distribusi Drive Tercapai</h3>
                    <p className="text-4xl font-bold">{overallStats.ddTargetsMet}<span className="text-lg text-slate-300">/{ddProducts.length} produk</span></p>
                    <ProgressBar value={overallStats.ddTargetsMet} max={ddProducts.length || 1} />
                </div>
                <div className="bg-slate-800 p-6 rounded-lg">
                    <h3 className="text-slate-400">Target Item Fokus Tercapai</h3>
                     <p className="text-4xl font-bold">{overallStats.fokusTargetsMet}<span className="text-lg text-slate-300">/{fokusProducts.length} produk</span></p>
                     <ProgressBar value={overallStats.fokusTargetsMet} max={fokusProducts.length || 1} />
                </div>
            </div>

             <div className="space-y-12 mt-12 mb-12">
                {/* Distribusi Drive Section */}
                <div>
                    <div className="border-b border-slate-700 pb-2 mb-4">
                        <h3 className="text-2xl font-bold">Distribusi Drive</h3>
                        <p className="text-sm text-slate-400">Target jangka pendek untuk mendorong penetrasi produk baru atau promosi. Kecepatan adalah kunci!</p>
                    </div>
                    {ddProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {ddProducts.map(product => (
                                <TargetProgressChart key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-slate-800/50 rounded-lg">
                           <p className="text-slate-400">Tidak ada target Distribusi Drive yang aktif.</p>
                        </div>
                    )}
                </div>

                {/* Item Fokus Section */}
                <div>
                    <div className="border-b border-slate-700 pb-2 mb-4">
                        <h3 className="text-2xl font-bold">Item Fokus</h3>
                        <p className="text-sm text-slate-400">Produk prioritas jangka panjang yang menjadi andalan. Konsistensi dan cakupan luas adalah tujuan utama.</p>
                    </div>
                    {fokusProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {fokusProducts.map(product => (
                                <TargetProgressChart key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-12 bg-slate-800/50 rounded-lg">
                           <p className="text-slate-400">Tidak ada target Item Fokus yang aktif.</p>
                        </div>
                    )}
                </div>
            </div>

            <h3 className="text-2xl font-bold mb-4">
                {selectedDay !== null ? `Performa Toko: ${weekDays.find(d => d.dayIndex === selectedDay)?.name}` : 'Performa Semua Toko'}
            </h3>
             {filteredStores.length === 0 ? (
                <div className="text-center py-12 bg-slate-800 rounded-lg">
                    <p className="text-slate-400">
                        {selectedDay !== null ? "Tidak ada toko yang direncanakan untuk hari ini." : "Belum ada toko yang ditambahkan."}
                    </p>
                     <p className="text-slate-500">
                        {selectedDay !== null ? "Klik 'Atur Rencana' untuk menambahkan toko." : "Mulai dengan menambahkan toko di halaman 'Stores'."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredStores.map(store => <StoreCard key={store.id} store={store} />)}
                </div>
            )}
        </div>
    );
};

export default Dashboard;