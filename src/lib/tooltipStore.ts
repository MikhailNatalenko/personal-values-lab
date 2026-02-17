import { writable } from 'svelte/store';

export interface TooltipState {
    active: boolean;
    name: string;
    description: string;
    x: number;
    y: number;
}

export const tooltip = writable<TooltipState>({
    active: false,
    name: '',
    description: '',
    x: 0,
    y: 0
});
