

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Settings, StoreLevel } from '../types';
import { STORE_LEVELS } from '../constants';
import { ArchiveBoxArrowDownIcon, ArchiveBoxArrowUpIcon, TrashIcon } from '../components/icons';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings, backupData, restoreData, resetApp } = useAppContext();
  const [formState, setFormState] = useState<Settings>(settings);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormState(settings);
  }, [settings]);

  const handleDiscountChange = (level: StoreLevel, value: string) => {
    const percentage = parseFloat(value) || 0;
    setFormState(prev => ({
      ...prev,
      discounts: {
        ...prev.discounts,
        [level]: percentage,
      },
    }));
  };
  
  const handleDeadlineChange = (value: string) => {
    setFormState(prev => ({
      ...prev,
      deadline: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formState);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    restoreData(file);
    // Reset file input value to allow re-uploading the same file
    if(event.target) {
        event.target.value = '';
    }
  };


  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Pusat Kontrol</h2>
      
      <div className="space-y-12">
        {/* Core Configuration Form */}
        <form onSubmit={handleSubmit} className="space-y-8 bg-slate-800 p-8 rounded-lg">
          <div>
            <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2">Konfigurasi Inti</h3>
            <p className="text-sm text-slate-400 mb-6">Atur logika bisnis utama untuk perhitungan diskon dan tenggat waktu.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3">Skema Diskon</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {STORE_LEVELS.map(level => (
                <div key={level}>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{level}</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      step="0.01"
                      value={formState.discounts[level]}
                      onChange={(e) => handleDiscountChange(level, e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-l-md p-2 text-white"
                    />
                    <span className="bg-slate-600 p-2 rounded-r-md">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-3">Tenggat Waktu Distribusi</h4>
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-slate-300 mb-1">Tanggal Berakhir</label>
              <input
                type="date"
                id="deadline"
                value={formState.deadline}
                onChange={(e) => handleDeadlineChange(e.target.value)}
                className="w-full md:w-1/2 bg-slate-700 border border-slate-600 rounded-md p-2 text-white"
              />
              <p className="text-xs text-slate-400 mt-2">Notifikasi akan muncul di dashboard 7 hari sebelum tanggal ini.</p>
            </div>
          </div>
          
          <div className="flex justify-end items-center border-t border-slate-700 pt-6">
              {isSaved && <span className="text-green-400 mr-4 transition-opacity duration-300">Konfigurasi disimpan!</span>}
              <button type="submit" className="bg-brand-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-brand-500 transition-colors">
                  Simpan Konfigurasi
              </button>
          </div>
        </form>

        {/* Data Management Zone */}
        <div className="bg-slate-800/50 p-8 rounded-lg border-2 border-red-900/50">
          <h3 className="text-xl font-bold text-red-400 mb-2">Zona Manajemen Data</h3>
          <p className="text-slate-400 text-sm mb-6">Aksi di bawah ini akan memengaruhi seluruh data aplikasi. Lakukan dengan hati-hati.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={backupData} className="flex flex-col items-center justify-center gap-2 bg-slate-700 text-slate-200 font-semibold py-4 px-4 rounded-md hover:bg-slate-600 transition-colors">
                  <ArchiveBoxArrowDownIcon />
                  <span>Backup Seluruh Data</span>
              </button>
              <button onClick={handleRestoreClick} className="flex flex-col items-center justify-center gap-2 bg-slate-700 text-slate-200 font-semibold py-4 px-4 rounded-md hover:bg-slate-600 transition-colors">
                  <ArchiveBoxArrowUpIcon />
                  <span>Restore Data</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileRestore} className="hidden" accept=".json" />
              <button onClick={resetApp} className="flex flex-col items-center justify-center gap-2 bg-red-900/50 text-red-300 font-semibold py-4 px-4 rounded-md hover:bg-red-900/80 transition-colors">
                  <TrashIcon />
                  <span>Reset Aplikasi</span>
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;