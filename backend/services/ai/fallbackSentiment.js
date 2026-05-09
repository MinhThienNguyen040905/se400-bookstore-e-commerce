const positiveWords = [
    'hay', 'tot', 'dep', 'thich', 'hai long', 'de hieu', 'huu ich', 'tuyet voi',
    'chat luong', 'nen doc', 'xuat sac', 'good', 'great', 'excellent', 'love'
];

const negativeWords = [
    'te', 'chan', 'that vong', 'kho hieu', 'loi', 'xau', 'kem', 'khong hay',
    'lap lai', 'dat', 'bad', 'poor', 'disappointed', 'boring'
];

const normalizeText = (text = '') => text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const keywordScore = (comment) => {
    const text = normalizeText(comment);
    const positive = positiveWords.filter((word) => text.includes(word)).length;
    const negative = negativeWords.filter((word) => text.includes(word)).length;
    return { positive, negative };
};

const labelFromScore = (score) => {
    if (score >= 0.25) return 'positive';
    if (score <= -0.25) return 'negative';
    return 'neutral';
};

const buildSignals = (comment) => {
    const text = normalizeText(comment);
    return [...positiveWords, ...negativeWords]
        .filter((word) => text.includes(word))
        .slice(0, 5);
};

const detectSpam = (comment, sentimentScore, rating) => {
    const reasons = [];
    const text = (comment || '').trim();
    const normalized = normalizeText(text);

    if (text.length < 12) reasons.push('comment qua ngan');
    if (/https?:\/\/|www\./i.test(text)) reasons.push('co link quang cao');
    if (/(.)\1{8,}/.test(normalized)) reasons.push('lap ky tu bat thuong');
    if ((rating >= 4 && sentimentScore < -0.35) || (rating <= 2 && sentimentScore > 0.35)) {
        reasons.push('rating va sentiment mau thuan');
    }

    return {
        spam_risk: reasons.length >= 2 ? 'high' : reasons.length === 1 ? 'medium' : 'low',
        spam_reasons: reasons
    };
};

export const fallbackAnalyzeReview = ({ rating, comment }) => {
    const { positive, negative } = keywordScore(comment);
    const ratingSignal = rating ? (Number(rating) - 3) / 2 : 0;
    const keywordSignal = Math.max(-1, Math.min(1, (positive - negative) / 3));
    const sentimentScore = Math.max(-1, Math.min(1, ratingSignal * 0.7 + keywordSignal * 0.3));
    const sentimentLabel = labelFromScore(sentimentScore);
    const spam = detectSpam(comment, sentimentScore, Number(rating));

    const summaryByLabel = {
        positive: 'Doc gia co cam nhan tich cuc ve cuon sach.',
        neutral: 'Review co cam nhan trung tinh hoac chua du thong tin ro rang.',
        negative: 'Doc gia co mot so diem chua hai long ve cuon sach.'
    };

    return {
        sentiment_label: sentimentLabel,
        sentiment_score: Number(sentimentScore.toFixed(4)),
        confidence: comment && comment.trim().length >= 20 ? 0.66 : 0.48,
        short_summary: summaryByLabel[sentimentLabel],
        signals: buildSignals(comment),
        ...spam
    };
};
