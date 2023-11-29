import React, {useEffect} from 'react';
import {noop} from 'lodash';
import {useIntl} from 'react-intl';
import {useLocation, useHistory} from 'react-router';
import type {ComponentType} from 'react';

import {
    LoaderComponent,
    useToast,
    useCustomerHiddenAttributes,
    useStoreConfigQuery
} from '@luft/common';
import {useViewerQuery} from '@luft/user';
import {AccountInfoComponent, useUpdateViewerMutation} from '@luft/account';
import messages from '@luft/account/src/components/AccountInfo.container/resources/messages';

import {useUpdateAndVerifyViewerMutation} from 'bat-core/account';
import {useExtractDobFromNationalIdLazyQuery} from 'bat-core/restrict-access';
import {getReferralManager} from 'bat-core/user';
import VIEWER_INFO_MUTATION from 'bat-core/account/src/graphql/mutations/UpdateViewer.mutation.graphql';

import custom_messages from '../../../../../account/components/AccountInfo.container/resources/messages';

type Props = {
    /**
     * Prop, that identifies component, used for data presentation
     */
    as?: ComponentType<{}>,
    /**
     * Prop, that identifies component, used for presentation of loading state
     */
    loadingAs?: ComponentType<{}>,
    /**
     * Flag, used to identify handling of loading state by container
     */
    awaitResult?: boolean,
    /**
     * Callback for saving info updates
     */
    onSaveInfoUpdates?: Function,
    /**
     * Callback for error saving info update
     */
    onErrorSaveInfoUpdates?: Function
};

export function AccountInfoContainer(props: Props) {
    const {
        as: Component = AccountInfoComponent,
        loadingAs: Loading = LoaderComponent,
        awaitResult = true,
        onSaveInfoUpdates = noop,
        onErrorSaveInfoUpdates = noop,
        ...other
    } = props;

    const {data: viewerData, loading: viewerLoading} = useViewerQuery();
    const {data: storeConfigData} = useStoreConfigQuery();
    const updateViewerMutation = useUpdateViewerMutation({}, VIEWER_INFO_MUTATION);
    const updateAndVerifyViewerMutation = useUpdateAndVerifyViewerMutation();
    const hiddenFields = useCustomerHiddenAttributes();
    const {formatMessage} = useIntl();
    const addToast = useToast();
    const {pathname, state} = useLocation();
    const history = useHistory();
    const extractDobQuery = useExtractDobFromNationalIdLazyQuery();

    const [
        viewerInfoMutation,
        {loading: updateViewerLoading, error: updateViewerError}
    ] = updateViewerMutation;
    const [
        verifyViewerInfo,
        {loading: updateAndVerifyLoading, error: updateAndVerifyError}
    ] = updateAndVerifyViewerMutation;
    const [
        extractDobFromNationalId,
        {data: extractDobData, loading: extractDobLoading, error: extractDobError}
    ] = extractDobQuery;

    const {getCode} = getReferralManager();
    const account = viewerData?.viewer?.user;
    const isReferralProgramEnabled = storeConfigData?.storeConfig?.is_referral_program_enabled;
    const referralCode = isReferralProgramEnabled ? getCode(pathname) : '';
    const isEnabledDobAutocomplete = storeConfigData?.storeConfig?.is_enabled_dob_autocomplete;
    const dob = extractDobData?.extractDobFromNationalId?.dob;
    const loading = updateViewerLoading || updateAndVerifyLoading || extractDobLoading;
    const error = updateViewerError || updateAndVerifyError || extractDobError;
    const {isVerificationLocked, verificationError} = state || {};

    const handleReferralSave = async () => {
        const referralData = {referral: referralCode};
        const resp = await viewerInfoMutation({viewer_info: referralData});
        addToast(formatMessage(custom_messages.success_applied), 'success');
        onSaveInfoUpdates(referralData);
        return resp;
    };

    useEffect(() => {
        if (!referralCode) return;

        if (account?.referral) {
            addToast(formatMessage(custom_messages.is_exist_referral), 'success');
        } else {
            handleReferralSave();
        }
    }, []);

    const handleInfoChange = async ({password, new_password, is_age_verified, ...others}) => {
        if (isVerificationLocked) {
            try {
                const resp = await verifyViewerInfo({viewer_info: others});
                addToast(formatMessage(messages.save_success), 'success');
                onSaveInfoUpdates(others);
                history.push('/checkout');

                return resp;
            } catch (e) {
                onErrorSaveInfoUpdates(e);
            }
        } else {
            const resp = await viewerInfoMutation({viewer_info: {...others}, password, new_password});
            addToast(formatMessage(messages.save_success), 'success');
            onSaveInfoUpdates({password, new_password, ...others});

            return resp;
        }
    };

    const handleExtractDobFromNationalId = (ktpId) => {
        extractDobFromNationalId({variables: {national_id: ktpId}});
    };

    if (awaitResult && viewerLoading) return Loading && <Loading/>;

    return (
        <Component {...other}
                   q={viewerData}
                   m={updateViewerMutation}
                   referralCode={referralCode}
                   account={{...account, ...(dob && {dob})}}
                   isVerificationLocked={isVerificationLocked}
                   verificationError={verificationError}
                   loading={loading}
                   error={error}
                   hiddenFields={hiddenFields}
                   isEnabledDobAutocomplete={isEnabledDobAutocomplete}
                   onExtractDobFromNationalId={handleExtractDobFromNationalId}
                   onSaveInfoUpdates={handleInfoChange}/>
    );
}
