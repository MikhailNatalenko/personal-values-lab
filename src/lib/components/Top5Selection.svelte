<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
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
		selectedCardId?: string | null;
		onDrop: (e: DragEvent, index: number) => void;
		moveValueToTop5?: (id: string, index: number) => void;
		onRemove: (index: number) => void;
		onFinish: () => void;
		onBack: () => void;
		canFinish: boolean;
		handleDragStart: (e: DragEvent, id: string) => void;
		handleDragOver: (e: DragEvent) => void;
		onClickValue?: (id: string) => void;
	}

	let {
		top5 = $bindable(),
		personalDefinitions = $bindable(),
		categorizedValues,
		selectedCardId = null,
		onDrop,
		moveValueToTop5,
		onRemove,
		onFinish,
		onBack,
		canFinish,
		handleDragStart,
		handleDragOver,
		onClickValue
	}: Props = $props();

	let dragOverIndex = $state<number | null>(null);
	let isGlobalDragging = $state(false);

	function onLocalDragStart(e: DragEvent, id: string) {
		isGlobalDragging = true;
		document.body.style.cursor = 'grabbing';
		handleDragStart(e, id);
	}

	function onLocalDragEnd() {
		isGlobalDragging = false;
		dragOverIndex = null;
		document.body.style.cursor = 'default';
	}

	function onLocalDragOver(e: DragEvent, index: number) {
		e.preventDefault();
		dragOverIndex = index;
		handleDragOver(e);
	}

	function onLocalDrop(e: DragEvent, index: number) {
		onLocalDragEnd();
		onDrop(e, index);
	}
</script>

<div class="phase2-container" transition:fade>
	<div class="top5-header">
		<button class="btn btn-secondary" onclick={onBack}>← Назад</button>
		<div class="title-with-status">
			<h2>Топ-5 Ценностей</h2>
			{#if selectedCardId}
				<div class="selection-status pulse-glow">
					Выбрана: {categorizedValues.find((v) => v.id === selectedCardId)?.name || '...'}
				</div>
			{/if}
		</div>
		{#if canFinish}
			<button class="btn btn-primary" onclick={onFinish}>Готово →</button>
		{/if}
	</div>

	<div class="main-layout">
		<div class="top5-slots">
			{#each top5 as val, i (val?.id ?? `empty-${i}`)}
				<div
					class="slot-wrapper"
					class:show-line={dragOverIndex === i}
					ondragenter={() => (dragOverIndex = i)}
					animate:flip={{ duration: 1000 }}
				>
					<div
						class="slot glass"
						class:selected={val && selectedCardId === val.id}
						class:active-target={!!selectedCardId && (!val || selectedCardId !== val.id)}
						class:is-dragging-source={isGlobalDragging && val && selectedCardId === val.id}
						draggable={!!val}
						ondragstart={(e) => val && onLocalDragStart(e, val.id)}
						ondragend={onLocalDragEnd}
						ondragover={(e) => onLocalDragOver(e, i)}
						ondrop={(e) => onLocalDrop(e, i)}
						onclick={(e) => {
							// Don't trigger if clicking inside the textarea
							if (e.target instanceof HTMLTextAreaElement) return;

							if (selectedCardId && (!val || selectedCardId !== val.id)) {
								moveValueToTop5?.(selectedCardId, i);
							}
						}}
						role="listitem"
					>
						<div class="slot-num">{i + 1}</div>
						<div class="slot-content">
							{#if val}
								<div class="selected-value-expanded" transition:slide>
									<div class="value-header">
										<span class="value-name">{val.name}</span>
										<button class="remove-btn" onclick={() => onRemove(i)}>×</button>
									</div>
									<textarea
										class="glass personal-def"
										placeholder="Что эта ценность значит для меня лично? Как я хочу её проявлять?"
										bind:value={personalDefinitions[val.id]}
										onclick={(e) => e.stopPropagation()}
									></textarea>
								</div>
							{:else}
								<span class="slot-placeholder">Выберите наиболее значимую ценность...</span>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>

		<aside class="pool-section glass">
			<div class="section-header">
				<h2 class="section-title">Ваш выбор</h2>
			</div>
			<div class="pool-container" ondragover={() => (dragOverIndex = null)}>
				{#each categorizedValues.filter((v) => !top5.find((t) => t?.id === v.id)) as val (val.id)}
					<div
						class="value-card-wrapper"
						style="--tier-color: {val.tierColor}"
						animate:flip={{ duration: 800 }}
						ondragstart={(e) => onLocalDragStart(e, val.id)}
						ondragend={onLocalDragEnd}
					>
						<ValueCard
							id={val.id}
							name={val.name}
							description={val.description}
							onDragStart={onLocalDragStart}
							isSelected={selectedCardId === val.id}
							onClick={onClickValue}
						/>
						<span class="tier-badge" style="background: {val.tierColor}">{val.tierLabel}</span>
					</div>
				{/each}
				{#if categorizedValues.filter((v) => !top5.find((t) => t?.id === v.id)).length === 0}
					<p class="empty-msg">Всё распределено</p>
				{/if}
			</div>
		</aside>
	</div>
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
		flex-grow: 1;
	}

	.main-layout {
		display: grid;
		grid-template-columns: 1fr 340px;
		gap: 2rem;
		align-items: start;
		max-width: 1400px;
		margin: 0 auto;
	}

	.pool-section {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 200px);
		position: sticky;
		top: 2rem;
		padding: 0;
		overflow: hidden;
		border-style: solid;
	}

	.pool-section .section-header {
		padding: 1.5rem;
		border-bottom: 1px solid var(--border-light);
		background: rgba(255, 255, 255, 0.02);
	}

	.section-title {
		font-size: 1.25rem;
		margin: 0;
		color: var(--text-primary);
	}

	.pool-container {
		flex-grow: 1;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: var(--accent-primary) transparent;
	}

	.pool-container::-webkit-scrollbar {
		width: 4px;
	}

	.pool-container::-webkit-scrollbar-thumb {
		background: var(--accent-primary);
		border-radius: 4px;
	}

	.empty-msg {
		text-align: center;
		padding: 2rem;
		opacity: 0.5;
		font-style: italic;
	}

	@media (max-width: 1100px) {
		.main-layout {
			grid-template-columns: 1fr;
		}
		.pool-section {
			position: static;
			height: auto;
			max-height: 400px;
		}
		.pool-container {
			flex-direction: row;
			flex-wrap: wrap;
		}
	}

	.slot-wrapper {
		position: relative;
		padding-top: 4px; /* Space for the line */
	}

	.slot-wrapper.show-line::before {
		content: '';
		position: absolute;
		top: -4px;
		left: 0;
		right: 0;
		height: 4px;
		background: #00d2ff;
		box-shadow: 0 0 10px #00d2ff;
		border-radius: 2px;
		z-index: 20;
		pointer-events: none;
	}

	.slot {
		display: flex;
		align-items: center;
		min-height: 70px;
		padding: 0.5rem;
		gap: 1rem;
		transition:
			transform 0.2s ease,
			border-color 0.2s,
			background 0.2s;
	}

	.slot.is-dragging-source {
		opacity: 0.4;
		transform: scale(0.98);
		border-style: dotted;
	}

	.title-with-status {
		text-align: center;
		flex-grow: 1;
	}

	.selection-status {
		color: #00d2ff;
		font-weight: bold;
		font-size: 0.9rem;
		margin-top: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.pulse-glow {
		animation: status-glow 1.5s infinite alternate;
	}

	@keyframes status-glow {
		from {
			text-shadow: 0 0 5px rgba(0, 210, 255, 0.4);
		}
		to {
			text-shadow: 0 0 15px rgba(0, 210, 255, 1);
		}
	}

	.slot.selected {
		border: 2px solid #00d2ff;
		background: rgba(0, 210, 255, 0.2) !important;
		box-shadow: 0 0 30px rgba(0, 210, 255, 0.6);
		transform: scale(1.02);
	}

	.slot.active-target {
		cursor: pointer;
		border: 2px dashed #00d2ff !important;
		background: rgba(255, 255, 255, 0.05);
		animation: target-glow 2s infinite;
	}

	@keyframes target-glow {
		0% {
			box-shadow: 0 0 5px rgba(0, 210, 255, 0.2);
			border-color: rgba(0, 210, 255, 0.3);
		}
		50% {
			box-shadow: 0 0 20px rgba(0, 210, 255, 0.6);
			border-color: rgba(0, 210, 255, 0.9);
		}
		100% {
			box-shadow: 0 0 5px rgba(0, 210, 255, 0.2);
			border-color: rgba(0, 210, 255, 0.3);
		}
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

	.remove-btn:hover {
		color: #ff4757;
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
