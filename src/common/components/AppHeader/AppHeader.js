import './AppHeader.scss';

import React from 'react';
import {
    useLocation,
    useHistory,
    useRouteMatch
} from 'react-router';
import {parse, stringify} from 'query-string';

import {OfflineBarComponent, useResolutions} from '@luft/common';
import {SearchComponent} from '@luft/catalog';
import {CmsBlockContainer} from '@luft/cms';
import {CartBarContainer} from '@luft/cart';
import {useIsAuthorized} from '@luft/user';

import {CartBarComponent, useMiniCart} from 'bat-core/cart';
import {NavigationComponent, useStoreConfigQuery} from 'bat-core/common';
import {MenuSetContainer} from 'bat-core/catalog';
import {AccountNavControlAltContainer} from 'bat-core/account';
import {SettingsNavItemComponent} from 'bat-core/user';
import {StoreLocatorNavControlComponent} from 'bat-core/store-locator';
import {WishlistNavItemComponent} from 'bat-core/wishlist';

type Props = {
    title: string,
    isPushNotificationEnabled: boolean,
    isStoreLocatorEnabled: boolean,
    logoUrl?: string
};

export function AppHeader(props: Props) {
    const history = useHistory();
    const location = useLocation();
    const {isEnabledMiniCart, onToggleMiniCart} = useMiniCart();
    const shouldRenderFullHeader = !useRouteMatch(['/cart', '/checkout']);
    const isAuthorized = useIsAuthorized();
    const {data: storeConfigData} = useStoreConfigQuery();

    const {
        title,
        isPushNotificationEnabled,
        isStoreLocatorEnabled,
        logoUrl
    } = props;

    const {search} = parse(location.search);
    const {isXS} = useResolutions();

    const isWihlistEnabled = storeConfigData?.storeConfig?.magento_wishlist_general_is_enabled === '1';

    const onNavigateSearchResults = (searchQuery) => history.push(`/search?${stringify({search: searchQuery})}`);

    const onNavigateAccount = () => {
        history.push('/account');
    };

    const handleCartTrigger = () => {
        if (isEnabledMiniCart) {
            onToggleMiniCart();
        } else {
            history.push('/cart');
        }
    };

    const onNavigateWishlist = () => {
        history.push('/account/wishlist');
    };

    const onNavigateStoreLocation = () => {
        history.push('/store-locator');
    };

    return (
        <div className="app-header">
            <OfflineBarComponent/>
            <div className="app-header-top-bar">
                <NavigationComponent title={title}
                                     logoUrl={logoUrl}
                                     controls={shouldRenderFullHeader && (
                                         <>
                                             <SearchComponent search={search}
                                                              onNavigateSearchResults={onNavigateSearchResults}/>
                                             <AccountNavControlAltContainer onNavigate={onNavigateAccount}/>
                                             {!isXS && isStoreLocatorEnabled && (
                                                 // eslint-disable-next-line max-len
                                                 <StoreLocatorNavControlComponent onNavigateStore={onNavigateStoreLocation}/>
                                             )}
                                             {isWihlistEnabled && !isXS && isAuthorized && (
                                                 <WishlistNavItemComponent onNavigate={onNavigateWishlist}/>
                                             )}
                                             <CartBarContainer as={CartBarComponent}
                                                               onCartTrigger={handleCartTrigger}/>
                                         </>
                                     )}>
                    <div className="app-header-content">
                        <div className="app-header-content-menu-block">
                            <MenuSetContainer isShowAllControlVisible={true}
                                              segmentAfterPrimaryInformation={({activeCategoryId}) => (
                                                  <>
                                                      {isStoreLocatorEnabled && (
                                                          // eslint-disable-next-line max-len
                                                          <StoreLocatorNavControlComponent onNavigateStore={onNavigateStoreLocation}/>
                                                      )}
                                                      {isWihlistEnabled && isAuthorized && (
                                                          <WishlistNavItemComponent onNavigate={onNavigateWishlist}/>
                                                      )}
                                                      {isPushNotificationEnabled && (
                                                          // eslint-disable-next-line max-len
                                                          <SettingsNavItemComponent activeCategoryId={activeCategoryId}/>
                                                      )}
                                                  </>
                                              )}/>
                        </div>
                    </div>
                </NavigationComponent>
            </div>
            {!isXS && (
                <div className="app-header-content-menu-block">
                    <MenuSetContainer isShowAllControlVisible={true}
                                      segmentAfterPrimaryInformation={({activeCategoryId}) => (
                                          <>
                                              {isPushNotificationEnabled && (
                                                  <SettingsNavItemComponent activeCategoryId={activeCategoryId}/>
                                              )}
                                          </>
                                      )}/>
                </div>
            )}
            <CmsBlockContainer cmsBlockId="top-stripe-block"
                               group="header"/>
            <CmsBlockContainer cmsBlockId="top-promo-block"
                               group="header"/>
        </div>
    );
}
