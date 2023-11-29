import React, {
    useState,
    useRef,
    useEffect
} from 'react';
import {isFunction} from 'lodash';
import {useIntl} from 'react-intl';
import {useLocation, useHistory} from 'react-router';

import {
    TabContainerComponent,
    TabNavComponent,
    useScrollTo
} from '@luft/common';
import {ProductAttributeContentComponent} from '@luft/product/src/components/ProductAttributeContent.component';
import {ProductAttributesComponent, ProductDescriptionComponent} from '@luft/product';
import type {Product, ProductAttribute} from '@luft/types';

import messages from '../../../../../product/components/ProductSecondaryInformationTabs.component/resources/messages';

type Props = {
    /**
     * Product entity
     */
    product: Product,
    /**
     * Product Description
     */
    description?: string,
    /**
     * Array with the attributes which should be displayed in "Features" tab
     */
    productAttrs?: ProductAttribute[],
    /**
     * Array with the attributes which should be displayed in separate tabs
     */
    explicitProductAttrs?: ProductAttribute[],
    /**
     * Array of secondary information items.
     * Each item should contain:
     *  key - unique item identifier, used as react key prop and tab event key
     *  Title - modal heading and tab or open modal control title
     *  Body - modal or tab contents
     */
    items?: {
        key: string,
        Title: React.Component<{ product: Product }> | string,
        Body: React.Component<{ product: Product }>
    }[]
};

export function ProductSecondaryInformationTabsComponent(props: Props) {
    const {formatMessage} = useIntl();
    const container = useRef();
    const location = useLocation();
    const history = useHistory();
    const scrollTop = useScrollTo(container);

    const {
        product,
        description,
        productAttrs,
        explicitProductAttrs,
        items
    } = props;

    const [tabKey, setTabKey] = useState(() => {
        if (description) return 'description';
        if (productAttrs?.length > 0) return 'product-attributes';
        return 'description';
    });

    useEffect(() => {
        const item = items && items.find(({key}) => location.hash === `#${key}`);

        if (!item?.key) return;

        setTabKey(item.key);
        scrollTop();
    }, [location]);

    const handleSelectTab = tab => {
        setTabKey(tab);

        if (!location.hash) return;

        // Remove the previously set hash
        history.replace({...location, hash: ''});
    };

    return (
        <div className="product-secondary-information-tabs-component"
             ref={container}>
            <TabContainerComponent id="product-detail-tabs"
                                   activeKey={tabKey}
                                   onSelect={handleSelectTab}>
                <TabNavComponent>
                    {!!description && (
                        <TabNavComponent.Item>
                            <TabNavComponent.Link eventKey="description">
                                {formatMessage(messages.description_title)}
                            </TabNavComponent.Link>
                        </TabNavComponent.Item>
                    )}
                    {!!productAttrs?.length && (
                        <TabNavComponent.Item>
                            <TabNavComponent.Link eventKey="product-attributes">
                                {formatMessage(messages.product_attributes_title)}
                            </TabNavComponent.Link>
                        </TabNavComponent.Item>
                    )}
                    {!!explicitProductAttrs && explicitProductAttrs.map(tab => (
                        <TabNavComponent.Item key={tab.product_attribute_id}>
                            <TabNavComponent.Link eventKey={tab.product_attribute_id}>
                                {tab.name}
                            </TabNavComponent.Link>
                        </TabNavComponent.Item>
                    ))}
                    {!!items && items.map(({key, Title}) => (
                        <TabNavComponent.Item key={key}>
                            <TabNavComponent.Link eventKey={key}>
                                {isFunction(Title) ? (
                                    <Title product={product}/>
                                ) : (
                                    Title
                                )}
                            </TabNavComponent.Link>
                        </TabNavComponent.Item>
                    ))}
                </TabNavComponent>
                <TabContainerComponent.Content>
                    {!!description && (
                        <TabContainerComponent.Pane eventKey="description">
                            <ProductDescriptionComponent description={description}/>
                        </TabContainerComponent.Pane>
                    )}
                    {!!productAttrs?.length && (
                        <TabContainerComponent.Pane eventKey="product-attributes">
                            <ProductAttributesComponent product_attributes={productAttrs}/>
                        </TabContainerComponent.Pane>
                    )}
                    {!!explicitProductAttrs && explicitProductAttrs.map(tab => (
                        <TabContainerComponent.Pane key={tab.product_attribute_id}
                                                    eventKey={tab.product_attribute_id}>
                            <ProductAttributeContentComponent productAttribute={tab}/>
                        </TabContainerComponent.Pane>
                    ))}
                    {!!items && items.map(({key, Body}) => (
                        <TabContainerComponent.Pane key={key}
                                                    eventKey={key}>
                            <Body product={product}/>
                        </TabContainerComponent.Pane>
                    ))}
                </TabContainerComponent.Content>
            </TabContainerComponent>
        </div>
    );
}
