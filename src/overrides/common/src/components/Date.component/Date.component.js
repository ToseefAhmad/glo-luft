// GLO
import {formatDate as formatDateString} from '@luft/util';

export function DateComponent({date, options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
}}) {
    return new Date(formatDateString(date)).toLocaleString('en-PH', options);
}
