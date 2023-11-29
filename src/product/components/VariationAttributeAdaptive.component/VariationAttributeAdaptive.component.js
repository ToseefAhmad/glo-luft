import React from 'react';
import {noop} from 'lodash';
import classnames from 'classnames';

import type {VariationValue} from '@luft/types';

type VariationAttributeValue = {
    id: string,
    name: string,
    value?: string,
    position: number
};

type VariationAttribute = {
    options_count: number,
    values: VariationAttributeValue[]
};

type Props = {
    variationAttribute: VariationAttribute,
    variationValue: VariationValue,
    disabledValuesIds: string[],
    onValueSelect?: (variationAttributeValue: VariationAttributeValue) => any
};

const isValueSelected = (variationValue, attrValue) => variationValue && variationValue.value === attrValue.id;

const createIndicatorList = (amount: number, filledAmount: number): boolean[] =>
    // eslint-disable-next-line implicit-arrow-linebreak
    [...Array(filledAmount - 1).fill(true), ...Array(amount - filledAmount).fill(false)];

export function VariationAttributeAdaptiveComponent(props: Props) {
    const {
        variationAttribute,
        variationValue,
        disabledValuesIds,
        onValueSelect = noop
    } = props;

    if (!variationAttribute) {
        return null;
    }

    const {options_count} = variationAttribute;

    return (
        <div className="variation-attribute-adaptive-component">
            {variationAttribute.values.map((variationAttributeValue) => {
                const {id, name, position} = variationAttributeValue;

                const isDisabled = disabledValuesIds.includes(id);
                const isSelected = isValueSelected(variationValue, variationAttributeValue);
                const indicatorList = createIndicatorList(options_count, position);

                const activeClassNames = classnames('variation-attribute-adaptive-component-value', {
                    'variation-attribute-adaptive-component-value-active': isSelected,
                    'variation-attribute-adaptive-component-value-disabled': isDisabled
                });

                // Currently swatches have numbers as labels (such as "06" or "18"), but
                // non-nicotine variation has label "Zero", which should be lowercased.
                // This check will make sure, that all alphabetic labels will be lowercased
                const isNumericName = !Number.isNaN(+name);

                return (
                    <button className={activeClassNames}
                            type="button"
                            onClick={() => onValueSelect(variationAttributeValue)}
                            key={id}
                            disabled={isDisabled}
                            title={name}>
                        <div className="variation-attribute-adaptive-component-content">
                            <div className="variation-attribute-adaptive-component-indicators">
                                {indicatorList.map((isFilled, i) => (
                                    // eslint-disable-next-line react/no-array-index-key
                                    <div key={i}
                                         style={{height: `${(100 / (options_count - 1)) * (i + 1)}%`}}
                                         className={classnames('variation-attribute-adaptive-component-indicator', {
                                             'variation-attribute-adaptive-component-indicator-filled': isFilled
                                         })}/>
                                ))}
                            </div>

                            <span className={classnames('variation-attribute-adaptive-component-name', {
                                'variation-attribute-adaptive-component-name-small': !isNumericName,
                                'variation-attribute-adaptive-component-name-large': isNumericName
                            })}>
                                {name}
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
