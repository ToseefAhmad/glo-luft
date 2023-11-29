import './CategoryPage.scss';

import React, {useState, useCallback} from 'react';
import {useLocation, useHistory} from 'react-router';

import {
    CategoryMetaContainer,
    CategoryProductFiltersAndSortsContainer,
    CategoryProductsContainer,
    CategoryBreadcrumbsContainer,
    CategoryProductsNameComponent,
    CategoryProductsTotalComponent,
    useWarmCategoryProductsCache
} from '@luft/catalog';
import {
    ProductListComponent,
    ProductSortsDropdownComponent,
    useWarmProductCache
} from '@luft/product';
import {useResolutions} from '@luft/common';
import type {EntityUrl} from '@luft/types';

import {HreflangsComponent} from 'bat-core/common';
import {getSortFromSearch, getSearchWithSort} from 'bat-core/catalog';

type Props = {
    /**
     * Category entity ID
     */
    entityId: number,
    /**
     * Category entity url
     */
    entityUrl: EntityUrl
};

const PLACEHOLDER_ITEMS_NUMBER = 20;

export function CategoryPage({entityId, entityUrl}: Props) {
    const {isSMdown} = useResolutions();
    const warmCategoryProducts = useWarmCategoryProductsCache();
    const warmProductDetails = useWarmProductCache();
    const history = useHistory();
    const {search} = useLocation();

    const [sort, setSort] = useState(() => getSortFromSearch(search));

    const warmProductsPage = useCallback((data, page) => {
        // eslint-disable-next-line no-unused-expressions
        data?.category?.products?.items?.forEach(({id}) => warmProductDetails(id));
        const products = data?.category?.products;
        const count = products?.count || 0;
        const start = products?.start || 0;
        const total = products?.total || 0;
        if (total > count + start) {
            warmCategoryProducts(data?.category?.id, page + 1);
        }
    }, [warmProductDetails, warmCategoryProducts]);

    const handleOnPageLoaded = useCallback((data, page) => {
        warmProductsPage(data, page);

        const appliedSort = data?.category?.products?.applied_sort;

        if (!appliedSort) return;

        history.push({search: getSearchWithSort(appliedSort)});
    }, [warmProductsPage, history]);

    return (
        <div className="category-page">
            <CategoryMetaContainer categoryId={entityId}/>
            <HreflangsComponent hreflangs={entityUrl?.hreflangs}/>
            <CategoryBreadcrumbsContainer categoryId={entityId}/>
            <CategoryProductsContainer categoryId={entityId}
                                       sortInput={sort}
                                       onPageLoaded={handleOnPageLoaded}>
                <div className="category-page-content">
                    <div className="category-page-header">
                        {isSMdown && <CategoryProductsNameComponent/>}
                        <div className="category-page-top-bar container">
                            <CategoryProductFiltersAndSortsContainer as={ProductSortsDropdownComponent}
                                                                     categoryId={entityId}
                                                                     onSortInputChange={setSort}/>
                            <CategoryProductsTotalComponent/>
                        </div>
                    </div>
                    <ProductListComponent isLoadingSort={!sort}
                                          placeholderItemsNumber={PLACEHOLDER_ITEMS_NUMBER}/>
                </div>
            </CategoryProductsContainer>
        </div>
    );
}
