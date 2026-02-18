import { values as initialValues } from './values';

export interface Value {
    id: string;
    name: string;
    description: string;
}

export interface Tier {
    label: string;
    color: string;
    description: string;
    values: Value[];
}

const STORAGE_KEY = 'personal-values-lab-state';

class AppState {
    tiers = $state<Tier[]>([
        { label: 'S', color: '#ff7f7f', description: 'Критически важные ценности', values: [] },
        { label: 'A', color: '#ff947fff', description: 'Очень важные ценности', values: [] },
        { label: 'B', color: '#ffd97fff', description: 'Важные ценности', values: [] },
        { label: 'C', color: '#fdff7fff', description: 'Второстепенные ценности', values: [] },
        { label: 'D', color: '#b0ff7fff', description: 'Наименее приоритетные ценности', values: [] }
    ]);

    pool = $state<Value[]>([...initialValues]);
    showHelp = $state(false);
    currentPhase = $state(1);
    top5 = $state<(Value | null)[]>([null, null, null, null, null]);
    personalDefinitions = $state<Record<string, string>>({});
    committedActions = $state<
        Record<string, { contact: number; filling: string; immediate: string }>
    >({});
    goalsVision = $state<
        Record<string, { longTerm: string; intermediate: string; actions: string }>
    >({});
    selectedCardId = $state<string | null>(null);

    customValueName = $state('');
    customValueDesc = $state('');

    constructor() {
        this.load();

        $effect.root(() => {
            $effect(() => {
                this.save();
            });

            // Pre-initialize actions and goals for valid top 5 values
            $effect(() => {
                for (const v of this.validTop5) {
                    if (!this.committedActions[v.id]) {
                        this.committedActions[v.id] = { contact: 5, filling: '', immediate: '' };
                    }
                    if (!this.goalsVision[v.id]) {
                        this.goalsVision[v.id] = { longTerm: '', intermediate: '', actions: '' };
                    }
                }
            });
        });
    }

    // Derived
    validTop5 = $derived(this.top5.filter((v): v is Value => v !== null));

    categorizedCandidates = $derived(
        this.tiers.flatMap((t) =>
            t.values
                .filter((v) => !this.top5.some((topV) => topV?.id === v.id))
                .map((v) => ({ ...v, tierLabel: t.label, tierColor: t.color }))
        )
    );

    canProceedToPhase2 = $derived(this.tiers.reduce((acc, t) => acc + t.values.length, 0) >= 5);

    canFinishRanking = $derived(this.top5.every((v) => v !== null));

    // Actions
    toggleHelp = () => {
        this.showHelp = !this.showHelp;
    };

    goToPhase = (p: number) => {
        if (p === 2 && !this.canProceedToPhase2) return;
        if (p > 2 && this.validTop5.length === 0) return;

        this.currentPhase = p;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    addCustomValue = () => {
        if (!this.customValueName.trim()) return;

        const newValue: Value = {
            id: `custom-${Date.now()}`,
            name: this.customValueName.trim(),
            description: this.customValueDesc.trim() || 'Ваша собственная ценность'
        };

        this.pool = [newValue, ...this.pool];
        this.customValueName = '';
        this.customValueDesc = '';
    };

    handleDragStart = (e: DragEvent, id: string) => {
        this.selectedCardId = null;
        e.dataTransfer?.setData('text/plain', id);
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
        }
    };

    handleDragOver = (e: DragEvent) => {
        e.preventDefault();
    };

    handleTop5Drop = (e: DragEvent, index: number) => {
        e.preventDefault();
        const id = e.dataTransfer?.getData('text/plain');
        if (!id) return;
        this.moveValueToTop5(id, index);
    };

    handlePoolDrop = (e: DragEvent) => {
        e.preventDefault();
        const id = e.dataTransfer?.getData('text/plain');
        if (!id) return;
        this.moveValue(id, null);
    };

    selectValue = (id: string) => {
        this.selectedCardId = this.selectedCardId === id ? null : id;
    };

    moveValue = (id: string, targetTierLabel: string | null) => {
        if (this.currentPhase !== 1) return;

        let value = this.findAndRemoveValue(id);
        if (!value) return;

        if (targetTierLabel === null) {
            this.pool.push(value);
            // Remove from top5 if it was there
            const topIndex = this.top5.findIndex((v) => v?.id === id);
            if (topIndex !== -1) {
                this.top5[topIndex] = null;
            }
        } else {
            const targetTier = this.tiers.find((t) => t.label === targetTierLabel);
            if (targetTier) {
                targetTier.values.push(value);
            }
        }
        this.selectedCardId = null;
    };

    findAndRemoveValue = (id: string): Value | undefined => {
        for (let i = 0; i < this.tiers.length; i++) {
            const foundIndex = this.tiers[i].values.findIndex((v) => v.id === id);
            if (foundIndex !== -1) {
                const v = this.tiers[i].values[foundIndex];
                this.tiers[i].values.splice(foundIndex, 1);
                return v;
            }
        }

        const foundIndex = this.pool.findIndex((v) => v.id === id);
        if (foundIndex !== -1) {
            const v = this.pool[foundIndex];
            this.pool.splice(foundIndex, 1);
            return v;
        }

        return undefined;
    };

    moveValueToTop5 = (id: string, index: number) => {
        const existingIndex = this.top5.findIndex((v) => v?.id === id);
        const targetOccupant = this.top5[index];

        if (existingIndex !== -1) {
            const sourceValue = this.top5[existingIndex]!;
            const newTop5 = [...this.top5];
            newTop5.splice(existingIndex, 1, null);

            if (!targetOccupant) {
                newTop5[index] = sourceValue;
            } else {
                const valuesOnly = this.top5.filter((v): v is Value => v !== null);
                const otherValues = valuesOnly.filter((v) => v.id !== id);
                otherValues.splice(index, 0, sourceValue);
                for (let i = 0; i < 5; i++) {
                    newTop5[i] = otherValues[i] || null;
                }
            }
            this.top5 = newTop5;
            this.selectedCardId = null;
            return;
        }

        // Find value without removing it from tiers
        let value: Value | undefined;
        for (const tier of this.tiers) {
            value = tier.values.find((v) => v.id === id);
            if (value) break;
        }

        if (!value) return;

        const valuesOnly = this.top5.filter((v): v is Value => v !== null);
        valuesOnly.splice(index, 0, value);

        if (valuesOnly.length > 5) {
            valuesOnly.pop(); // Simply remove from top5, it's still in its tier
        }

        const newTop5 = Array(5).fill(null);
        valuesOnly.forEach((v, i) => {
            newTop5[i] = v;
            if (!this.personalDefinitions[v.id]) {
                this.personalDefinitions[v.id] = '';
            }
        });
        this.top5 = newTop5;
        this.selectedCardId = null;
    };


    removeFromTop5 = (index: number) => {
        this.top5[index] = null;
    };

    handleReset = () => {
        if (window.confirm('Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.')) {
            localStorage.removeItem(STORAGE_KEY);
            window.location.reload();
        }
    };

    save = () => {
        if (typeof localStorage === 'undefined') return;
        const state = {
            tiers: this.tiers.map((t) => ({ label: t.label, values: t.values })),
            pool: this.pool,
            currentPhase: this.currentPhase,
            top5: this.top5,
            personalDefinitions: this.personalDefinitions,
            committedActions: this.committedActions,
            goalsVision: this.goalsVision
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    };

    load = () => {
        if (typeof localStorage === 'undefined') return;
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.tiers) {
                    this.tiers.forEach((t, i) => {
                        if (data.tiers[i]) t.values = data.tiers[i].values;
                    });
                }
                if (data.pool) this.pool = data.pool;
                if (data.currentPhase) this.currentPhase = data.currentPhase;
                if (data.top5) this.top5 = data.top5;
                if (data.personalDefinitions) this.personalDefinitions = data.personalDefinitions;
                if (data.committedActions) this.committedActions = data.committedActions;
                if (data.goalsVision) this.goalsVision = data.goalsVision;

                // Recovery logic: ensure Top 5 values are present in tiers or pool
                this.validTop5.forEach((v) => {
                    const inTiers = this.tiers.some((t) => t.values.some((val) => val.id === v.id));
                    const inPool = this.pool.some((val) => val.id === v.id);
                    if (!inTiers && !inPool) {
                        // Restore to S tier if lost
                        this.tiers[0].values.push(v);
                    }
                });
            } catch (e) {
                console.error('Failed to load state:', e);
            }
        }
    };
}

export const appState = new AppState();
