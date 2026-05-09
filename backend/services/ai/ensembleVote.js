const LABEL_VALUES = ['positive', 'neutral', 'negative'];

const ratingToLabel = (rating) => {
    const value = Number(rating);
    if (!Number.isFinite(value)) return null;
    if (value >= 4) return 'positive';
    if (value <= 2) return 'negative';
    return 'neutral';
};

const labelToScore = (label) => {
    if (label === 'positive') return 1;
    if (label === 'negative') return -1;
    return 0;
};

const tally = (votes) => {
    const counts = { positive: 0, neutral: 0, negative: 0 };
    votes.forEach(({ label, weight }) => {
        if (LABEL_VALUES.includes(label)) counts[label] += weight;
    });
    return counts;
};

export const ensembleVote = ({ groq, rule, rating }) => {
    const votes = [];
    if (groq?.sentiment_label) votes.push({ source: 'groq', label: groq.sentiment_label, weight: 0.5 });
    if (rule?.sentiment_label) votes.push({ source: 'rule', label: rule.sentiment_label, weight: 0.2 });

    const ratingLabel = ratingToLabel(rating);
    if (ratingLabel) votes.push({ source: 'rating', label: ratingLabel, weight: 0.3 });

    if (!votes.length) {
        return {
            label: 'neutral',
            agreement: 0,
            sources: {}
        };
    }

    const counts = tally(votes);
    const totalWeight = votes.reduce((sum, vote) => sum + vote.weight, 0);
    const winnerLabel = LABEL_VALUES.reduce((best, label) =>
        counts[label] > counts[best] ? label : best, LABEL_VALUES[0]);

    const agreement = totalWeight > 0 ? counts[winnerLabel] / totalWeight : 0;

    const sources = votes.reduce((acc, vote) => {
        acc[vote.source] = vote.label;
        return acc;
    }, {});

    return {
        label: winnerLabel,
        agreement: Number(agreement.toFixed(2)),
        sources
    };
};

export const ensembleScore = ({ groq, rule, rating }) => {
    const components = [];
    if (Number.isFinite(Number(groq?.sentiment_score))) {
        components.push({ value: Number(groq.sentiment_score), weight: 0.5 });
    }
    if (Number.isFinite(Number(rule?.sentiment_score))) {
        components.push({ value: Number(rule.sentiment_score), weight: 0.2 });
    }
    const ratingLabel = ratingToLabel(rating);
    if (ratingLabel) {
        components.push({ value: labelToScore(ratingLabel), weight: 0.3 });
    }

    if (!components.length) return 0;

    const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
    const weighted = components.reduce((sum, c) => sum + c.value * c.weight, 0);
    return Number((weighted / totalWeight).toFixed(4));
};
