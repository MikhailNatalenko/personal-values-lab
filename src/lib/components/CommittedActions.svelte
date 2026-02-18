<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Value } from '$lib/values';

	interface Props {
		values: Value[];
		committedActions: Record<string, { contact: number; filling: string; immediate: string }>;
		onBack: () => void;
		onNext: () => void;
	}

	let { values, committedActions = $bindable(), onBack, onNext }: Props = $props();
</script>

<div class="phase-container" transition:fade>
	<div class="phase-header">
		<button class="btn btn-secondary" onclick={onBack}>← Назад</button>
		<h2>Этап 3: Ответственные действия</h2>
		<button class="btn btn-primary" onclick={onNext}>Продолжить →</button>
	</div>

	<div class="actions-list">
		{#each values as val (val.id)}
			{@const action = committedActions[val.id] || { contact: 5, filling: '', immediate: '' }}
			<div class="action-card glass">
				<div class="value-title">
					<h3>{val.name}</h3>
				</div>

				<div class="action-group">
					<label>
						Насколько хороший контакт с этой ценностью сейчас? (0–10)
						<div class="slider-container">
							<input
								type="range"
								min="0"
								max="10"
								step="1"
								oninput={(e) => {
									if (!committedActions[val.id])
										committedActions[val.id] = { contact: 5, filling: '', immediate: '' };
									committedActions[val.id].contact = parseInt(e.currentTarget.value);
								}}
								value={action.contact}
							/>
							<span class="slider-value">{action.contact}</span>
						</div>
					</label>
				</div>

				<div class="action-group">
					<label>
						Что наполняет вашу жизнь этой ценностью? Какие действия или события?
						<textarea
							class="glass"
							placeholder="Например: прогулки, общение с близкими, помощь коллегам..."
							oninput={(e) => {
								if (!committedActions[val.id])
									committedActions[val.id] = { contact: 5, filling: '', immediate: '' };
								committedActions[val.id].filling = e.currentTarget.value;
							}}
							value={action.filling}
						></textarea>
					</label>
				</div>

				<div class="action-group">
					<label>
						Что можно сделать уже сейчас или в ближайшее время (простое действие)?
						<textarea
							class="glass"
							placeholder="Например: позвонить маме, сходить в спортзал, прочитать 10 страниц..."
							oninput={(e) => {
								if (!committedActions[val.id])
									committedActions[val.id] = { contact: 5, filling: '', immediate: '' };
								committedActions[val.id].immediate = e.currentTarget.value;
							}}
							value={action.immediate}
						></textarea>
					</label>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.phase-container {
		width: 100%;
	}
	.phase-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}
	.actions-list {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		max-width: 800px;
		margin: 0 auto;
	}
	.action-card {
		padding: 2rem;
		text-align: left;
	}
	.value-title h3 {
		color: var(--accent-primary);
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
	}
	.action-group {
		margin-bottom: 1.5rem;
	}
	.action-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		font-size: 0.95rem;
	}
	.slider-container {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: 0.5rem;
	}
	input[type='range'] {
		flex-grow: 1;
	}
	.slider-value {
		font-weight: 700;
		font-size: 1.2rem;
		color: var(--accent-primary);
		min-width: 1.5rem;
	}
	textarea {
		width: 100%;
		min-height: 80px;
		padding: 0.75rem;
		border-radius: 12px;
		margin-top: 0.5rem;
		font-family: inherit;
		resize: vertical;
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: all 0.3s ease;
	}
	textarea:focus {
		outline: none;
		border-color: var(--accent-primary);
		background: rgba(255, 255, 255, 0.05);
	}
	textarea::placeholder {
		color: rgba(255, 255, 255, 0.3);
	}
</style>
