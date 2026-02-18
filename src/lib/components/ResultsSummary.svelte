<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Value } from '$lib/values';

	interface Props {
		top5: (Value | null)[];
		personalDefinitions: Record<string, string>;
		committedActions: Record<string, { contact: number; filling: string; immediate: string }>;
		goalsVision: Record<string, { longTerm: string; intermediate: string; actions: string }>;
		tiers: { label: string; color: string; description: string; values: Value[] }[];
		onBack: () => void;
	}

	let { top5, personalDefinitions, committedActions, goalsVision, tiers, onBack }: Props = $props();

	const validTop5 = $derived(top5.filter((v): v is Value => v !== null));
</script>

{#snippet dataBlock(label: string, content: string, isPersonal: boolean = false)}
	<div class="data-block">
		<h5>{label}</h5>
		{#if isPersonal}
			<div class="content">{content || 'Определение не указано'}</div>
		{:else}
			<div class="content">{@html content}</div>
		{/if}
	</div>
{/snippet}

<div class="phase-container" transition:fade>
	<div class="summary-header no-print">
		<button class="btn btn-secondary" onclick={onBack}>← Назад</button>
		<h2>Ваша Карта Ценностей</h2>
		<button class="btn btn-primary export-btn" onclick={() => window.print()}>
			<span>Выгрузить в PDF</span>
			<span class="icon">📄</span>
		</button>
	</div>

	<div class="summary-content glass printable-report">
		<header class="report-header">
			<div class="report-logo">Personal Values Lab</div>
			<h1>Карта Личных Ценностей</h1>
			<p class="date">Дата формирования: {new Date().toLocaleDateString('ru-RU')}</p>
		</header>

		<section class="summary-section">
			<h3 class="section-label">Ваш фокус и приоритеты (Топ-5)</h3>
			<div class="results-list">
				{#each validTop5 as val, i}
					<div class="result-card">
						<div class="card-header">
							<span class="num">{i + 1}</span>
							<h4>{val.name}</h4>
						</div>

						<div class="card-grid">
							{@render dataBlock('Личное определение', personalDefinitions[val.id], true)}

							{#if committedActions[val.id]}
								{@const action = committedActions[val.id]}
								{@render dataBlock(
									'Проживание и приверженность',
									`<p class="score">Контакт с ценностью: <strong>${action.contact}/10</strong></p>` +
										`<p><strong>Что наполняет:</strong> ${action.filling || '...'}</p>` +
										`<p><strong>Ближайший шаг:</strong> ${action.immediate || '...'}</p>`
								)}
							{/if}

							{#if goalsVision[val.id]}
								{@const goal = goalsVision[val.id]}
								{@render dataBlock(
									'Стратегия и Видение',
									`<p><strong>Долгосрочная цель:</strong> ${goal.longTerm || '...'}</p>` +
										`<p><strong>Промежуточные шаги:</strong> ${goal.intermediate || '...'}</p>` +
										`<p><strong>Конкретные действия:</strong> ${goal.actions || '...'}</p>`
								)}
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</section>

		<section class="summary-section tiers-full-report">
			<h3 class="section-label">Распределение по категориям</h3>
			<div class="tiers-summary-grid">
				{#each tiers as tier}
					{#if tier.values.length > 0}
						<div class="tier-block">
							<h5 style="color: {tier.color}">{tier.label} — {tier.description}</h5>
							<div class="tier-values">
								{#each tier.values as v}
									<span class="value-tag glass">{v.name}</span>
								{/each}
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</section>

		<footer class="report-footer">
			<p>Сгенерировано в https://mikhailnatalenko.github.io/personal-values-lab/</p>
		</footer>
	</div>
</div>

<style>
	.phase-container {
		width: 100%;
		max-width: 1000px;
		margin: 0 auto;
	}
	.summary-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding: 0 1rem;
	}

	.export-btn {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.8rem 1.5rem;
		font-size: 1.1rem;
		font-weight: 600;
		background: linear-gradient(135deg, var(--accent-primary), #00d2ff);
		border: none;
		box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.export-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
	}

	.summary-content {
		padding: 4rem;
		text-align: left;
		background: rgba(255, 255, 255, 0.03);
	}

	.report-header {
		text-align: center;
		margin-bottom: 4rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding-bottom: 2.5rem;
	}

	.report-logo {
		font-family: 'Inter', sans-serif;
		font-weight: 800;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--accent-primary);
		margin-bottom: 1rem;
		opacity: 0.8;
	}

	.report-header h1 {
		font-size: 2.8rem;
		margin-bottom: 0.75rem;
		background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0.7));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.date {
		font-size: 0.9rem;
		opacity: 0.5;
	}

	.section-label {
		font-size: 1.6rem;
		margin: 4rem 0 2.5rem;
		color: var(--accent-primary);
		border-left: 4px solid var(--accent-primary);
		padding-left: 1.25rem;
		line-height: 1;
	}

	.results-list {
		display: flex;
		flex-direction: column;
		gap: 4rem;
	}

	.result-card {
		padding-bottom: 3rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.result-card:last-child {
		border-bottom: none;
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		margin-bottom: 2rem;
	}

	.card-header .num {
		font-size: 2.5rem;
		font-weight: 900;
		opacity: 0.15;
		color: var(--accent-primary);
	}

	.card-header h4 {
		font-size: 2rem;
		font-weight: 700;
		color: #fff;
	}

	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2.5rem;
	}

	.data-block h5 {
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--accent-primary);
		margin-bottom: 1rem;
		opacity: 0.9;
	}

	.data-block .content {
		font-size: 1.1rem;
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.9);
		white-space: pre-wrap;
	}

	.score {
		font-size: 1.1rem;
		display: block;
		margin-bottom: 0.5rem;
	}

	.tiers-summary-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2.5rem;
	}

	.tier-block h5 {
		font-size: 1.1rem;
		margin-bottom: 1.25rem;
		font-weight: 600;
	}

	.tier-values {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}

	.value-tag {
		padding: 0.5rem 1rem;
		border-radius: 25px;
		font-size: 0.9rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.report-footer {
		margin-top: 6rem;
		padding-top: 2rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		text-align: center;
		font-size: 0.85rem;
		opacity: 0.4;
	}

	@media print {
		@page {
			size: A4;
			margin: 12mm;
		}

		:global(body) {
			background: white !important;
			color: black !important;
			font-size: 10pt;
		}

		.no-print {
			display: none !important;
		}

		.summary-content {
			padding: 0;
			background: transparent !important;
			backdrop-filter: none !important;
			box-shadow: none !important;
			border: none !important;
			color: black !important;
		}

		.report-header {
			margin-bottom: 1.5rem;
			padding-bottom: 1rem;
			border-bottom: 2px solid #333;
		}

		.report-header h1 {
			background: none !important;
			-webkit-text-fill-color: black !important;
			color: black !important;
			font-size: 1.8rem;
			margin-bottom: 0.2rem;
		}

		.report-logo {
			color: #333 !important;
			opacity: 1;
			margin-bottom: 0.25rem;
		}

		.section-label {
			font-size: 1.2rem;
			margin: 1.5rem 0 1rem;
			color: black !important;
			border-left-color: #333 !important;
			padding-left: 0.75rem;
			font-weight: bold;
		}

		.results-list {
			gap: 1rem;
		}

		.card-header {
			margin-bottom: 0.75rem;
			gap: 0.5rem;
		}

		.card-header .num {
			font-size: 1.5rem;
		}

		.card-header h4 {
			font-size: 1.2rem;
			color: black !important;
		}

		.card-grid {
			gap: 1rem;
			grid-template-columns: 1fr 1fr;
		}

		.data-block h5 {
			font-size: 0.7rem;
			color: #444 !important;
			border-bottom: 1px solid #ddd;
			padding-bottom: 0.15rem;
			margin-bottom: 0.4rem;
		}

		.data-block .content,
		.data-block p {
			font-size: 9pt;
			color: black !important;
			line-height: 1.3;
		}

		.result-card {
			page-break-inside: avoid;
			border-bottom: 1px solid #eee !important;
			padding-bottom: 1rem;
			margin-bottom: 0.75rem;
		}

		.value-tag {
			padding: 0.2rem 0.5rem;
			font-size: 8pt;
			background: white !important;
			border: 1px solid #ccc !important;
			color: black !important;
		}

		.report-footer {
			margin-top: 2rem;
			padding-top: 0.75rem;
			color: #666 !important;
			border-top: 1px solid #ccc !important;
		}

		.tiers-full-report {
			page-break-before: auto;
			margin-top: 1.5rem;
		}

		:global(.glass) {
			background: white !important;
			backdrop-filter: none !important;
			border: 1px solid #eee !important;
			color: black !important;
		}
	}
</style>
