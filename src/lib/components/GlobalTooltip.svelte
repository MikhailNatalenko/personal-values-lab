<script lang="ts">
	import { fade } from 'svelte/transition';
	import { tooltip } from '$lib/tooltipStore';
</script>

{#if $tooltip.active}
	<div
		class="global-tooltip glass"
		style="left: {$tooltip.x}px; top: {$tooltip.y}px;"
		transition:fade={{ duration: 100 }}
	>
		<strong>{$tooltip.name}</strong>
		<p>{$tooltip.description}</p>
	</div>
{/if}

<style>
	.global-tooltip {
		position: fixed;
		bottom: auto;
		left: 0;
		top: 0;
		transform: translate(-50%, -110%);
		padding: 1rem 1.25rem;
		width: 320px;
		font-size: 0.95rem;
		line-height: 1.5;
		color: var(--text-primary);
		background: rgba(15, 23, 42, 0.98);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 10px;
		pointer-events: none;
		z-index: 10000;
		text-align: left;
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.6),
			0 0 20px rgba(0, 210, 255, 0.1);
	}

	.global-tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border-width: 6px;
		border-style: solid;
		border-color: rgba(15, 23, 42, 0.98) transparent transparent transparent;
	}

	@media print {
		.global-tooltip {
			display: none !important;
		}
	}
</style>
