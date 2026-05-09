#!/usr/bin/env node

/**
 * Sentiment evaluation script.
 *
 * Compares stored sentiment_label (from ReviewAnalyses) against a
 * pseudo ground-truth derived from the user-provided rating
 * (rating >=4 -> positive, =3 -> neutral, <=2 -> negative).
 *
 * Reports per-class Precision/Recall/F1 + macro-F1 + accuracy +
 * confusion matrix, mirroring the metrics used in Bellar 2024 (Section 4).
 *
 * Usage:
 *   node backend/scripts/eval-sentiment.js [--limit=500]
 */

import 'dotenv/config';
import sequelize from '../config/db.js';
import { QueryTypes } from 'sequelize';

const LABELS = ['positive', 'neutral', 'negative'];

const ratingToLabel = (rating) => {
    const value = Number(rating);
    if (value >= 4) return 'positive';
    if (value <= 2) return 'negative';
    return 'neutral';
};

const buildConfusionMatrix = (rows) => {
    const matrix = {};
    LABELS.forEach((truth) => {
        matrix[truth] = {};
        LABELS.forEach((pred) => { matrix[truth][pred] = 0; });
    });

    let total = 0;
    let correct = 0;

    rows.forEach((row) => {
        const truth = ratingToLabel(row.rating);
        const pred = LABELS.includes(row.predicted) ? row.predicted : 'neutral';
        matrix[truth][pred] += 1;
        total += 1;
        if (truth === pred) correct += 1;
    });

    return { matrix, total, correct };
};

const perClassMetrics = (matrix) => LABELS.map((label) => {
    const tp = matrix[label][label];
    const fp = LABELS.filter((other) => other !== label)
        .reduce((sum, other) => sum + matrix[other][label], 0);
    const fn = LABELS.filter((other) => other !== label)
        .reduce((sum, other) => sum + matrix[label][other], 0);

    const precision = tp + fp ? tp / (tp + fp) : 0;
    const recall = tp + fn ? tp / (tp + fn) : 0;
    const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;

    return { label, precision, recall, f1, support: tp + fn };
});

const formatPercent = (value) => `${(value * 100).toFixed(2)}%`;

const printReport = ({ matrix, total, correct, metrics }) => {
    console.log('\n=== Confusion Matrix (rows = ground truth, cols = predicted) ===');
    const header = ['truth\\pred', ...LABELS].map((s) => s.padEnd(12)).join('');
    console.log(header);
    LABELS.forEach((truth) => {
        const cells = [truth, ...LABELS.map((pred) => String(matrix[truth][pred]))]
            .map((s) => s.padEnd(12));
        console.log(cells.join(''));
    });

    console.log('\n=== Per-class metrics ===');
    metrics.forEach((m) => {
        console.log(
            `${m.label.padEnd(10)} P=${formatPercent(m.precision)} ` +
            `R=${formatPercent(m.recall)} F1=${formatPercent(m.f1)} support=${m.support}`
        );
    });

    const macroF1 = metrics.reduce((sum, m) => sum + m.f1, 0) / metrics.length;
    const accuracy = total ? correct / total : 0;

    console.log('\n=== Aggregate ===');
    console.log(`Samples : ${total}`);
    console.log(`Accuracy: ${formatPercent(accuracy)}`);
    console.log(`Macro-F1: ${formatPercent(macroF1)}`);
};

const parseLimit = () => {
    const arg = process.argv.find((a) => a.startsWith('--limit='));
    if (!arg) return null;
    const value = Number(arg.split('=')[1]);
    return Number.isFinite(value) && value > 0 ? value : null;
};

const main = async () => {
    const limit = parseLimit();
    const sql = `
        SELECT r.rating, ra.sentiment_label AS predicted, ra.provider, ra.ensemble_agreement
        FROM Reviews r
        INNER JOIN ReviewAnalyses ra ON ra.review_id = r.review_id
        ORDER BY r.review_date DESC
        ${limit ? 'LIMIT :limit' : ''}
    `;

    const rows = await sequelize.query(sql, {
        replacements: limit ? { limit } : {},
        type: QueryTypes.SELECT
    });

    if (!rows.length) {
        console.log('Khong tim thay du lieu de danh gia. Hay tao review va chay analysis truoc.');
        await sequelize.close();
        return;
    }

    console.log(`Loaded ${rows.length} reviews with stored analysis.`);

    const groqRows = rows.filter((row) => row.provider && row.provider.startsWith('groq'));
    const fallbackRows = rows.filter((row) => row.provider === 'fallback' || row.provider === 'fallback+ensemble');

    const sections = [
        { title: 'ALL providers', rows },
        { title: 'GROQ-based', rows: groqRows },
        { title: 'FALLBACK only', rows: fallbackRows }
    ];

    sections.forEach((section) => {
        if (!section.rows.length) {
            console.log(`\n--- ${section.title}: no samples ---`);
            return;
        }
        console.log(`\n========== ${section.title} (${section.rows.length}) ==========`);
        const cm = buildConfusionMatrix(section.rows);
        const metrics = perClassMetrics(cm.matrix);
        printReport({ ...cm, metrics });
    });

    await sequelize.close();
};

main().catch(async (err) => {
    console.error('Eval failed:', err);
    try { await sequelize.close(); } catch {}
    process.exit(1);
});
