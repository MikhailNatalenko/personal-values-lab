<script lang="ts">
	import { fade } from 'svelte/transition';
	import ValueCard from './ValueCard.svelte';
	import type { Value } from '$lib/values';

	interface Props {
		top5: (Value | null)[];
		personalDefinitions: Record<string, string>;
		categorizedValues: {
			id: string;
			name: string;
			description: string;
			tierLabel: string;
			tierColor: string;
		}[];
		onDrop: (e: DragEvent, index: number) => void;
		onRemove: (index: number) => void;
		onFinish: () => void;
		onBack: () => void;
		canFinish: boolean;
		handleDragStart: (e: DragEvent, id: string) => void;
		handleDragOver: (e: DragEvent) => void;
	}

	let {
		top5 = $bindable(),
		personalDefinitions = $bindable(),
		categorizedValues,
		onDrop,
		onRemove,
		onFinish,
		onBack,
		canFinish,
		handleDragStart,
		handleDragOver
	}: Props = $props();
</script>

<div class="phase2-container" transition:fade>
	<div class="top5-header">
		<button class="btn btn-secondary" onclick={onBack}>← Назад</button>
		<h2>Топ-5 Значимых Ценностей</h2>
		{#if canFinish}
			<button class="btn btn-primary" onclick={onFinish}>Готово →</button>
		{/if}
	</div>

	<div class="top5-slots">
		{#each top5 as val, i}
			<div
				class="slot glass"
				class:has-value={!!val}
				ondragover={handleDragOver}
				ondrop={(e) => onDrop(e, i)}
				role="listitem"
			>
				<div class="slot-num">{i + 1}</div>
				<div class="slot-content">
					{#if val}
						<div class="selected-value-expanded" transition:fade>
							<div class="value-header">
								<span class="value-name">{val.name}</span>
								<button class="remove-btn" onclick={() => onRemove(i)}>×</button>
							</div>
							<textarea
								class="glass personal-def"
								placeholder="Что эта ценность значит для меня лично? Как я хочу её проявлять?"
								bind:value={personalDefinitions[val.id]}
							></textarea>
						</div>
					{:else}
						<span class="slot-placeholder">Перетащите сюда наиболее значимую ценность...</span>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<section class="categorized-pool-section">
		<h3>Ваш выбор (Тиры S и A)</h3>
		<div class="categorized-list glass">
			{#each categorizedValues as val (val.id)}
				{#if !top5.find((t) => t?.id === val.id)}
					<div class="value-card-wrapper" style="--tier-color: {val.tierColor}">
						<ValueCard
							id={val.id}
							name={val.name}
							description={val.description}
							onDragStart={handleDragStart}
						/>
						<span class="tier-badge" style="background: {val.tierColor}">{val.tierLabel}</span>
					</div>
				{/if}
			{/each}
		</div>
	</section>
</div>

<style>
	.phase2-container {
		width: 100%;
	}

	.top5-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		margin-bottom: 3rem;
	}

	.top5-slots {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 600px;
		margin: 0 auto 4rem;
	}

	.slot {
		display: flex;
		align-items: center;
		min-height: 70px;
		padding: 0.5rem;
		gap: 1rem;
		transition: all 0.2s ease;
	}

	.slot.has-value {
		min-height: 120px;
	}

	.slot-num {
		width: 40px;
		height: 40px;
		background: var(--accent-primary);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		flex-shrink: 0;
	}

	.slot-content {
		flex-grow: 1;
		display: flex;
		align-items: center;
	}

	.slot-placeholder {
		opacity: 0.3;
		font-style: italic;
		padding-left: 1rem;
	}

	.selected-value-expanded {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
	}

	.value-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.value-name {
		font-weight: 700;
		font-size: 1.1rem;
		color: var(--accent-primary);
	}

	.personal-def {
		width: 100%;
		min-height: 80px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		padding: 0.75rem;
		color: var(--text-primary);
		font-size: 0.9rem;
		resize: vertical;
		font-family: inherit;
		outline: none;
		transition: border-color 0.2s;
	}

	.personal-def:focus {
		border-color: var(--accent-primary);
	}

	.remove-btn {
		background: none;
		border: none;
		color: var(--text-secondary);
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0 0.5rem;
		line-height: 1;
	}

	.remove-btn:hover {
		color: #ff4757;
	}

	.categorized-pool-section h3 {
		margin-bottom: 1.5rem;
		opacity: 0.8;
		text-align: left;
	}

	.categorized-list {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		padding: 2rem;
		min-height: 150px;
	}

	.value-card-wrapper {
		position: relative;
	}

	.tier-badge {
		position: absolute;
		top: -8px;
		right: -8px;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.7rem;
		font-weight: bold;
		color: rgba(0, 0, 0, 0.7);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		z-index: 5;
	}
</style>
