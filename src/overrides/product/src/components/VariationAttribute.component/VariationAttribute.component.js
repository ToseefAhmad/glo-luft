import React, {useMemo} from 'react';

import {
    VariationAttributeTitleComponent,
    VariationAttributeTextComponent,
    VariationAttributeSwatchComponent,
    VariationAttributeDropdownComponent
} from '@luft/product';
import type {
    VariationAttribute,
    VariationValue,
    VariationAttributeValue
} from '@luft/types';

import {VariationAttributeAdaptiveComponent} from '../../../../../product';

function getComponentByType(type) {
    switch (type) {
        case 'COLOR_SWATCH':
        case 'IMAGE_SWATCH':
            return VariationAttributeSwatchComponent;
        case 'DROPDOWN':
            return VariationAttributeDropdownComponent;
        case 'ADAPTIVE_SWATCH':
            return VariationAttributeAdaptiveComponent;
        default:
            return VariationAttributeTextComponent;
    }
}

const selectedValueName = (variationValue, variationAttribute) => {
    if (variationValue && variationValue.value) {
        const value = variationAttribute.values.find(i => i.id === variationValue.value);
        return value && value.name;
    }
};

type Props = {
    /**
     * Variation attribute for the specified product
     */
    variationAttribute: VariationAttribute,
    /**
     * Selected variation value of the variation attribute
     */
    variationValue?: VariationValue,
    /**
     * Disabled variation values IDs
     */
    disabledValuesIds?: string[],
    /**
     * Callback when user select variation value
     */
    onValueSelect?: (variationAttributeValue: VariationAttributeValue) => any
};

/**
 * The component displays a variation attribute title and values.
 */
export function VariationAttributeComponent(
    {
        variationAttribute,
        variationValue,
        disabledValuesIds,
        onValueSelect
    }: Props) {
    const VariationAttributeType = useMemo(() => getComponentByType(variationAttribute?.type), [
        variationAttribute?.type
    ]);
    const variationAttributeValueName = useMemo(() => selectedValueName(variationValue, variationAttribute), [
        variationAttribute,
        variationValue
    ]);

    return !!variationAttribute && (
        <div className="variation-attribute">
            <VariationAttributeTitleComponent name={variationAttribute.name}
                                              valueName={variationAttributeValueName}/>
            <VariationAttributeType variationAttribute={variationAttribute}
                                    variationValue={variationValue}
                                    disabledValuesIds={disabledValuesIds}
                                    onValueSelect={onValueSelect}/>
        </div>
    );
}
