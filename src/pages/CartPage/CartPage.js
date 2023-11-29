import './CartPage.scss';

import React, {useMemo} from 'react';
import {useHistory} from 'react-router';
import {useIntl} from 'react-intl';

import {CartComponent} from '@luft/cart';

import {CheckoutContext} from 'bat-core/checkout';
import {MetaComponent} from 'bat-core/common';
import {trackCartErrors} from 'bat-core/data-layer';

import messages from './resources/messages';

type Props = {
    metaDescription: string
};

export function CartPage({metaDescription = ''}: Props) {
    const history = useHistory();
    const {formatMessage} = useIntl();

    const onNavigateToCheckout = () => history.replace('/checkout');

    // TODO: This function does not need to be in a context
    const checkoutContextData = useMemo(() => ({onSetCheckoutErrors: trackCartErrors}), []);

    return (
        <CheckoutContext.Provider value={checkoutContextData}>
            <div className="cart-page">
                <MetaComponent meta={{
                    meta_title: formatMessage(messages.meta_title),
                    meta_description: metaDescription
                }}/>
                <CartComponent onNavigateToCheckout={onNavigateToCheckout}/>
            </div>
        </CheckoutContext.Provider>
    );
}
