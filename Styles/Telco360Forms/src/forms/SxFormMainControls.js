import React from 'react';
import { propTypes, defaultProps } from './SxFormMainControls.props';

import { withConfigs, SxButtonLadda } from '@telco360/components';

let defaultButtons = (props) => [
    {
        buttonClassName: props.classNames.button.duplicate,
        onClick: props.handleDuplicate,
        isDisabled: () => { return props.formIsDirty || !props.allowDuplicate; },
        label: props.msg.button.duplicate,
        isDuplicateBtn: true,
        "aria-label": "duplicate",
    },
    {
        buttonClassName: props.classNames.button.cancel,
        onClick: props.handleCancel,
        isDisabled: () => { return !props.formIsDirty && !props.forceEnable; },
        label: props.cancelLabel ?? props.msg.button.cancel,
        isCancelBtn: true,
        "aria-label": "cancel",
    },
    {
        buttonClassName: props.classNames.button.submit,
        onClick: props.handleSubmit,
        loading: props.isSubmitting,
        isDisabled: () => { return !props.formIsDirty || props.formIsValidating === true; },
        label: props.submitLabel ?? props.msg.button.submit,
        isSubmitBtn: true,
        "aria-label": "submit",
    }
];

const defaultButtonComponent = (btn) =>
    <SxButtonLadda
        aria-label={btn["aria-label"]}
        key={"btn-" + btn.label}
        className={btn.buttonClassName}
        loading={typeof btn.loading === 'undefined' ? false : btn.loading}
        disabled={btn.isDisabled()}
        onClick={btn.onClick}
    >
        {btn.label}
    </SxButtonLadda>;

const _SxFormMainControls = (props) =>
    <div className={"d-flex justify-content-end"/*"formHeaderBar"styles.formHeaderBar*/}>
        <div>
            {
                (props.customButtons || defaultButtons(props))
                    .filter(x => (!x.isDuplicateBtn || x.isDuplicateBtn === props.allowDuplicate))
                    .map((aButton) => {
                        return aButton.isSubmitBtn ?
                            defaultButtonComponent({ ...defaultButtons(props).find(b => b["aria-label"] === "submit"), ...aButton })
                            :
                            aButton.isCancelBtn ?
                                defaultButtonComponent({ ...defaultButtons(props).find(b => b["aria-label"] === "cancel"), ...aButton })
                                :
                                aButton.isDuplicateBtn ?
                                    defaultButtonComponent({ ...defaultButtons(props).find(b => b["aria-label"] === "duplicate"), ...aButton })
                                    :
                                    <SxButtonLadda
                                        aria-label={aButton["aria-label"] || aButton.label}
                                        key={"btn-" + aButton.label}
                                        className={aButton.buttonClassName + " ml-1"}
                                        loading={typeof aButton.loading === 'undefined' ? false : aButton.loading}
                                        disabled={typeof aButton.isDisabled !== 'undefined' ? aButton.isDisabled() : !props.formIsDirty}
                                        onClick={aButton.onClick}
                                    >
                                        {aButton.label}
                                    </SxButtonLadda>;
                    })
            }
        </div>
    </div>;

_SxFormMainControls.propTypes = propTypes;

_SxFormMainControls.defaultProps = defaultProps;
_SxFormMainControls.displayName = "SxFormMainControls";

/** 
 * Présentation des boutons de contrôles d'un composant 
 * 
 * @type {React.Component<propTypes>} 
 */
const SxFormMainControls = withConfigs(_SxFormMainControls)
export default SxFormMainControls;