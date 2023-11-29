import React from 'react';
import {Switch, Route} from 'react-router';
import {useIntl} from 'react-intl';

import {useResolutions} from '@luft/common';
import {
    AccountAddressBookContainer,
    AccountAddressBookAddContainer,
    AccountAddressBookEditContainer,
    AccountMenuContainer,
    AccountOrdersComponent,
    AccountOrderComponent,
    AccountInfoContainer
} from '@luft/account';

import {
    AccountSecurityContainer,
    AccountCouponsComponent,
    AccountReferralProgramContainer,
    AccountPreferencesContainer,
    AccountWishlistComponent
} from 'bat-core/account';

import messages from './resources/messages';

type Props = {
    accountPath: string,
    infoNavigatePath: string,
    securityNavigatePath: string,
    addressesNavigatePath: string,
    ordersNavigatePath: string,
    couponsNavigatePath: string,
    referralProgramNavigatePath: string,
    preferencesNavigatePath: string,
    wishlistNavigatePath: string,
    onNavigateAccount: Function,
    onNavigateAccountAddresses: Function,
    onNavigateAccountAddAddress: Function,
    onNavigateAccountEditAddress: Function,
    onNavigateAccountOrders: Function,
    onNavigateAccountOrder: Function,
    onNavigatePreferences: Function,
    onLogout: Function,
    onNavigateForgotPassword: Function,
    onNavigateCoupons: Function,
    onNavigateReferralProgram: Function,
    onNavigateWishlist: Function
};

export function AccountSwitch(props: Props) {
    const {
        accountPath,
        infoNavigatePath,
        securityNavigatePath,
        addressesNavigatePath,
        ordersNavigatePath,
        couponsNavigatePath,
        referralProgramNavigatePath,
        preferencesNavigatePath,
        wishlistNavigatePath,
        onNavigateAccount,
        onNavigateAccountAddresses,
        onNavigateAccountAddAddress,
        onNavigateAccountEditAddress,
        onNavigateAccountOrders,
        onNavigateAccountOrder,
        onNavigatePreferences,
        onLogout,
        onNavigateForgotPassword,
        onNavigateCoupons,
        onNavigateReferralProgram,
        onNavigateWishlist
    } = props;

    const {isSMdown} = useResolutions();
    const {formatMessage} = useIntl();

    return (
        <Switch>
            <Route path={`${accountPath}/info`}
                   render={() => (
                       <AccountInfoContainer onBack={onNavigateAccount}
                                             title={formatMessage(messages.information_title)}/>
                   )}/>
            <Route path={`${accountPath}/security`}
                   render={() => (
                       <AccountSecurityContainer onBack={onNavigateAccount}
                                                 onLogout={onNavigateForgotPassword}
                                                 title={formatMessage(messages.security_title)}/>
                   )}/>
            <Route path={`${accountPath}/addresses/add`}
                   render={() => (
                       <AccountAddressBookAddContainer onAddAddress={onNavigateAccountAddresses}
                                                       onBack={onNavigateAccountAddresses}
                                                       title={formatMessage(messages.add_address_title)}/>
                   )}/>
            <Route path={`${accountPath}/addresses/edit/:id`}
                   render={({match}) => (
                       <AccountAddressBookEditContainer addressId={match.params.id}
                                                        onBack={onNavigateAccountAddresses}
                                                        onEditAddress={onNavigateAccountAddresses}
                                                        title={formatMessage(messages.edit_address_title)}/>
                   )}/>
            <Route path={`${accountPath}/addresses`}
                   render={() => (
                       <AccountAddressBookContainer onBack={onNavigateAccount}
                                                    title={formatMessage(messages.address_title)}
                                                    onNavigateAddAddress={onNavigateAccountAddAddress}
                                                    onNavigateEditAddress={onNavigateAccountEditAddress}/>
                   )}/>
            <Route path={`${accountPath}/orders/:id`}
                   render={({match}) => (
                       <AccountOrderComponent orderId={match.params.id}
                                              onBack={onNavigateAccountOrders}
                                              onOrderUnavailable={onNavigateAccountOrders}/>
                   )}/>
            <Route path={`${accountPath}/orders`}
                   render={() => (
                       <AccountOrdersComponent onBack={onNavigateAccount}
                                               title={formatMessage(messages.orders_title)}
                                               onNavigateAccountOrder={onNavigateAccountOrder}/>
                   )}/>
            <Route path={`${accountPath}/coupons`}
                   render={() => (
                       <AccountCouponsComponent onBack={onNavigateAccount}
                                                title={formatMessage(messages.coupons_title)}
                                                onNavigateCoupons={onNavigateCoupons}/>
                   )}/>
            <Route path={`${accountPath}/preferences`}
                   render={() => (
                       <AccountPreferencesContainer onBack={onNavigateAccount}
                                                    title={formatMessage(messages.preferences_title)}
                                                    onNavigatePreferences={onNavigatePreferences}/>
                   )}/>
            <Route path={`${accountPath}/referral-program`}
                   render={() => (
                       <AccountReferralProgramContainer onBack={onNavigateAccount}
                                                        title={formatMessage(messages.referral_title)}
                                                        onNavigateReferralProgram={onNavigateReferralProgram}/>
                   )}/>
            <Route path={`${accountPath}/wishlist`}
                   render={() => (
                       <AccountWishlistComponent onBack={onNavigateAccount}
                                                 title={formatMessage(messages.wishlist_title)}
                                                 onNavigateWishlist={onNavigateWishlist}/>
                   )}/>
            {isSMdown ? (
                <Route path={accountPath}
                       render={() => (
                           <AccountMenuContainer accountPath={accountPath}
                                                 infoNavigatePath={infoNavigatePath}
                                                 securityNavigatePath={securityNavigatePath}
                                                 addressesNavigatePath={addressesNavigatePath}
                                                 ordersNavigatePath={ordersNavigatePath}
                                                 couponsNavigatePath={couponsNavigatePath}
                                                 referralProgramNavigatePath={referralProgramNavigatePath}
                                                 preferencesNavigatePath={preferencesNavigatePath}
                                                 wishlistNavigatePath={wishlistNavigatePath}
                                                 onLogout={onLogout}/>
                       )}/>
            ) : (
                <Route path={accountPath}
                       render={() => (
                           <AccountInfoContainer onBack={onNavigateAccount}
                                                 title={formatMessage(messages.information_title)}/>
                       )}/>
            )}
        </Switch>
    );
}
