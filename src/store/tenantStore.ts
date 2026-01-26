import { create } from 'zustand';
import { IUniversity } from '@/types';
import { api } from '@/lib/api';

interface TenantState {
  currentUniversity: IUniversity | null;
  universities: IUniversity[];
  setCurrentUniversity: (university: IUniversity | null) => void;
  loadUniversityMeta: (universityId: string) => Promise<void>;
  loadUniversities: () => Promise<void>;
}

export const useTenantStore = create<TenantState>((set, get) => ({
  currentUniversity: null,
  universities: [],

  setCurrentUniversity: (university: IUniversity | null) => {
    set({ currentUniversity: university });
    if (university) {
      // Update CSS variables for branding
      document.documentElement.style.setProperty('--color-primary', university.primaryColor || '#0055cc');
    }
  },

  loadUniversityMeta: async (universityId: string) => {
    try {
      const meta = await api.getUniversityMeta(universityId);
      const university = {
        id: universityId,
        name: meta.name,
        slug: meta.slug,
        domains: meta.domains,
        logoUrl: meta.logoUrl,
        primaryColor: meta.primaryColor,
      };
      get().setCurrentUniversity(university);
    } catch (error) {
      console.error('Failed to load university meta:', error);
    }
  },

  loadUniversities: async () => {
    try {
      const universities = await api.getUniversities();
      set({ universities });
    } catch (error) {
      console.error('Failed to load universities:', error);
    }
  },
}));

