<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Value } from '$lib/values';

	interface Props {
		values: Value[];
		goalsVision: Record<string, { longTerm: string; intermediate: string; actions: string }>;
		onBack: () => void;
		onFinish: () => void;
	}

	let { values, goalsVision = $bindable(), onBack, onFinish }: Props = $props();
</script>

<div class="phase-container" transition:fade>
	<div class="phase-header">
		<button class="btn btn-secondary" onclick={onBack}>← Назад</button>
		<h2>Этап 4: Цели и видение</h2>
		<button class="btn btn-primary" onclick={onFinish}>Завершить →</button>
	</div>

	<div class="goals-list">
		{#each values as val (val.id)}
			{@const goal = goalsVision[val.id] || { longTerm: '', intermediate: '', actions: '' }}
			<div class="goal-card glass">
				<div class="value-title">
					<h3>{val.name}</h3>
				</div>

				<div class="goal-group">
					<label>
						Выберите долгосрочную большую цель, которая будет улучшать контакт с этой ценностью
						(наполнять вашу жизнь ею).:
						<textarea
							class="glass"
							placeholder="К чему вы стремитесь в перспективе нескольких лет?"
							oninput={(e) => {
								if (!goalsVision[val.id])
									goalsVision[val.id] = { longTerm: '', intermediate: '', actions: '' };
								goalsVision[val.id].longTerm = e.currentTarget.value;
							}}
							value={goal.longTerm}
						></textarea>
					</label>
				</div>

				<div class="goal-group">
					<label>
						Какие промежуточные цели приблизят вас к ней?
						<textarea
							class="glass"
							placeholder="Шаги на ближайшие месяцы..."
							oninput={(e) => {
								if (!goalsVision[val.id])
									goalsVision[val.id] = { longTerm: '', intermediate: '', actions: '' };
								goalsVision[val.id].intermediate = e.currentTarget.value;
							}}
							value={goal.intermediate}
						></textarea>
					</label>
				</div>

				<div class="goal-group">
					<label>
						Какие простые понятные действия поддержат это движение?
						<textarea
							class="glass"
							placeholder="Что вы будете делать регулярно?"
							oninput={(e) => {
								if (!goalsVision[val.id])
									goalsVision[val.id] = { longTerm: '', intermediate: '', actions: '' };
								goalsVision[val.id].actions = e.currentTarget.value;
							}}
							value={goal.actions}
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
	.goals-list {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		max-width: 800px;
		margin: 0 auto;
	}
	.goal-card {
		padding: 2rem;
		text-align: left;
	}
	.value-title h3 {
		color: var(--accent-primary);
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
	}
	.goal-group {
		margin-bottom: 1.5rem;
	}
	.goal-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		font-size: 0.95rem;
	}
	textarea {
		width: 100%;
		min-height: 80px;
		padding: 0.75rem;
		border-radius: 8px;
		margin-top: 0.5rem;
		font-family: inherit;
		resize: vertical;
	}
</style>
