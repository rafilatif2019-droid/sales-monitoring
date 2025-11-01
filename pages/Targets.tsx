
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Product, ProductType, StoreLevel } from '../types';
import Modal from '../components/Modal';
import { PlusIcon } from '../components/icons';
import { STORE_LEVELS } from '../constants';

const ProductForm: React.FC<{
    onClose: () => void;
    productToEdit?: Product;
}> = ({ onClose, productToEdit }) => {
    const { addProduct, updateProduct } = useAppContext();
    const [name, setName] = useState('');
    const [type, setType] = useState<ProductType>(ProductType.DD);
    const [basePrice, setBasePrice] = useState(0);
    const [image, setImage] = useState<string | undefined>(undefined);
    const [targetCoverage, setTargetCoverage] = useState<{ [key in StoreLevel]?: number }>({});

    useEffect(() => {
        if (productToEdit) {
            setName(productToEdit.name);
            setType(productToEdit.type);
            setBasePrice(productToEdit.basePrice);
            setImage(productToEdit.image);
            setTargetCoverage(productToEdit.targetCoverage || {});
        }
    }, [productToEdit]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleCoverageChange = (level: StoreLevel, value: string) => {
        const percentage = parseInt(value, 10);
        setTargetCoverage(prev => {
            const newCoverage = { ...prev };
            if (isNaN(percentage) || value === '') {
                delete newCoverage[level];
            } else {
                newCoverage[level] = Math.max(0, Math.min(100, percentage));
            }
            return newCoverage;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || basePrice <= 0) {
            alert("Nama produk dan harga dasar harus diisi.");
            return;
        }

        const productData = { name, type, basePrice, image, targetCoverage };
        if (productToEdit) {
            updateProduct({ ...productToEdit, ...productData });
        } else {
            addProduct(productData);
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
                <label className="block text-sm font-medium text-slate-300">Nama Produk</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300">Tipe Target</label>
                <select value={type} onChange={e => setType(e.target.value as ProductType)} className="mt-1 w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white">
                    <option value={ProductType.DD}>Distribusi Drive</option>
                    <option value={ProductType.Fokus}>Item Fokus</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300">Harga Dasar</label>
                <input type="number" value={basePrice} onChange={e => setBasePrice(parseFloat(e.target.value))} className="mt-1 w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white" required />
            </div>
             <div>
                <h4 className="text-lg font-semibold text-slate-300 mb-2 mt-4 border-t border-slate-700 pt-4">Target Cakupan (%)</h4>
                <p className="text-xs text-slate-400 mb-3">Tentukan persentase minimum toko per level yang harus mengambil produk ini.</p>
                <div className="grid grid-cols-2 gap-4">
                    {STORE_LEVELS.map(level => (
                        <div key={level}>
                            <label className="block text-sm font-medium text-slate-400 mb-1">{level}</label>
                            <div className="flex items-center">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="-"
                                    value={targetCoverage[level] || ''}
                                    onChange={e => handleCoverageChange(level, e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-l-md p-2 text-white"
                                />
                                <span className="bg-slate-600 p-2 rounded-r-md">%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300">Gambar Produk</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="mt-1 w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"/>
                {image && <img src={image} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-md" />}
            </div>
            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-700 sticky bottom-0 bg-slate-800 py-4 -mx-6 px-6">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 rounded-md hover:bg-slate-500">Batal</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 rounded-md hover:bg-brand-500">{productToEdit ? 'Update' : 'Tambah'}</button>
            </div>
        </form>
    );
};

const ProductList: React.FC<{ products: Product[], title: string, description: string, onEdit: (p: Product) => void, onToggleStatus: (id: string) => void }> = ({ products, title, description, onEdit, onToggleStatus }) => (
    <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-lg">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-slate-400 mb-4">{description}</p>
        {products.length === 0 ? (
            <p className="text-slate-500">Belum ada produk untuk target ini.</p>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
                <div key={p.id} className={`bg-slate-900 rounded-lg p-4 flex flex-col justify-between transition-opacity ${!p.isActive ? 'opacity-50' : ''}`}>
                    <div>
                        {p.image ? <img src={p.image} alt={p.name} className="w-full h-32 object-cover rounded-md mb-2" /> : <div className="w-full h-32 bg-slate-700 rounded-md mb-2 flex items-center justify-center text-slate-500">No Image</div>}
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold">{p.name}</h4>
                            {!p.isActive && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">Nonaktif</span>}
                        </div>
                        <p className="text-sm text-slate-400 mb-2">Rp {p.basePrice.toLocaleString()}</p>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-xs">
                            {Object.entries(p.targetCoverage).length > 0 ? (
                                Object.entries(p.targetCoverage).map(([level, percent]) => (
                                    <div key={level} className="flex justify-between text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                        <span className="font-medium">{level}:</span>
                                        <span className="font-bold text-slate-300">{percent}%</span>
                                    </div>
                                ))
                            ) : (
                                <p className="col-span-2 text-slate-500 text-xs italic">Belum ada target.</p>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-2 mt-4 pt-2 border-t border-slate-800">
                        <button onClick={() => onEdit(p)} className="text-sm text-brand-400 hover:text-brand-300">Edit</button>
                        <button 
                            onClick={() => onToggleStatus(p.id)} 
                            className={`text-sm font-semibold ${p.isActive ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}`}
                        >
                           {p.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
        )}
    </div>
);


const Targets: React.FC = () => {
    const { products, toggleProductStatus } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | undefined>(undefined);
    
    const ddProducts = products.filter(p => p.type === ProductType.DD);
    const fokusProducts = products.filter(p => p.type === ProductType.Fokus);

    const handleOpenModal = (product?: Product) => {
        setProductToEdit(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setProductToEdit(undefined);
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Manajemen Target Produk</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-brand-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-brand-500 transition-colors">
                    <PlusIcon />
                    <span>Tambah Produk</span>
                </button>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={productToEdit ? 'Edit Produk Target' : 'Tambah Produk Target Baru'}>
                <ProductForm onClose={handleCloseModal} productToEdit={productToEdit} />
            </Modal>
            
            <div className="space-y-8">
                <ProductList 
                    products={ddProducts} 
                    title="Distribusi Drive" 
                    description="Target jangka pendek (biasanya 2 mingguan) untuk mendorong penetrasi produk baru atau promosi."
                    onEdit={handleOpenModal} 
                    onToggleStatus={toggleProductStatus} 
                />
                <ProductList 
                    products={fokusProducts} 
                    title="Item Fokus" 
                    description="Produk prioritas jangka panjang yang menjadi andalan dan harus selalu tersedia di toko."
                    onEdit={handleOpenModal} 
                    onToggleStatus={toggleProductStatus} 
                />
            </div>
        </div>
    );
};

export default Targets;
