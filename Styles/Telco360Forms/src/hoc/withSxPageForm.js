import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { SxFormContext } from '../forms/SxForm';
import { RightConsumer, SxModal, withSxNavigation, withConfigs, SxLoading } from '@telco360/components';


//Wrapper incluant les fonctionnalités standards d'une page de formulaire.
const withSxPageForm = (WrappedComponent) => {
    const SxPageForm = (props) => {
        const [isDuplicating, setIsDuplicating] = useState(false);
        const [isInModal, setIsInModal] = useState(false);

        const getAction = useCallback(() =>
            (props.params?.id != null || props.id != null) ?
                (isDuplicating ? props.pageAction?.duplication : props.pageAction?.edition) :
                props.pageAction?.creation, [isDuplicating, props.params?.id, props.id, props.pageAction]);

        const doCancel = () => {
            if (isInModal) {
                props.goBack();
            } else {
                props.reloadPage();
            }
        };

        const handleCancel = async () => {
            if (typeof props.tryToLaunchPcModal === 'function') {
                props.tryToLaunchPcModal(doCancel);
            } else {
                doCancel();
            }
        };

        useEffect(() => setIsInModal(props.match == null), [props.match]);
        const path = props.formUrl ?? props.location.pathname ?? "";
        return typeof props.pageAction === 'undefined' ? <SxLoading /> :
            <RightConsumer>{(rightGetter) => rightGetter.getRead(path, props) ?
                <SxFormContext.Provider value={{ isInModal, formUrl: path }}>
                    <WrappedComponent
                        {...props}
                        getAction={getAction}
                        isDuplicating={isDuplicating}
                        onDuplication={(val) => setIsDuplicating(val)}
                        handleCancel={handleCancel}
                    />
                </SxFormContext.Provider> :
                <SxModal isOpen={true} onClickClose={handleCancel}>
                    {
                        props.page403Panel?.()
                    }
                </SxModal>}
            </RightConsumer>;
    };

    SxPageForm.propTypes = {
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        formUrl: PropTypes.string,
        match: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        tryToLaunchPcModal: PropTypes.func,
        pageAction: PropTypes.shape({
            duplication: PropTypes.string,
            creation: PropTypes.string,
            edition: PropTypes.string,
        }),
        page403Panel: PropTypes.func,
    };

    SxPageForm.displayName = `SxPageForm(${(WrappedComponent?.displayName || WrappedComponent?.name || 'Component')})`;

    return withSxNavigation(withConfigs(SxPageForm));
};

withSxPageForm.displayName = "SxPageForm";

export default withSxPageForm;