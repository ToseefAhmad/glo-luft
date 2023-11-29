import React, {
    useContext,
    useEffect,
    useState,
    useCallback
} from 'react';
import {isEmpty} from 'lodash';
import {useIntl} from 'react-intl';
import {useForm} from 'react-hook-form';

import {
    ButtonComponent,
    CountryContainer,
    ErrorComponent,
    FormGroupComponent,
    LoaderComponent
} from '@luft/common';
import type {ShippingCartAddress} from '@luft/types';

import messages from '@luft/shipping/src/components/ShippingAddressForm.component/resources/messages';

import {CheckoutContext} from 'bat-core/checkout';
import {
    RegionControlComponent,
    CityControlComponent,
    DistrictControlComponent,
    getStoreCodeByPathname,
    useFormInputRules
} from 'bat-core/common';

import custom_messages from '../../../../../shipping/components/ShippingAddressForm.component/resources/messages';

type AddressSettings = {
    /**
     * Postcode maximum length, used for validation
     */
    postcode_max_length: number,
    /**
     * Postcode minimum length, used for validation
     */
    postcode_min_length: number,
    /**
     * Indicator, which is used for applying a particular settings to a 'company' field
     */
    show_company: 'required' | 'optional' | null,
    /**
     * Amount of 'street' fields
     */
    street_max_lines: number
};

type Props = {
    /**
     * Shipping address settings
     */
    addressSettings?: AddressSettings,
    /**
     * Shipping Address, assigned to cart as selected
     */
    shippingAddress?: ShippingCartAddress,
    /**
     * Flag, that either Shipping Address loading is in progress or saving of new Shipping Address is
     */
    loading?: boolean,
    /**
     * Error, that should be displayed on top of component, usually identifies Shipping Address failure
     */
    error?: Error,
    /**
     * Callback used on when new/edited Shipping Address should be saved
     */
    onSaveAddress?: (Object) => void,
    /**
     * Title of submit button
     */
    saveActionTitle?: string
};

const DEFAULT_STREET_MAX_LINES = 1;
const DEFAULT_SHOW_COMPANY = 'optional';

export function ShippingAddressFormComponent(props: Props) {
    const {formatMessage} = useIntl();

    const {
        addressSettings = {},
        shippingAddress,
        loading,
        error,
        onSaveAddress,
        saveActionTitle = formatMessage(messages.use_this_address)
    } = props;

    const {
        city,
        company,
        country,
        firstname,
        lastname,
        postcode,
        region,
        district,
        street,
        telephone
    } = shippingAddress || {};

    const {
        show_company = DEFAULT_SHOW_COMPANY,
        street_max_lines = DEFAULT_STREET_MAX_LINES
    } = addressSettings;

    const {register, handleSubmit, errors, setValue} = useForm();
    const {getMinLengthRule, getMaxLengthRule, getTrimRule, getPhoneRule} = useFormInputRules();
    const {onSetCheckoutErrors} = useContext(CheckoutContext);
    const storeCode = getStoreCodeByPathname();

    const [selectedCountryCode, setSelectedCountryCode] = useState(country?.code);
    const [selectedRegion, setSelectedRegion] = useState(region?.code);
    const [selectedCity, setSelectedCity] = useState(city);
    const [selectedDistrict, setSelectedDistrict] = useState(district);

    const streetHouseNumberErrorMessage = formatMessage(custom_messages.error_house_number);
    const isShownCompany = show_company !== null;
    const isIndonesia = storeCode === 'id';

    const clearDistrictData = useCallback(() => {
        setValue('district', '');
        setSelectedDistrict(null);
    }, [setValue]);

    const clearCityData = useCallback(() => {
        setValue('city', '');
        setSelectedCity(null);
        clearDistrictData();
    }, [setValue, clearDistrictData]);

    const clearRegionData = useCallback(() => {
        setValue('region', '');
        setSelectedRegion(null);
        clearCityData();
    }, [setValue, clearCityData]);

    const onRegionChange = useCallback(({target}, {setFirstValueAsDefault} = {}) => {
        setSelectedRegion(target.value);

        if (setFirstValueAsDefault) return;

        clearCityData();
    }, [clearCityData]);

    const onCityChange = useCallback(({target}, {setFirstValueAsDefault} = {}) => {
        setSelectedCity(target.value);

        if (setFirstValueAsDefault) return;

        clearDistrictData();
    }, [clearDistrictData]);

    const onDistrictChange = useCallback(({target}) => {
        setSelectedDistrict(target.value);
    }, []);

    const onCountryChange = useCallback(({target}, {setFirstValueAsDefault} = {}) => {
        setSelectedCountryCode(target.value);

        if (setFirstValueAsDefault) return;

        clearRegionData();
    }, [clearRegionData]);

    const handleOnSaveAddress = async (address) => onSaveAddress && await onSaveAddress(address);

    useEffect(() => {
        if (!isEmpty(errors)) {
            onSetCheckoutErrors(errors, 'address empty');
        }
    }, [errors, onSetCheckoutErrors]);

    return (
        <form noValidate
              className="shipping-address-form-component"
              onSubmit={handleSubmit(handleOnSaveAddress)}>
            {loading && <LoaderComponent type="overlay"/>}
            {error && <ErrorComponent error={error}/>}
            <fieldset>
                <legend>
                    {formatMessage(messages.contact_details)}
                </legend>
                <div className="shipping-address-form-component-personal-fields-holder">
                    <FormGroupComponent controlId="shippingFirstName"
                                        name="firstname"
                                        label={formatMessage(messages.first_name)}
                                        defaultValue={firstname}
                                        readOnly={!!firstname}
                                        errors={errors}
                                        ref={register({
                                            required: true,
                                            validate: getTrimRule
                                        })}/>
                    <FormGroupComponent controlId="shippingLastName"
                                        name="lastname"
                                        label={formatMessage(messages.last_name)}
                                        defaultValue={lastname}
                                        readOnly={!!lastname}
                                        errors={errors}
                                        ref={register({
                                            required: true,
                                            validate: getTrimRule
                                        })}/>
                    <FormGroupComponent controlId="shippingPhoneNumber"
                                        name="telephone"
                                        label={formatMessage(custom_messages.mobile_number)}
                                        defaultValue={telephone}
                                        errors={errors}
                                        ref={register({
                                            required: true,
                                            ...getPhoneRule()
                                        })}/>
                </div>
            </fieldset>
            <fieldset>
                <legend>
                    {formatMessage(messages.delivery_address)}
                </legend>
                <div className="shipping-address-form-component-address-fields-holder">
                    {isShownCompany && (
                        <FormGroupComponent controlId="shippingCompany"
                                            name="company"
                                            label={
                                                show_company === 'required'
                                                    ? formatMessage(custom_messages.company)
                                                    : formatMessage(custom_messages.company_optional)
                                            }
                                            defaultValue={company}
                                            errors={errors}
                                            ref={register({
                                                required: show_company === 'required',
                                                validate: getTrimRule
                                            })}/>
                    )}
                    {Array(street_max_lines).fill().map((_, i) => {
                        const isFirstStreetLine = !i;
                        const label = isFirstStreetLine
                            ? formatMessage(custom_messages.address)
                            : formatMessage(custom_messages.additional_address, {number: i + 1});
                        const rules = isFirstStreetLine && {
                            required: true,
                            pattern: {
                                value: /\d+/,
                                message: streetHouseNumberErrorMessage
                            },
                            ...getMinLengthRule('street')
                        };

                        return (
                            <FormGroupComponent key={`shippingAddress${i + 1}`}
                                                controlId={`shippingAddress${i + 1}`}
                                                name={`street[${i}]`}
                                                label={label}
                                                defaultValue={street?.[i]}
                                                errors={errors}
                                                ref={register(rules)}/>
                        );
                    })}
                    <CountryContainer selectedCountryCode={selectedCountryCode}
                                      controlId="shippingCountry"
                                      name="country_code"
                                      label={formatMessage(messages.country)}
                                      isLabelActive={true}
                                      errors={errors}
                                      ref={register({required: true})}
                                      setFirstValueAsDefault={true}
                                      onChange={onCountryChange}/>
                    <CountryContainer selectedCountryCode={selectedCountryCode}
                                      selectedRegion={selectedRegion}
                                      as={RegionControlComponent}
                                      controlId="shippingState"
                                      label={formatMessage(messages.state)}
                                      errors={errors}
                                      ref={register({required: true})}
                                      onChange={onRegionChange}
                                      defaultOption={selectedCountryCode
                                        ? formatMessage(custom_messages.select_first,
                                             {field: formatMessage(messages.country)})
                                        : formatMessage(custom_messages.select_option)}/>
                    <CountryContainer selectedCountryCode={selectedCountryCode}
                                      selectedRegion={selectedRegion}
                                      selectedCity={selectedCity}
                                      as={CityControlComponent}
                                      controlId="shippingCity"
                                      label={formatMessage(messages.city)}
                                      errors={errors}
                                      ref={register({required: true})}
                                      onChange={onCityChange}
                                      defaultOption={formatMessage(custom_messages.select_first, {
                                          field: formatMessage(messages.state)
                                      })}/>
                    {isIndonesia && (
                        <CountryContainer selectedCountryCode={selectedCountryCode}
                                          selectedRegion={selectedRegion}
                                          selectedCity={selectedCity}
                                          selectedDistrict={selectedDistrict}
                                          as={DistrictControlComponent}
                                          controlId="shippingDistrict"
                                          label={formatMessage(custom_messages.district)}
                                          errors={errors}
                                          ref={register({required: true})}
                                          onChange={onDistrictChange}
                                          defaultOption={formatMessage(custom_messages.select_first, {
                                              field: formatMessage(messages.city)
                                          })}/>
                    )}
                    <FormGroupComponent controlId="shippingPostcode"
                                        name="postcode"
                                        label={formatMessage(messages.postcode)}
                                        defaultValue={postcode}
                                        errors={errors}
                                        ref={register({
                                            required: true,
                                            pattern: {
                                                value: /^\d+$/,
                                                message: formatMessage(custom_messages.error_postcode_characters)
                                            },
                                            ...getMinLengthRule('postcode'),
                                            ...getMaxLengthRule('postcode')
                                        })}/>
                </div>
            </fieldset>
            <ButtonComponent className="shipping-address-form-component-submit"
                             variant="secondary"
                             type="submit"
                             disabled={loading}
                             title={saveActionTitle}>
                {saveActionTitle}
            </ButtonComponent>
        </form>
    );
}
