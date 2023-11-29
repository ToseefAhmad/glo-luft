import './ProductSearchPage.scss';

import React, {
    useMemo,
    useState,
    useEffect,
    useCallback,
    useRef
} from 'react';
import {useIntl} from 'react-intl';
import {useLocation, useHistory} from 'react-router';
import {parse} from 'query-string';

import {
    ProductSearchContainer,
    ProductSearchFiltersAndSortsContainer,
    SearchTopBarComponent
} from '@luft/catalog';
import {ProductListComponent, ProductSortsDropdownComponent} from '@luft/product';
import {BackComponent} from '@luft/common';

import {MetaComponent} from 'bat-core/common';
import {getSortFromSearch, getSearchWithSort} from 'bat-core/catalog';

import messages from './resources/messages';

type Props = {
    metaDescription: string
};

const PLACEHOLDER_ITEMS_NUMBER = 20;

export const ProductSearchPage = ({metaDescription = ''}: Props) => {
    const location = useLocation();
    const history = useHistory();
    const {formatMessage} = useIntl();
    const isFirstRenderRef = useRef(true);

    const {search} = useMemo(() => parse(location.search), [location.search]);
    const [sort, setSort] = useState(() => getSortFromSearch(location.search));

    const handleOnPageLoaded = useCallback((data) => {
        const appliedSort = data?.productSearch?.applied_sort;

        if (!appliedSort) return;

        history.push({search: getSearchWithSort(appliedSort, {search})});
    }, [history, search]);

    useEffect(() => {
        // Avoid sort resetting on mount
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            return;
        }

        setSort(undefined);
    }, [search]);

    return (
        <div className="product-search-page">
            <MetaComponent meta={{
                meta_title: formatMessage(messages.meta_title, {search}),
                meta_description: metaDescription
            }}/>
            <ProductSearchContainer search={search}
                                    sortInput={sort}
                                    onPageLoaded={handleOnPageLoaded}>
                <BackComponent/>
                <div className="product-search-page-content">
                    <div className="product-search-page-header">
                        <div className="product-search-page-top-bar container">
                            <ProductSearchFiltersAndSortsContainer as={ProductSortsDropdownComponent}
                                                                   search={search}
                                                                   onSortInputChange={setSort}/>
                            <SearchTopBarComponent search={search}/>
                        </div>
                    </div>
                    <ProductListComponent isLoadingSort={!sort}
                                          placeholderItemsNumber={PLACEHOLDER_ITEMS_NUMBER}/>
                </div>
            </ProductSearchContainer>
        </div>
    );
};
