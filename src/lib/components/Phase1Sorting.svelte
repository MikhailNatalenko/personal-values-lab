<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { appState } from '$lib/state.svelte';
	import { tooltip } from '$lib/tooltipStore';
	import TierRow from './TierRow.svelte';
	import ValueCard from './ValueCard.svelte';
</script>

<div class="phase1" transition:fade>
	<div class="main-layout">
		<div class="tier-list">
			{#each appState.tiers as tier (tier.label)}
				<TierRow
					{...tier}
					isSelectedId={appState.selectedCardId}
					onDrop={(e, label) => {
						const id = e.dataTransfer?.getData('text/plain');
						if (id) appState.moveValue(id, label);
					}}
					onDragStart={appState.handleDragStart}
					onClickValue={appState.selectValue}
					onClickTier={(label) => appState.moveValue(appState.selectedCardId!, label)}
				/>
			{/each}
		</div>

		<aside class="pool-section glass">
			<div class="section-header">
				<div class="header-top">
					<h2 class="section-title">Ценности</h2>
					<button
						class="btn btn-primary next-phase-btn"
						class:disabled={!appState.canProceedToPhase2}
						onclick={() => appState.canProceedToPhase2 && appState.goToPhase(2)}
						onmouseenter={(e) => {
							if (!appState.canProceedToPhase2) {
								const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
								tooltip.set({
									active: true,
									name: 'Недостаточно ценностей',
									description:
										'Нужно распределить хотя бы 5 ценностей по категориям, чтобы продолжить.',
									x: rect.left + rect.width / 2,
									y: rect.top
								});
							}
						}}
						onmouseleave={() => tooltip.update((t) => ({ ...t, active: false }))}
					>
						Продолжить →
					</button>
				</div>

				<div class="add-custom-form">
					<div class="input-group">
						<input
							type="text"
							placeholder="Своя ценность..."
							bind:value={appState.customValueName}
							class="glass"
						/>
						<button
							class="btn btn-secondary add-btn"
							onclick={appState.addCustomValue}
							title="Добавить"
						>
							+
						</button>
					</div>
					{#if appState.customValueName}
						<div transition:slide>
							<textarea
								placeholder="Краткое описание (необязательно)"
								bind:value={appState.customValueDesc}
								class="glass"
							></textarea>
						</div>
					{/if}
				</div>
			</div>

			<div
				class="pool-container"
				class:clickable={!!appState.selectedCardId &&
					!appState.pool.find((v) => v.id === appState.selectedCardId)}
				ondrop={(e) => {
					e.preventDefault();
					const id = e.dataTransfer?.getData('text/plain');
					if (id) appState.moveValue(id, null);
				}}
				ondragover={appState.handleDragOver}
				onclick={() => appState.selectedCardId && appState.moveValue(appState.selectedCardId, null)}
				role="listbox"
				aria-label="Пул ценностей"
				tabindex="0"
			>
				{#each appState.pool as value (value.id)}
					<ValueCard
						{...value}
						onDragStart={appState.handleDragStart}
						isSelected={appState.selectedCardId === value.id}
						onClick={appState.selectValue}
					/>
				{/each}
				{#if appState.pool.length === 0}
					<p class="empty-msg">Всё распределено</p>
				{/if}
			</div>
		</aside>
	</div>
</div>

<style>
	.main-layout {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: 2rem;
		align-items: start;
		max-width: 1400px;
		margin: 0 auto;
	}

	.tier-list {
		flex-grow: 1;
	}

	.pool-section {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 200px);
		position: sticky;
		top: 2rem;
		padding: 0;
		border-style: solid;
	}

	.pool-section .section-header {
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid var(--border-light);
		background: rgba(15, 23, 42, 0.9);
		backdrop-filter: blur(10px);
		display: flex;
		flex-direction: column;
		gap: 1rem;
		z-index: 1;
		position: relative;
	}

	.header-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.add-custom-form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.add-custom-form .input-group {
		display: flex;
		gap: 0.5rem;
	}

	.add-custom-form input,
	.add-custom-form textarea {
		width: 100%;
		padding: 0.5rem 0.75rem;
		font-size: 0.9rem;
		outline: none;
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: white;
		background: rgba(255, 255, 255, 0.05);
	}

	.add-custom-form input::placeholder,
	.add-custom-form textarea::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.add-custom-form textarea {
		min-height: 60px;
		resize: none;
	}

	.add-custom-form .add-btn {
		padding: 0 0.75rem;
		font-weight: bold;
		font-size: 1.2rem;
	}

	.next-phase-btn {
		white-space: nowrap;
		padding: 0.5rem 1rem !important;
		font-size: 0.9rem !important;
		box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
		transition: all 0.2s ease;
	}

	.next-phase-btn.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		filter: grayscale(1);
		box-shadow: none;
	}

	.pool-container {
		flex-grow: 1;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
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

	.pool-container.clickable {
		cursor: pointer;
		background: rgba(255, 255, 255, 0.03);
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
</style>
