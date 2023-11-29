import React, {
    useState,
    useEffect,
    useRef
} from 'react';
import {isFunction} from 'lodash';
import {useIntl} from 'react-intl';
import {useHistory, useLocation} from 'react-router';

import {ModalComponent, useScrollTo} from '@luft/common';
import {ProductAttributesComponent, ProductDescriptionComponent} from '@luft/product';
import {ProductAttributeContentComponent} from '@luft/product/src/components/ProductAttributeContent.component/ProductAttributeContent.component';
import type {Product, ProductAttribute} from '@luft/types';

import messages from '../../../../../product/components/ProductSecondaryInformationModals.component/resources/messages';

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

export function ProductSecondaryInformationModalsComponent(props: Props) {
    const {
        product,
        description,
        productAttrs,
        explicitProductAttrs,
        items
    } = props;

    const {formatMessage} = useIntl();
    const location = useLocation();
    const history = useHistory();
    const containerRef = useRef();
    const scrollTop = useScrollTo(containerRef);
    const [openModalKey, setOpenModalKey] = useState(null);

    useEffect(() => {
        const item = items && items.find(({key}) => location.hash === `#${key}`);
        const modalKey = item?.key;

        if (!modalKey) return;

        setOpenModalKey(modalKey);
        scrollTop();
    }, [location]);

    const handleToggleShowModal = () => {
        if (!location.hash) return;

        // Remove the previously set hash
        history.replace({...location, hash: ''});
    };

    const handleToggleShowCustomModal = (key, isOpen) => {
        setOpenModalKey(isOpen ? key : null);

        if (isOpen) return;

        // Remove the previously set hash
        history.replace({...location, hash: ''});
    };

    return (
        <div className="product-secondary-information-modals-component"
             ref={containerRef}>
            {!!description && (
                <ModalComponent modalTitle={formatMessage(messages.description_title)}
                                showOpenButton={true}
                                onToggleShow={handleToggleShowModal}>
                    <ProductDescriptionComponent description={description}/>
                </ModalComponent>
            )}
            {!!productAttrs?.length && (
                <ModalComponent modalTitle={formatMessage(messages.product_attributes_title)}
                                showOpenButton={true}
                                onToggleShow={handleToggleShowModal}>
                    <ProductAttributesComponent product_attributes={productAttrs}/>
                </ModalComponent>
            )}
            {!!explicitProductAttrs?.length && (explicitProductAttrs.map(tab => (
                <ModalComponent key={tab.product_attribute_id}
                                modalTitle={tab.name}
                                showOpenButton={true}
                                onToggleShow={handleToggleShowModal}>
                    <ProductAttributeContentComponent productAttribute={tab}/>
                </ModalComponent>
            )))}
            {!!items && items.map(({key, Title, Body}) => (
                <ModalComponent key={key}
                                modalTitle={isFunction(Title) ? <Title product={product}/> : Title}
                                showOpenButton={true}
                                show={openModalKey === key}
                                onToggleShow={(isOpen) => handleToggleShowCustomModal(key, isOpen)}>
                    <Body product={product}/>
                </ModalComponent>
            ))}
        </div>
    );
}
