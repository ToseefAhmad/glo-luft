import React, {useState, useEffect} from 'react';
import {useIntl} from 'react-intl';
import {noop} from 'lodash';
import {useForm, useWatch} from 'react-hook-form';
import classnames from 'classnames';
import {parse as parseDate} from 'date-fns';

import {
    ButtonComponent,
    FormGroupComponent,
    useValidationPatterns,
    ErrorComponent,
    LoaderComponent,
    GenderSelectComponent,
    CheckboxComponent
} from '@luft/common';
import {AccountTitleComponent} from '@luft/account';
import type {User} from '@luft/types';
import messages from '@luft/account/src/components/AccountInfo.component/resources/messages';

import {
    getStoreCodeByPathname,
    getPhonePrefixByStoreCode,
    getDateFormatByStoreCode,
    getFormattedDate,
    useFormInputRules,
    useStorage,
    isValidDob
} from 'bat-core/common';
import {useKtpIdValidation, useLegalAge} from 'bat-core/restrict-access';
import {trackNewsletter} from 'bat-core/data-layer';

import {NamePrefixSelectComponent} from '../../../../../common';
import custom_messages from '../../../../../account/components/AccountInfo.component/resources/messages';

type Props = {
    account?: User,
    error?: Error,
    loading?: boolean,
    title?: string,
    referralCode?: string,
    hiddenFields?: string[],
    isVerificationLocked?: boolean,
    verificationError?: Error,
    isEnabledDobAutocomplete?: boolean,
    onBack?: Function,
    onSaveInfoUpdates?: Function,
    onExtractDobFromNationalId?: Function
};

const HOUR = 60 * 60 * 1000;

export function AccountInfoComponent(props: Props) {
    const {
        account,
        loading,
        error,
        title,
        referralCode,
        isVerificationLocked,
        verificationError,
        hiddenFields = [],
        isEnabledDobAutocomplete,
        onBack,
        onSaveInfoUpdates = noop,
        onExtractDobFromNationalId = noop
    } = props;

    const phonePrefix = getPhonePrefixByStoreCode();
    const defaultEmail = account?.email;
    const defaultPhoneNumber = account?.phone_number?.replace(phonePrefix, '');

    const {formatMessage} = useIntl();
    const {register, errors, handleSubmit, formState, setValue, trigger, getValues, control} = useForm({mode: 'onBlur'});
    const [isEmailVisible, setIsEmailVisible] = useState(false);
    const {email: emailPattern} = useValidationPatterns();
    const {validateKtpId} = useKtpIdValidation();
    const {getMinLengthRule, getTrimRule} = useFormInputRules();
    const {legalAge, legalDate} = useLegalAge();
    const isEmailLabelActive = !!useWatch({control, name: 'email', defaultValue: defaultEmail});
    const {getValue: getKtpIdValue} = useStorage({key: 'ktpID'});
    const storeCode = getStoreCodeByPathname();
    const {dateFormat} = getDateFormatByStoreCode();

    const isIndonesia = storeCode === 'id';
    const isAgeVerified = account?.is_age_verified;
    const dob = account?.dob;
    const errorMessage = error || verificationError;
    const ktpId = getKtpIdValue();
    const phoneClassNames = classnames('phone-component', `phone-component-${storeCode}`);

    // Prefill `dob` if `dob` doesn't exist and `ktpId` already exists.
    // Adding `ktpId` to deps will cause an additional unnecessary request
    useEffect(() => {
        if (!isIndonesia || !ktpId || dob || !isEnabledDobAutocomplete) return;

        onExtractDobFromNationalId(ktpId);
    }, [isIndonesia, isEnabledDobAutocomplete, dob]);

    // Update actual form value after changing the ktpId
    useEffect(() => {
        if (!isIndonesia || !dob) return;

        setValue('dob', getFormattedDate(dob));
    }, [dob, isIndonesia, setValue]);

    const toggleEmailField = () => setIsEmailVisible(prevIsEmailVisible => !prevIsEmailVisible);
    const isRenderField = (name) => !hiddenFields.includes(name);

    const handleOnCancelEmailUpdate = () => {
        setValue('email', defaultEmail, {shouldValidate: true});
        toggleEmailField();
    };

    const handleValidateDateOfBirth = (value) => {
        const date = parseDate(value, dateFormat, new Date());

        if (!isValidDob(date)) {
            return formatMessage(custom_messages.incorrect_date_format);
        }

        return legalDate >= date || formatMessage(custom_messages.dob_error_message, {age: legalAge});
    };

    const submitAccountInfo = ({email, phone_number: phone, ...input}) => {
        // If field was disabled, it was not automatically added to submit input,
        // but `getValues` will get it's actual value
        const formattedDob = getFormattedDate(getValues('dob'), true);
        const currentEmail = getValues('email');
        const currentPhoneNumber = `${phonePrefix}${phone}`;

        const dataWithoutEmail = {...input, phone_number: currentPhoneNumber, dob: formattedDob};
        const dataWithEmail = {...dataWithoutEmail, email: currentEmail};

        onSaveInfoUpdates(isEmailVisible ? dataWithEmail : dataWithoutEmail);

        if (input.consent && !account?.consent) {
            trackNewsletter();
        }
    };

    const handleChangeKtpId = ({target}) => {
        setValue('ktp_id', target.value.replace(/[^0-9]/g, ''));
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

    const handleChangePhoneNumber = ({target}) => {
        setValue('phone_number', target.value.replace(/[^0-9]/g, ''));
    };

    const handleExtractDobFromNationalId = ({target}) => {
        if (!isIndonesia || !isEnabledDobAutocomplete) return;

        const enteredKtpId = target.value;
        const {isValid} = validateKtpId(enteredKtpId);

        if (!isValid) return;

        onExtractDobFromNationalId(enteredKtpId);
    };

    // Prevent attempt of changing the dob manually in case it was disabled
    const handleChangeDob = () => {
        if (!isIndonesia || !isEnabledDobAutocomplete) return;

        const today = getFormattedDate(new Date());

        setValue('dob', today);
    };

    return (
        <div className="account-info-component">
            <AccountTitleComponent title={title}
                                   onBack={onBack}/>
            <div className="account-info-component-content">
                {loading && <LoaderComponent type="overlay"/>}
                <form className="account-info-component-form"
                      noValidate
                      onSubmit={handleSubmit(submitAccountInfo)}>
                    {errorMessage && <ErrorComponent error={errorMessage}/>}
                    <fieldset className="account-info-component-update-fields">
                        <legend>
                            {formatMessage(messages.content_title)}
                        </legend>
                        {isRenderField('email') && (
                            <FormGroupComponent controlId="email"
                                                defaultValue={defaultEmail}
                                                isLabelActive={isEmailLabelActive}
                                                error={!!errors?.email}
                                                label={formatMessage(messages.email)}
                                                variant="secondary"
                                                disabled={!isEmailVisible}
                                                displayIsValid={isEmailVisible}
                                                ref={register({
                                                    required: true,
                                                    pattern: emailPattern
                                                })}
                                                errors={errors}
                                                name="email"/>
                        )}
                        {!isEmailVisible && isRenderField('email') ? (
                            <ButtonComponent className="account-info-component-toggle-fields"
                                             title={formatMessage(messages.email_update)}
                                             variant="primary-link"
                                             onClick={toggleEmailField}>
                                <span>
                                    {formatMessage(messages.email_update)}
                                </span>
                            </ButtonComponent>
                        ) : (
                            <>
                                <FormGroupComponent controlId="password"
                                                    name="password"
                                                    type="password"
                                                    error={!!errors?.password}
                                                    variant="secondary"
                                                    label={formatMessage(messages.password)}
                                                    errors={errors}
                                                    ref={register({required: true})}/>
                                <ButtonComponent className="account-info-component-toggle-fields"
                                                 title={formatMessage(messages.email_cancel_update)}
                                                 variant="primary-link"
                                                 onClick={handleOnCancelEmailUpdate}>
                                    <span>
                                        {formatMessage(messages.email_cancel_update)}
                                    </span>
                                </ButtonComponent>
                            </>
                        )}
                    </fieldset>
                    <fieldset className="account-info-component-info">
                        {isRenderField('prefix') && (
                            <>
                                {account?.prefix ? (
                                    <FormGroupComponent controlId="prefix"
                                                        name="prefix"
                                                        errors={errors}
                                                        label={formatMessage(custom_messages.prefix)}
                                                        defaultValue={account?.prefix}
                                                        disabled={true}
                                                        isLabelActive={true}
                                                        ref={register}/>
                                ) : (
                                    <FormGroupComponent as={NamePrefixSelectComponent}
                                                        name="prefix"
                                                        errors={errors}
                                                        label={formatMessage(custom_messages.prefix)}
                                                        defaultValue={account?.prefix}
                                                        disabled={!!account?.prefix}
                                                        isLabelActive={true}
                                                        ref={register}/>
                                )}
                            </>
                        )}
                        {(isRenderField('first_name') || isRenderField('firstname')) && (
                            <FormGroupComponent controlId="first_name"
                                                name="first_name"
                                                defaultValue={account?.first_name}
                                                error={!!errors?.first_name}
                                                label={formatMessage(messages.first_name)}
                                                disabled={!isVerificationLocked && !!account?.first_name}
                                                variant="secondary"
                                                errors={errors}
                                                ref={register({
                                                    required: true,
                                                    validate: getTrimRule
                                                })}/>
                        )}
                        {(isRenderField('last_name') || isRenderField('lastname')) && (
                            <FormGroupComponent controlId="last_name"
                                                name="last_name"
                                                defaultValue={account?.last_name}
                                                error={!!errors?.last_name}
                                                label={formatMessage(messages.last_name)}
                                                disabled={!isVerificationLocked && !!account?.last_name}
                                                variant="secondary"
                                                errors={errors}
                                                ref={register({
                                                    required: true,
                                                    validate: getTrimRule
                                                })}/>
                        )}
                        {(isRenderField('ktp_id')) && (
                            <FormGroupComponent controlId="ktp_id"
                                                name="ktp_id"
                                                defaultValue={account?.ktp_id || ktpId}
                                                error={!!errors?.ktp_id}
                                                label={formatMessage(custom_messages.ktp_id)}
                                                disabled={!isVerificationLocked && !!account?.ktp_id}
                                                variant="secondary"
                                                errors={errors}
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
                                                defaultValue={dob}
                                                disabled={!!dob || isEnabledDobAutocomplete}
                                                register={register({
                                                    required: true,
                                                    validate: handleValidateDateOfBirth
                                                })}
                                                trigger={trigger}
                                                onChange={handleChangeDob}
                                                dateFormat={dateFormat}
                                                datePickerProps={{
                                                    disabledDays: [{
                                                        after: new Date(Date.now() - 24 * HOUR)
                                                    }]
                                                }}/>
                        )}
                        {(isRenderField('age_verified') && isAgeVerified) && (
                            <CheckboxComponent id="is_age_verified"
                                               label={formatMessage(custom_messages.is_age_verified, {
                                                   age: legalAge
                                               })}
                                               className="age-verified-checkbox"
                                               name="is_age_verified"
                                               defaultChecked={account?.is_age_verified}
                                               disabled={!!account?.is_age_verified}
                                               errors={errors}
                                               ref={register}/>
                        )}
                        {isRenderField('gender') && (
                            <FormGroupComponent inputAs={GenderSelectComponent}
                                                name="gender"
                                                errors={errors}
                                                label={formatMessage(messages.gender)}
                                                defaultValue={account?.gender}
                                                isLabelActive={true}
                                                ref={register({required: true})}/>
                        )}
                        <FormGroupComponent controlId="phone_number"
                                            className={phoneClassNames}
                                            name="phone_number"
                                            defaultValue={defaultPhoneNumber}
                                            errors={errors}
                                            label={formatMessage(custom_messages.mobile_number)}
                                            onInput={handleChangePhoneNumber}
                                            ref={register({
                                                required: true,
                                                validate: getTrimRule,
                                                ...getMinLengthRule('phone')
                                            })}/>
                        <FormGroupComponent controlId="referral"
                                            name="referral"
                                            errors={errors}
                                            ref={register}
                                            defaultValue={account?.referral || referralCode}
                                            label={formatMessage(custom_messages.referral)}/>
                    </fieldset>
                    <ButtonComponent className="account-info-component-submit"
                                     type="submit"
                                     title={formatMessage(messages.save_update)}
                                     disabled={!formState.isDirty}
                                     variant="secondary">
                        <span className="info-component-submit-title">
                            {formatMessage(messages.save_update)}
                        </span>
                    </ButtonComponent>
                </form>
            </div>
        </div>
    );
}
