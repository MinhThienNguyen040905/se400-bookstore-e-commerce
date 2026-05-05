import { ORDER_STATUS } from '../constants/orderStatus.js';

const TIMELINE_STEPS = [
    { status: ORDER_STATUS.PROCESSING, title: 'Dang xu ly', description: 'Don hang dang duoc xac nhan' },
    { status: ORDER_STATUS.SHIPPED, title: 'Dang van chuyen', description: 'Don hang dang duoc giao' },
    { status: ORDER_STATUS.DELIVERED, title: 'Da giao hang', description: 'Don hang da den tay ban' }
];

const STATUS_OFFSETS = {
    [ORDER_STATUS.PROCESSING]: 0,
    [ORDER_STATUS.SHIPPED]: 2,
    [ORDER_STATUS.DELIVERED]: 4
};

export const buildStatusHistory = (currentStatus, orderDate) => {
    if (!orderDate) return [];
    const baseDate = new Date(orderDate);

    if (currentStatus === ORDER_STATUS.CANCELLED) {
        return [
            {
                status: ORDER_STATUS.CANCELLED,
                title: 'Don hang da bi huy',
                description: 'Lien he CSKH de biet them chi tiet',
                completedAt: baseDate,
                isCompleted: true
            }
        ];
    }

    const currentIndex = TIMELINE_STEPS.findIndex((step) => step.status === currentStatus);
    const steps = currentIndex >= 0 ? TIMELINE_STEPS.slice(0, currentIndex + 1) : TIMELINE_STEPS;

    return steps.map((step, index) => {
        const completedDate = new Date(baseDate);
        completedDate.setDate(completedDate.getDate() + (STATUS_OFFSETS[step.status] ?? 0));

        return {
            status: step.status,
            title: step.title,
            description: step.description,
            completedAt: completedDate,
            isCompleted: index <= currentIndex
        };
    });
};
