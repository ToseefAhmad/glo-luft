import './CheckoutPage.scss';

import React, {
    useRef,
    useState,
    useMemo,
    useCallback
} from 'react';
import {useRouteMatch} from 'react-router-dom';
import {useIntl} from 'react-intl';

import {CmsBlockContainer} from '@luft/cms';

import {MetaComponent} from 'bat-core/common';
import {CheckoutContext} from 'bat-core/checkout';
import {trackBeginCheckout, trackCheckoutErrors} from 'bat-core/data-layer';

import {CheckoutSwitch} from '../../Router';
import messages from './resources/messages';

type Props = {
    metaDescription: string
};

export function CheckoutPage({metaDescription = ''}: Props) {
    const isCheckoutSuccess = !!useRouteMatch('/checkout/success');
    const {formatMessage} = useIntl();
    const [checkoutStep, setCheckoutStep] = useState(null);
    const cartItems = useRef([]);

    const metaTitle = formatMessage(isCheckoutSuccess ? messages.meta_title_success : messages.meta_title);

    const onSetCheckoutStep = useCallback(checkoutStepNumber => {
        setCheckoutStep(checkoutStepNumber);
        trackBeginCheckout(cartItems.current, checkoutStepNumber);
    }, []);

    const onSetCheckoutCartItems = useCallback(cartItemsData => {
        cartItems.current = cartItemsData;
    }, []);

    const onSetCheckoutErrors = useCallback((errors, errorSource, errorStep) => {
        trackCheckoutErrors(errors, errorSource, errorStep || checkoutStep);
    }, [checkoutStep]);

    const checkoutContextData = useMemo(() => ({
        checkoutStep,
        onSetCheckoutStep,
        onSetCheckoutCartItems,
        onSetCheckoutErrors
    }), [checkoutStep, onSetCheckoutStep, onSetCheckoutCartItems, onSetCheckoutErrors]);

    return (
        <CheckoutContext.Provider value={checkoutContextData}>
            <div className="checkout-page">
                <MetaComponent meta={{
                    meta_title: metaTitle,
                    meta_description: metaDescription
                }}/>
                {!isCheckoutSuccess && (
                    <CmsBlockContainer cmsBlockId="checkout-after-header"
                                       className="checkout-page-after-header"/>
                )}
                <CheckoutSwitch/>
            </div>
        </CheckoutContext.Provider>
    );
}
