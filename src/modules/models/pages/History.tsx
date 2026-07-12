"use client";
import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import Link from 'next/link';
import { Calendar, ChevronRight, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { DocumentPreview } from '../components/DocumentPreview';
import { toast } from '@/components/ui/toast';

export const History = () => {
  const { models, loadModelsFromStorage, deleteModel, renameModel } = useStore();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');

  useEffect(() => {
    loadModelsFromStorage();
  }, []);

  const startRename = (id: string, current: string) => {
    setEditingId(id);
    setDraftName(current);
    setConfirmingId(null);
  };

  const commitRename = (id: string) => {
    if (draftName.trim() && draftName.trim() !== models.find((m) => m.id === id)?.name) {
      renameModel(id, draftName);
      toast('Model renamed');
    }
    setEditingId(null);
  };

  const confirmDelete = (id: string, name: string) => {
    deleteModel(id);
    setConfirmingId(null);
    toast(`Deleted "${name}"`);
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-8 pb-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 mb-2">Models</h1>
            <p className="text-stone-600">3D models generated from your engineering drawings.</p>
          </div>
          <Link
            href="/models/new"
            className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white font-bold px-5 py-3 rounded-lg shadow-lg shadow-amber-700/20 transition-all shrink-0"
          >
            <Plus className="w-5 h-5" /> New model
          </Link>
        </div>

        {models.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-300">
            <p className="text-stone-500 mb-4">No models yet.</p>
            <Link href="/models/new" className="text-amber-700 font-medium hover:underline">Scan a drawing to create your first model</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {models.map((model) => (
              <div key={model.id} className="group relative bg-white rounded-xl border border-stone-300 overflow-hidden hover:shadow-lg hover:border-amber-700 transition-all">
                <Link href={`/models/${model.id}`} className="block">
                  <div className="aspect-square bg-stone-100 relative overflow-hidden">
                    <DocumentPreview src={model.originalImage} alt={model.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>

                {/* Hover actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startRename(model.id, model.name)}
                    className="p-2 rounded-lg bg-white/95 border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-white shadow-sm transition-colors"
                    title="Rename"
                    aria-label={`Rename ${model.name}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { setConfirmingId(model.id); setEditingId(null); }}
                    className="p-2 rounded-lg bg-white/95 border border-stone-200 text-stone-500 hover:text-red-600 hover:bg-red-50 shadow-sm transition-colors"
                    title="Delete"
                    aria-label={`Delete ${model.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Delete confirm overlay */}
                {confirmingId === model.id && (
                  <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-sm font-semibold text-stone-900 mb-1">Delete this model?</p>
                    <p className="text-xs text-stone-500 mb-4 truncate max-w-full">&ldquo;{model.name}&rdquo; can&apos;t be recovered.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => confirmDelete(model.id, model.name)}
                        className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="px-3.5 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-4">
                  {editingId === model.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        value={draftName}
                        autoFocus
                        onChange={(e) => setDraftName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitRename(model.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="flex-1 min-w-0 border border-amber-400 rounded-md px-2 py-1 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                        aria-label="Model name"
                      />
                      <button onClick={() => commitRename(model.id)} className="p-1.5 rounded-md text-teal-600 hover:bg-teal-50" title="Save" aria-label="Save name">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 rounded-md text-stone-400 hover:bg-stone-100" title="Cancel" aria-label="Cancel rename">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <Link href={`/models/${model.id}`} className="block">
                      <h3 className="font-bold text-stone-900 truncate">{model.name}</h3>
                    </Link>
                  )}
                  <div className="flex items-center justify-between mt-2 text-xs text-stone-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(model.timestamp).toLocaleDateString()}
                    </span>
                    <ChevronRight className="w-4 h-4 text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-5px] group-hover:translate-x-0" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
