<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Value } from '$lib/values';

	interface Props {
		top5: (Value | null)[];
		personalDefinitions: Record<string, string>;
		committedActions: Record<string, { contact: number; filling: string; immediate: string }>;
		goalsVision: Record<string, { longTerm: string; intermediate: string; actions: string }>;
		tiers: { label: string; color: string; values: Value[] }[];
		onBack: () => void;
	}

	let { top5, personalDefinitions, committedActions, goalsVision, tiers, onBack }: Props = $props();

	const validTop5 = $derived(top5.filter((v): v is Value => v !== null));
</script>

<div class="phase-container" transition:fade>
	<div class="summary-header no-print">
		<button class="btn btn-secondary" onclick={onBack}>← Вернуться</button>
		<h2>Ваша Карта Ценностей</h2>
		<button class="btn btn-primary" onclick={() => window.print()}>Печать / PDF</button>
	</div>

	<div class="summary-content glass">
		<header class="report-header">
			<h1>Карта Личных Ценностей</h1>
			<p class="date">{new Date().toLocaleDateString('ru-RU')}</p>
		</header>

		<section class="summary-section">
			<h3 class="section-label">Приоритеты и Видение (Топ-5)</h3>
			<div class="results-list">
				{#each validTop5 as val, i}
					<div class="result-card">
						<div class="card-header">
							<span class="num">{i + 1}</span>
							<h4>{val.name}</h4>
						</div>

						<div class="card-grid">
							<div class="data-block">
								<h5>Личное значение</h5>
								<p>{personalDefinitions[val.id] || '...'}</p>
							</div>

							{#if committedActions[val.id]}
								<div class="data-block">
									<h5>Текущий контакт: {committedActions[val.id].contact}/10</h5>
									<p><strong>Что наполняет:</strong> {committedActions[val.id].filling || '...'}</p>
									<p>
										<strong>Ближайший шаг:</strong>
										{committedActions[val.id].immediate || '...'}
									</p>
								</div>
							{/if}

							{#if goalsVision[val.id]}
								<div class="data-block">
									<h5>Цели и Видение</h5>
									<p><strong>Большая цель:</strong> {goalsVision[val.id].longTerm || '...'}</p>
									<p><strong>Шаги:</strong> {goalsVision[val.id].intermediate || '...'}</p>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</section>

		<section class="summary-section">
			<h3 class="section-label">Ваше распределение (Тир-лист)</h3>
			<div class="tiers-summary-grid">
				{#each tiers as tier}
					<div class="tier-block">
						<h5 style="color: {tier.color}">{tier.label}</h5>
						<div class="tier-values">
							{#each tier.values as v}
								<span class="value-tag glass">{v.name}</span>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</section>
	</div>
</div>

<style>
	.phase-container {
		width: 100%;
	}
	.summary-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}
	.summary-content {
		padding: 4rem;
		text-align: left;
	}

	.report-header {
		text-align: center;
		margin-bottom: 4rem;
		border-bottom: 1px solid var(--border-light);
		padding-bottom: 2rem;
	}
	.report-header h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}
	.date {
		opacity: 0.5;
	}

	.section-label {
		font-size: 1.5rem;
		margin: 3rem 0 2rem;
		color: var(--accent-primary);
		border-left: 4px solid;
		padding-left: 1rem;
	}

	.results-list {
		display: flex;
		flex-direction: column;
		gap: 3rem;
	}
	.result-card {
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		padding-bottom: 2rem;
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	.card-header .num {
		font-size: 2rem;
		font-weight: 800;
		opacity: 0.2;
	}
	.card-header h4 {
		font-size: 1.8rem;
		color: var(--accent-primary);
	}

	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}
	.data-block h5 {
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.6;
		margin-bottom: 0.75rem;
	}
	.data-block p {
		line-height: 1.6;
	}

	.tiers-summary-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 2rem;
	}
	.tier-block h5 {
		font-size: 1.2rem;
		margin-bottom: 1rem;
	}
	.tier-values {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.value-tag {
		padding: 0.4rem 0.8rem;
		border-radius: 20px;
		font-size: 0.85rem;
	}

	@media print {
		.no-print {
			display: none !important;
		}
		.summary-content {
			padding: 0;
			background: none !important;
		}
		.glass {
			background: none !important;
			backdrop-filter: none !important;
			border: 1px solid #eee !important;
			color: black !important;
		}
		.section-label,
		.card-header h4 {
			color: black !important;
		}
		.result-card {
			page-break-inside: avoid;
			border-color: #eee !important;
		}
		.date,
		.data-block h5 {
			color: #666 !important;
		}
	}
</style>
