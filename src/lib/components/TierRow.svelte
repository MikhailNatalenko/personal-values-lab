<script lang="ts">
	import ValueCard from './ValueCard.svelte';

	interface Props {
		label: string;
		color: string;
		values: { id: string; name: string; description: string }[];
		onDrop: (e: DragEvent, targetTier: string) => void;
		onDragStart: (e: DragEvent, id: string) => void;
	}

	let { label, color, values, onDrop, onDragStart }: Props = $props();

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
</script>

<div
	class="tier-row glass"
	class:drag-over={isOver}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	role="region"
	aria-label="Tier {label}"
>
	<div class="tier-label" style="background-color: {color}">
		<span>{label}</span>
	</div>
	<div class="tier-content">
		{#each values as value (value.id)}
			<ValueCard {...value} {onDragStart} />
		{/each}
	</div>
</div>

<style>
	.tier-row {
		display: flex;
		min-height: 80px;
		margin-bottom: 0.75rem;
		overflow: hidden;
		transition: all 0.2s ease;
	}

	.tier-row.drag-over {
		border-color: var(--accent-primary);
		background: rgba(59, 130, 246, 0.05);
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
