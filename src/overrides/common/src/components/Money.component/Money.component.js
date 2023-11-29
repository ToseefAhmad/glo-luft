import {useIntl} from 'react-intl';

import type {Money} from '@luft/types';

import {getStoreCodeByPathname} from 'bat-core/common';

type Props = {
    /**
     * Money Type, should contain any value as number and optional currency
     */
    money: Money,
    /**
     * formatNumber react-intl options
     */
    options?: Object,
    /**
     * if value should be converted to negative
     */
    isNegative?: boolean,
    /**
     * custom formatting used for this component. Defaults to 'money'.
     * This allows to pass named formats for number formatter in Intl Provder
     * like this:
     *
     * {
     *     formats: {
     *         number: {
     *             money: {
     *                 minimumFractionDigits: 0,
     *                 maximumFractionDigits: 0
     *             }
     *         }
     *     }
     * }
     *
     * This will remove fraction digits from money component.
     *
     */
    format?: string,
    /**
     * Money.value multiplier
     */
    qty?: number
}

export function MoneyComponent(props: Props) {
    const {
        money,
        options = {},
        isNegative = false,
        format = 'money',
        qty
    } = props;

    const {formatNumber} = useIntl();
    const storeCode = getStoreCodeByPathname();

    if (!money) {
        return null;
    }

    const {currency} = money;
    let {value} = money;

    if (isNegative) {
        value *= -1;
    }

    if (qty > 0) {
        value *= qty;
    }

    const formattedPrice = formatNumber(value, {
        style: 'currency',
        currency,
        format,
        ...options
    });

    switch (storeCode) {
        case 'ph':
            return formattedPrice.replace(/PHP/, '₱');
        case 'id':
            return formattedPrice.replace(/IDR/, 'Pp');
        default:
            return formattedPrice;
    }
}
