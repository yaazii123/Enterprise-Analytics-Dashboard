import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { DashboardFilters, User } from '@/types';
import { presetToRange } from '@/utils/date';
import { storage } from '@/utils/storage';
const initialState = {
  user: storage.get<User | null>('northstar.user', null),
  theme: storage.get<string>('northstar.theme', 'light'),
  collapsed: false,
  compact: storage.get<boolean>('northstar.compact', false),
  filters: { preset: '30d', range: presetToRange('30d'), regions: [], categories: [] } as DashboardFilters,
};
const slice = createSlice({ name: 'dashboard', initialState, reducers: {
  login(state, action: PayloadAction<User>) { state.user = action.payload; },
  logout(state) { state.user = null; },
  theme(state, action: PayloadAction<string>) { state.theme = action.payload; },
  sidebar(state) { state.collapsed = !state.collapsed; },
  compact(state, action: PayloadAction<boolean>) { state.compact = action.payload; },
  filters(state, action: PayloadAction<Partial<DashboardFilters>>) { state.filters = { ...state.filters, ...action.payload }; },
}});
export const actions = slice.actions;
export const store = configureStore({ reducer: slice.reducer });
store.subscribe(() => { const s = store.getState(); storage.set('northstar.user', s.user); storage.set('northstar.theme', s.theme); storage.set('northstar.compact', s.compact); });
export const useAppDispatch = useDispatch.withTypes<typeof store.dispatch>();
export const useAppSelector = useSelector.withTypes<ReturnType<typeof store.getState>>();
