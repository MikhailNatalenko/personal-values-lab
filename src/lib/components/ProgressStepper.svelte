<script lang="ts">
	import { appState } from '$lib/state.svelte';

	interface Props {
		currentPhase: number;
	}

	let { currentPhase }: Props = $props();

	const steps = [
		{ id: 1, label: 'Сортировка' },
		{ id: 2, label: 'Топ-5' },
		{ id: 3, label: 'Действия' },
		{ id: 4, label: 'Видение' }
	];

	function isPhaseAvailable(p: number) {
		if (p === 1) return true;
		if (p === 2) return appState.canProceedToPhase2;
		if (p > 2) return appState.validTop5.length > 0;
		return false;
	}
</script>

<div class="stepper-container">
	<nav class="stepper" aria-label="Прогресс">
		{#each steps as step, i}
			{@const available = isPhaseAvailable(step.id)}
			<button
				class="step"
				class:active={currentPhase === step.id}
				class:completed={currentPhase > step.id}
				class:available
				onclick={() => appState.goToPhase(step.id)}
				disabled={!available}
				aria-current={currentPhase === step.id ? 'step' : undefined}
			>
				<div class="step-circle">
					{#if currentPhase > step.id}
						✓
					{:else}
						{step.id}
					{/if}
				</div>
				<span class="step-label">{step.label}</span>
			</button>
			{#if i < steps.length - 1}
				<div class="step-line" class:completed={currentPhase > step.id}></div>
			{/if}
		{/each}
	</nav>
</div>

<style>
	.stepper-container {
		display: flex;
		justify-content: center;
		margin-bottom: 2rem;
	}

	.stepper {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		width: 80px;
		opacity: 0.4;
		transition: all 0.3s ease;
		background: none;
		border: none;
		padding: 0;
		color: inherit;
		font-family: inherit;
	}

	.step.available {
		cursor: pointer;
	}

	.step.active {
		opacity: 1;
	}

	.step.completed {
		opacity: 0.8;
	}

	.step-circle {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 2px solid var(--text-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 0.9rem;
		background: rgba(0, 0, 0, 0.2);
		transition: all 0.3s ease;
	}

	.step.active .step-circle {
		border-color: #00d2ff;
		color: #00d2ff;
		box-shadow:
			0 0 15px rgba(0, 210, 255, 0.5),
			inset 0 0 5px rgba(0, 210, 255, 0.3);
		background: rgba(0, 210, 255, 0.1);
	}

	.step.completed .step-circle {
		border-color: var(--accent-primary);
		background: var(--accent-primary);
		color: white;
	}

	.step-label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.step.active .step-label {
		color: #00d2ff;
	}

	.step-line {
		width: 40px;
		height: 2px;
		background: rgba(255, 255, 255, 0.1);
		margin-bottom: 1.5rem; /* Offset for labels */
		transition: all 0.3s ease;
	}

	.step-line.completed {
		background: var(--accent-primary);
	}
</style>
