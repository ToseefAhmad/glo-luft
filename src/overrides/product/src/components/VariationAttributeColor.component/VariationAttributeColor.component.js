import React from 'react';
import {noop} from 'lodash';
import classnames from 'classnames';

import type {
    VariationAttribute,
    VariationValue,
    VariationAttributeValue
} from '@luft/types';

type Props = {
    variationAttribute: VariationAttribute,
    variationValue: VariationValue,
    disabledValuesIds: string[],
    onValueSelect?: (variationAttributeValue: VariationAttributeValue) => any
};

const isValueSelected = (variationValue, attrValue) => variationValue && variationValue.value === attrValue.id;

export function VariationAttributeColorComponent(props: Props) {
    const {
        variationAttribute,
        variationValue,
        disabledValuesIds,
        onValueSelect = noop
    } = props;

    if (!variationAttribute) {
        return null;
    }

    return (
        <div className="variation-attribute-color-component">
            {variationAttribute.values.map(variationAttributeValue => {
                const {id, name, value} = variationAttributeValue;

                const isDisabled = disabledValuesIds.includes(id);
                const isSelected = isValueSelected(variationValue, variationAttributeValue);

                const activeClassNames = classnames('variation-attribute-color-component-value', {
                    'variation-attribute-color-component-value-active': isSelected,
                    'variation-attribute-color-component-value-disabled': isDisabled
                });

                return (
                    <button key={id}
                            className={activeClassNames}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => onValueSelect(variationAttributeValue)}
                            title={name}>
                        <div className="variation-attribute-color-component-content"
                             style={{backgroundColor: value}}/>

                        <span className="sr-only">
                            {name}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

VariationAttributeColorComponent.TYPE = 'COLOR';
