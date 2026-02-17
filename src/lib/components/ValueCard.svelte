<script lang="ts">
	import { tooltip } from '$lib/tooltipStore';

	interface Props {
		id: string;
		name: string;
		description: string;
		isSelected?: boolean;
		onDragStart: (e: DragEvent, id: string) => void;
		onClick?: (id: string) => void;
	}

	let { id, name, description, isSelected = false, onDragStart, onClick }: Props = $props();

	function handleClick(e: MouseEvent) {
		if (onClick) {
			e.stopPropagation();
			onClick(id);
		}
	}

	function handleMouseEnter(e: MouseEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		tooltip.set({
			active: true,
			name,
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
	class="value-card glass"
	class:selected={isSelected}
	draggable="true"
	ondragstart={(e) => onDragStart(e, id)}
	onclick={handleClick}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	role="button"
	tabindex="0"
	aria-label={name}
>
	<span class="value-name">{name}</span>
</div>

<style>
	.value-card {
		position: relative;
		padding: 0.8rem 1.2rem;
		border-radius: 12px;
		cursor: grab;
		min-width: 140px;
		user-select: none;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		background: rgba(255, 255, 255, 0.05);
		outline: none;
	}

	.value-card:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: var(--accent-primary);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		z-index: 20;
	}

	:global(.value-card.selected) {
		border-color: #00d2ff !important;
		background: rgba(0, 210, 255, 0.2) !important;
		box-shadow:
			0 0 25px rgba(0, 210, 255, 0.6),
			inset 0 0 10px rgba(0, 210, 255, 0.4) !important;
		transform: translateY(-6px) !important;
		z-index: 10;
	}

	/* Animation for sidebar selection - very pronounced shift */
	:global(.pool-container) :global(.value-card.selected) {
		transform: translateX(35px) translateY(-6px) !important;
	}

	.value-card:focus-visible {
		border-color: var(--accent-primary);
		box-shadow: 0 0 0 2px var(--accent-primary);
	}

	.value-card:active {
		cursor: grabbing;
	}

	.value-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
		text-align: center;
		display: block;
		width: 100%;
	}
</style>
