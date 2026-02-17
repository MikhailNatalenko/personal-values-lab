<script lang="ts">
	interface Props {
		name: string;
		id: string;
		description: string;
		onDragStart: (e: DragEvent, id: string) => void;
	}

	let { name, id, description, onDragStart }: Props = $props();
</script>

<div
	class="value-card glass"
	draggable="true"
	ondragstart={(e) => onDragStart(e, id)}
	role="button"
	tabindex="0"
>
	<span class="name">{name}</span>
	<div class="tooltip glass">{description}</div>
</div>

<style>
	.value-card {
		position: relative;
		padding: 0.75rem 1.25rem;
		cursor: grab;
		display: inline-flex;
		align-items: center;
		justify-content: center;
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
	}

	/* Custom Tooltip */
	.tooltip {
		position: absolute;
		bottom: 125%;
		left: 50%;
		transform: translateX(-50%) translateY(10px);
		padding: 1rem 1.25rem;
		width: 320px;
		font-size: 0.95rem;
		line-height: 1.5;
		color: var(--text-primary);
		background: rgba(15, 23, 42, 0.95);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 10px;
		pointer-events: none;
		opacity: 0;
		visibility: hidden;
		transition: all 0.1s ease-out;
		z-index: 100;
		text-align: left;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
	}

	/* Triangle for tooltip */
	.tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border-width: 6px;
		border-style: solid;
		border-color: rgba(15, 23, 42, 0.95) transparent transparent transparent;
	}

	.value-card:hover .tooltip {
		opacity: 1;
		visibility: visible;
		transform: translateX(-50%) translateY(0);
	}

	.value-card:focus-visible {
		border-color: var(--accent-primary);
		box-shadow: 0 0 0 2px var(--accent-primary);
	}

	.value-card:active {
		cursor: grabbing;
	}

	.name {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-primary);
		text-align: center;
	}
</style>
