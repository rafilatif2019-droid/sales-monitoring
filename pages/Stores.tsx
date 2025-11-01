

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Store, StoreLevel } from '../types';
import { STORE_LEVELS } from '../constants';
import Modal from '../components/Modal';
import { PlusIcon, UploadIcon } from '../components/icons';

const StoreForm: React.FC<{
    onClose: () => void;
    storeToEdit?: Store;
}> = ({ onClose, storeToEdit }) => {
    const { addStore, updateStore } = useAppContext();
    const [name, setName] = useState('');
    const [level, setLevel] = useState<StoreLevel>(StoreLevel.Ritel);

    useEffect(() => {
        if (storeToEdit) {
            setName(storeToEdit.name);
            setLevel(storeToEdit.level);
        }
    }, [storeToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            alert("Nama toko tidak boleh kosong.");
            return;
        }

        if (storeToEdit) {
            updateStore({ ...storeToEdit, name, level });
        } else {
            addStore({ name, level });
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300">Nama Toko</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="mt-1 w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white"
                    required
                />
            </div>
            <div>
                <label htmlFor="level" className="block text-sm font-medium text-slate-300">Level Toko</label>
                <select
                    id="level"
                    value={level}
                    onChange={e => setLevel(e.target.value as StoreLevel)}
                    className="mt-1 w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white"
                >
                    {STORE_LEVELS.map(lvl => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                </select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 rounded-md hover:bg-slate-500">Batal</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 rounded-md hover:bg-brand-500">{storeToEdit ? 'Update' : 'Tambah'}</button>
            </div>
        </form>
    );
};

const Stores: React.FC = () => {
    const { stores, deleteStore, bulkAddStores } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [storeToEdit, setStoreToEdit] = useState<Store | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOpenModal = (store?: Store) => {
        setStoreToEdit(store);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setStoreToEdit(undefined);
        setIsModalOpen(false);
    };
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) {
                alert("File kosong atau tidak bisa dibaca.");
                return;
            }

            const rows = text.split('\n').map(row => row.trim()).filter(Boolean);
            const header = rows.shift()?.toLowerCase().replace(/\r/g, '');

            if (header !== 'name,level') {
                alert('Format CSV tidak valid. Header harus "name,level".');
                return;
            }

            const newStores: Omit<Store, 'id'>[] = [];
            const errorLines: number[] = [];

            const isValidStoreLevel = (level: string): level is StoreLevel => {
                return Object.values(StoreLevel).includes(level as StoreLevel);
            };
            
            rows.forEach((row, index) => {
                const [name, level] = row.split(',').map(cell => cell.trim());
                const lineNumber = index + 2;

                if (name && level && isValidStoreLevel(level)) {
                    newStores.push({ name, level });
                } else {
                    errorLines.push(lineNumber);
                }
            });

            if (newStores.length > 0) {
                bulkAddStores(newStores);
            }

            let summary = `Impor selesai. Berhasil menambahkan ${newStores.length} toko.`;
            if (errorLines.length > 0) {
                summary += `\n\n${errorLines.length} baris gagal diimpor (baris ke: ${errorLines.join(', ')}). Pastikan format level toko sudah benar.`;
            }
            alert(summary);
            
            if(event.target) {
                event.target.value = '';
            }
        };

        reader.readAsText(file);
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-3xl font-bold">Manajemen Toko</h2>
                <div className="flex gap-2">
                     <button onClick={handleImportClick} className="flex items-center gap-2 bg-slate-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-slate-500 transition-colors">
                        <UploadIcon />
                        <span>Import CSV</span>
                    </button>
                    <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-brand-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-brand-500 transition-colors">
                        <PlusIcon />
                        <span>Tambah Toko</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".csv" />
                </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg mb-6 text-sm text-slate-400">
                <p className="font-bold text-slate-300">💡 Tips untuk Import CSV:</p>
                <p>Buat file CSV dengan 2 kolom: `name` dan `level`. Baris pertama harus berisi header ini.</p>
                <p>Nilai yang valid untuk kolom `level` adalah: {STORE_LEVELS.join(', ')}.</p>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={storeToEdit ? 'Edit Toko' : 'Tambah Toko Baru'}>
                <StoreForm onClose={handleCloseModal} storeToEdit={storeToEdit} />
            </Modal>
            
            <div className="bg-slate-800 rounded-lg overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-slate-900">
                        <tr>
                            <th className="p-4 text-left text-sm font-semibold text-slate-300">Nama Toko</th>
                            <th className="p-4 text-left text-sm font-semibold text-slate-300">Level</th>
                            <th className="p-4 text-left text-sm font-semibold text-slate-300">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                    {stores.length > 0 ? (
                        stores.map(store => (
                            <tr key={store.id}>
                                <td className="p-4">{store.name}</td>
                                <td className="p-4">{store.level}</td>
                                <td className="p-4">
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleOpenModal(store)} className="text-brand-400 hover:text-brand-300">Edit</button>
                                        <button onClick={() => window.confirm(`Yakin ingin menghapus ${store.name}?`) && deleteStore(store.id)} className="text-red-400 hover:text-red-300">Hapus</button>
                                    </div>
                                </td>
                            </tr>
                        ))
                     ) : (
                        <tr>
                            <td colSpan={3} className="text-center p-8 text-slate-500">
                                Belum ada toko.
                            </td>
                        </tr>
                     )}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default Stores;