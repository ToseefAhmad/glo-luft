import React, {useEffect} from 'react';
import {isEmpty, noop} from 'lodash';
import {useIntl} from 'react-intl';
import {Link} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import classnames from 'classnames';
import {parse as parseDate} from 'date-fns';

import {
    ButtonComponent,
    CheckboxComponent,
    FormGroupComponent,
    GenderSelectComponent,
    LoaderComponent,
    useCustomerHiddenAttributes,
    useValidationPatterns
} from '@luft/common';
import type {RegisterInput} from '@luft/types';

import messages from '@luft/user/src/components/RegisterForm.component/resources/messages';

import {
    getDateFormatByStoreCode,
    getFormattedDate,
    getPhonePrefixByStoreCode,
    getStoreCodeByPathname,
    useFormInputRules,
    useStorage,
    isValidDob
} from 'bat-core/common';
import {useKtpIdValidation, useLegalAge} from 'bat-core/restrict-access';
import {trackRegistration} from 'bat-core/data-layer';

import {NamePrefixSelectComponent} from '../../../../../common';
import custom_messages from '../../../../../user/components/RegisterForm.component/resources/messages';

type UserData = {
    first_name: string,
    last_name: string,
    dob: string,
    document_type: string,
    document_number: string
};

type Props = {
    loading?: boolean,
    registerInput?: RegisterInput,
    isEmailPredefined?: boolean,
    isConfirmPassword?: boolean,
    isSocialRegister?: boolean,
    referralCode?: string,
    isReferralFieldReadOnly?: boolean,
    isEnabledSubscription?: boolean,
    userVerifiedData?: UserData,
    isEnabledDobAutocomplete?: boolean,
    minimumPasswordLength?: number,
    passwordRequiredClassesCount?: number,
    onRegister?: Function,
    onExtractDobFromNationalId?: Function
};

const HOUR = 60 * 1000 * 60;

export function RegisterFormComponent(props: Props) {
    const {formatMessage} = useIntl();
    const {register, errors, handleSubmit, setValue, trigger, watch, getValues} = useForm({mode: 'onBlur'});
    const {getMinLengthRule, getTrimRule, getPasswordRule} = useFormInputRules();
    const hiddenFields = useCustomerHiddenAttributes();
    const {email: emailPattern} = useValidationPatterns();
    const {validateKtpId} = useKtpIdValidation();
    const {legalAge, legalDate} = useLegalAge();
    const {getValue: getKtpIdValue} = useStorage({key: 'ktpID'});
    const storeCode = getStoreCodeByPathname();
    const phonePrefix = getPhonePrefixByStoreCode();
    const {dateFormat} = getDateFormatByStoreCode();

    const {
        loading,
        isEnabledSubscription,
        registerInput = {},
        isEmailPredefined = false,
        isConfirmPassword = true,
        isSocialRegister = false,
        referralCode = '',
        isReferralFieldReadOnly = false,
        userVerifiedData = {},
        minimumPasswordLength,
        passwordRequiredClassesCount,
        isEnabledDobAutocomplete = false,
        onRegister = noop,
        onExtractDobFromNationalId = noop
    } = props;

    const {
        first_name,
        last_name,
        email,
        dob,
        gender,
        phone_number,
        order_ids,
        prefix
    } = registerInput;

    const passwordRules = getPasswordRule(minimumPasswordLength, passwordRequiredClassesCount);
    const emailClassNames = classnames('register-form-component-email', {
        'register-form-component-email-predefined': email && isEmailPredefined
    });
    const phoneClassNames = classnames('phone-component', `phone-component-${storeCode}`);
    const ktpId = getKtpIdValue();
    const isIndonesia = storeCode === 'id';
    const isDobFieldDisabled = !!userVerifiedData?.dob || (isIndonesia && isEnabledDobAutocomplete)

    const isRenderField = (name) => !hiddenFields.includes(name);

    const handleOnRegister = async ({phone_number: phone, confirmPassword, is_subscribed, ...inputToSave}) => {
        const {document_type, document_number} = userVerifiedData;

        // If dob field was disabled, it was not automatically added to submit input
        const formattedDob = getFormattedDate(getValues('dob'), true);

        const data = {
            ...inputToSave,
            is_subscribed,
            dob: formattedDob,
            document_type,
            document_number,
            is_social_register: isSocialRegister,
            order_ids: order_ids || [],
            phone_number: `${phonePrefix}${phone}`
        };

        if (is_subscribed) {
            data.consent = true;
        }

        onRegister(data);
    };

    const handleOnError = (formErrors) => trackRegistration('fail', formErrors);
    const handleValidateConfirmPassword = (value) => value === watch('password') || formatMessage(messages.confirm_password_error);

    const handleValidateDateOfBirth = (value) => {
        const date = parseDate(value, dateFormat, new Date());

        if (!isValidDob(date)) {
            return formatMessage(custom_messages.incorrect_date_format);
        }

        return legalDate >= date || formatMessage(custom_messages.dob_error_message, {age: legalAge});
    };

    const handleChangePhoneNumber = ({target}) => {
        setValue('phone_number', target.value.replace(/[^0-9]/g, ''));
    };

    const handleChangeKtpId = ({target}) => {
        setValue('ktp_id', target.value.replace(/[^0-9]/g, ''));
    };

    const handleExtractDobFromNationalId = ({target}) => {
        if (!isEnabledDobAutocomplete) return;

        const enteredKtpId = target.value;
        const {isValid} = validateKtpId(enteredKtpId);

        if (!isValid) return;

        onExtractDobFromNationalId(enteredKtpId);
    };

    const handleValidateKtpId = (value) => {
        const {isValid, reason} = validateKtpId(value);

        if (isValid) return true;

        switch (reason) {
            case 'invalid-format':
                return formatMessage(custom_messages.error_message_empty);

            case 'invalid-age':
            default:
                return formatMessage(custom_messages.ktp_error_message, {age: legalAge});
        }
    };

    // Prefill dob if ktpId already exists.
    // Adding `ktpId` to deps will cause an additional unnecessary request
    useEffect(() => {
        if (!isIndonesia || !ktpId || !isEnabledDobAutocomplete) return;

        onExtractDobFromNationalId(ktpId);
    }, [isIndonesia, isEnabledDobAutocomplete]);

    // Update actual form value after changing the ktpId
    useEffect(() => {
        if (!isIndonesia || !dob) return;

        setValue('dob', getFormattedDate(dob));
    }, [dob, isIndonesia, setValue]);

    useEffect(() => {
        if (isEmpty(userVerifiedData)) return;

        const formattedDate = getFormattedDate(userVerifiedData?.dob);

        setValue('first_name', userVerifiedData?.first_name);
        setValue('last_name', userVerifiedData?.last_name);
        setValue('dob', formattedDate);
    }, [userVerifiedData, setValue]);

    return (
        <form noValidate
              className="register-form-component"
              onSubmit={handleSubmit(handleOnRegister, handleOnError)}>
            <fieldset>
                <div className="register-form-component-fields">
                    {isRenderField('prefix') && (
                        <FormGroupComponent as={NamePrefixSelectComponent}
                                            name="prefix"
                                            errors={errors}
                                            label={formatMessage(custom_messages.prefix)}
                                            defaultValue={prefix}
                                            isLabelActive={true}
                                            ref={register}/>
                    )}
                    {(isRenderField('first_name') || isRenderField('firstname')) && (
                        <FormGroupComponent controlId="first_name"
                                            name="first_name"
                                            defaultValue={first_name}
                                            isLabelActive={!!userVerifiedData?.first_name}
                                            errors={errors}
                                            label={formatMessage(messages.first_name)}
                                            ref={register({
                                                required: true,
                                                validate: getTrimRule
                                            })}/>
                    )}
                    {(isRenderField('last_name') || isRenderField('lastname')) && (
                        <FormGroupComponent controlId="last_name"
                                            name="last_name"
                                            defaultValue={last_name}
                                            errors={errors}
                                            isLabelActive={!!userVerifiedData?.last_name}
                                            label={formatMessage(messages.last_name)}
                                            ref={register({
                                                required: true,
                                                validate: getTrimRule
                                            })}/>
                    )}
                    {isRenderField('email') && (
                        <FormGroupComponent controlId="email"
                                            name="email"
                                            type="email"
                                            defaultValue={email}
                                            errors={errors}
                                            readOnly={email && (isEmailPredefined || isSocialRegister)}
                                            label={formatMessage(messages.email)}
                                            className={emailClassNames}
                                            ref={register({
                                                required: true,
                                                pattern: emailPattern
                                            })}/>
                    )}
                    {isRenderField('ktp_id') && (
                        <FormGroupComponent controlId="ktp_id"
                                            name="ktp_id"
                                            type="text"
                                            defaultValue={ktpId}
                                            errors={errors}
                                            label={formatMessage(custom_messages.ktp_id)}
                                            onInput={handleChangeKtpId}
                                            onBlur={handleExtractDobFromNationalId}
                                            ref={register({
                                                validate: handleValidateKtpId
                                            })}/>
                    )}
                    {isRenderField('dob') && (
                        <FormGroupComponent controlId="dob"
                                            type="datepicker"
                                            name="dob"
                                            autoComplete="off"
                                            errors={errors}
                                            label={formatMessage(messages.dob)}
                                            isLabelActive={true}
                                            defaultValue={userVerifiedData?.dob || dob}
                                            disabled={isDobFieldDisabled}
                                            ref={null}
                                            register={register({
                                                required: true,
                                                validate: handleValidateDateOfBirth
                                            })}
                                            trigger={trigger}
                                            dateFormat={dateFormat}
                                            datePickerProps={{
                                                disabledDays: [{
                                                    after: new Date(Date.now() - 24 * HOUR)
                                                }]
                                            }}/>
                    )}
                    {isRenderField('gender') && (
                        <FormGroupComponent inputAs={GenderSelectComponent}
                                            controlId="gender"
                                            name="gender"
                                            errors={errors}
                                            label={formatMessage(messages.gender)}
                                            defaultValue={gender}
                                            isLabelActive={true}
                                            ref={register({required: true})}/>
                    )}
                    {isRenderField('phone_number') && (
                        <FormGroupComponent controlId="phone_number"
                                            className={phoneClassNames}
                                            name="phone_number"
                                            defaultValue={phone_number}
                                            errors={errors}
                                            label={formatMessage(custom_messages.phone_number)}
                                            onInput={handleChangePhoneNumber}
                                            ref={register({
                                                required: true,
                                                ...getMinLengthRule('phone')
                                            })}/>
                    )}
                    <FormGroupComponent controlId="referral"
                                        name="referral"
                                        errors={errors}
                                        ref={register}
                                        defaultValue={referralCode}
                                        readOnly={isReferralFieldReadOnly}
                                        label={formatMessage(custom_messages.referral)}/>
                    {!isSocialRegister && (
                        <>
                            <FormGroupComponent controlId="password"
                                                name="password"
                                                type="password"
                                                errors={errors}
                                                label={formatMessage(messages.password)}
                                                ref={register({
                                                    required: true,
                                                    ...passwordRules
                                                })}/>
                            <div className="register-form-component-tooltip">
                                {formatMessage(custom_messages.tooltip_password, {
                                    minLength: minimumPasswordLength,
                                    minClasses: passwordRequiredClassesCount
                                })}
                            </div>
                            {isConfirmPassword && (
                                <FormGroupComponent controlId="confirmPassword"
                                                    name="confirmPassword"
                                                    type="password"
                                                    errors={errors}
                                                    label={formatMessage(messages.confirm_password)}
                                                    ref={register({
                                                        required: true,
                                                        validate: handleValidateConfirmPassword
                                                    })}/>
                            )}
                        </>
                    )}
                    <CheckboxComponent id="terms_conditions"
                                       label={formatMessage(custom_messages.terms_conditions, {
                                           link: text => (
                                               <Link key={text}
                                                     className="register-form-component-terms-conditions-link"
                                                     to="/terms-and-conditions"
                                                     title={formatMessage(custom_messages.terms_and_conditions_title)}>
                                                   {text}
                                               </Link>
                                           ),
                                           secondLink: text => (
                                               <Link key={text}
                                                     className="register-form-component-terms-conditions-link"
                                                     to="/privacy-policy"
                                                     title={formatMessage(custom_messages.privacy_policy_title)}>
                                                   {text}
                                               </Link>
                                           )
                                       })}
                                       name="terms_conditions"
                                       errors={errors}
                                       ref={register({required: true})}/>
                    {isEnabledSubscription && (
                        <CheckboxComponent id="is_subscribed"
                                           label={formatMessage(custom_messages.consent)}
                                           name="is_subscribed"
                                           errors={errors}
                                           ref={register}
                                           defaultChecked={true}/>
                    )}
                </div>
            </fieldset>
            <ButtonComponent className="register-form-component-submit"
                             type="submit"
                             disabled={loading}
                             title={formatMessage(custom_messages.register_submit)}>
                <span className="register-form-component-submit-title">
                    {formatMessage(custom_messages.register_submit)}
                </span>
                {loading && (
                    <LoaderComponent size="sm"
                                     variant="light"
                                     type="attached"/>
                )}
            </ButtonComponent>
        </form>
    );
}
