<script lang="ts">
	import ValueCard from './ValueCard.svelte';
	import { tooltip } from '$lib/tooltipStore';

	interface Props {
		label: string;
		color: string;
		description: string;
		values: { id: string; name: string; description: string }[];
		isSelectedId?: string | null;
		onDrop: (e: DragEvent, targetTier: string) => void;
		onDragStart: (e: DragEvent, id: string) => void;
		onClickValue?: (id: string) => void;
		onClickTier?: (label: string) => void;
	}

	let {
		label,
		color,
		description,
		values,
		isSelectedId = null,
		onDrop,
		onDragStart,
		onClickValue,
		onClickTier
	}: Props = $props();

	let isOver = $state(false);

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isOver = true;
	}

	function handleDragLeave() {
		isOver = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isOver = false;
		onDrop(e, label);
	}

	function handleClick() {
		if (onClickTier && isSelectedId) {
			onClickTier(label);
		}
	}

	function handleMouseEnter(e: MouseEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		tooltip.set({
			active: true,
			name: `Категория ${label}`,
			description,
			x: rect.left + rect.width / 2,
			y: rect.top
		});
	}

	function handleMouseLeave() {
		tooltip.update((t) => ({ ...t, active: false }));
	}
</script>

<div
	class="tier-row glass"
	class:drag-over={isOver}
	class:clickable={!!isSelectedId}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	onclick={handleClick}
	role="region"
	aria-label="Tier {label}"
>
	<div
		class="tier-label"
		style="background-color: {color}"
		onmouseenter={handleMouseEnter}
		onmouseleave={handleMouseLeave}
	>
		<span>{label}</span>
	</div>
	<div class="tier-content">
		{#each values as value (value.id)}
			<ValueCard
				{...value}
				{onDragStart}
				isSelected={isSelectedId === value.id}
				onClick={onClickValue}
			/>
		{/each}
	</div>
</div>

<style>
	.tier-row {
		display: flex;
		min-height: 80px;
		margin-bottom: 0.75rem;
		transition: all 0.2s ease;
	}

	.tier-row.drag-over {
		border-color: var(--accent-primary);
		background: rgba(59, 130, 246, 0.05);
	}

	.tier-row.clickable {
		cursor: pointer;
	}

	.tier-row.clickable:hover {
		border-color: var(--accent-primary);
		background: rgba(255, 255, 255, 0.03);
	}

	.tier-label {
		width: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		font-weight: 700;
		font-size: 1.25rem;
		color: rgba(0, 0, 0, 0.7);
		text-transform: uppercase;
		flex-shrink: 0;
	}

	.tier-content {
		flex-grow: 1;
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		padding: 0.75rem;
		align-content: center;
	}
</style>
