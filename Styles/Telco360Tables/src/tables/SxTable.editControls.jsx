import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { SxTooltip, SxAddButton, SxButtonLadda } from '@telco360/components';

const msg = {
    button: {
        cancel: "Annuler",
        save: "Sauvegarder"
    }
};

const SxTableEditControls = ({ canAddLine,
    handleAddRow,
    canSave,
    onSave,
    onSaveSuccess,
    isDirty,
    tryToLaunchPcModal,
    setIsDirtyPanel,
    onCancel,
    msg, 
    saveEnabled,
    addLineEnabled }) => {
    const [saving, setSaving] = useState(false);

    return <>
        {canAddLine &&
            <SxAddButton
                disabled={!addLineEnabled || saving}
                handleClick={handleAddRow}
            />
        }
        {canSave &&
            <>
                <SxTooltip title={msg.button.cancel}>
                    <SxButtonLadda
                        aria-label={msg.button.cancel}
                    className={"btn outline text-dark bg-transparent border-0 cis-action-undo"}
                        disabled={!isDirty || saving}
                        onClick={
                            () => {
                                if (typeof tryToLaunchPcModal === 'function') {
                                    tryToLaunchPcModal(onCancel);
                                } else {
                                    onCancel();
                                }
                            }
                        }
                    />
                </SxTooltip>
                <SxTooltip title={msg.button.save}>
                <SxButtonLadda
                    aria-label={msg.button.save}
                    className={"btn outline text-dark bg-transparent border-0 cil-save"}
                    disabled={!saveEnabled}
                    loading={saving}
                    onClick={
                        async () => {
                            setSaving(true);
                            // Procéder à la sauvegarde
                            var result = await onSave();
                            if (typeof result === 'undefined') {
                                console.warn("SxTableEditable props.onSave() returned undefined, a return of true was assumed.");
                                result = true;
                            }
                            setSaving(false);
                            if (result) {
                                setIsDirtyPanel?.(false);
                                onSaveSuccess?.();
                            }
                        }
                    }
                />
                </SxTooltip>
            </>
        }
    </>;
};

SxTableEditControls.propTypes = {
    canAddLine: PropTypes.bool,
    canSave: PropTypes.bool,
    handleAddRow: (props, _propName, _component, _location) => {
        if (props.canAddLine && typeof props.handleAddRow !== 'function') {
            return new Error("Error validating props for SxTableEditControls.  When property canAddLine is true, handleAddRow must be a function.");
        }
    },
    hasErrors: PropTypes.bool,
    isDirty: PropTypes.bool,
    msg: PropTypes.shape({
        button: PropTypes.shape({
            cancel: PropTypes.string,
            save: PropTypes.string,
        }),
    }),
    onCancel: (props, _propName, _component, _location) => {
        if (props.canSave && typeof props.onCancel !== 'function') {
            return new Error("Error validating props for SxTableEditControls.  When property canSave is true, onCancel must be a function.");
        }
    },
    onSave: (props, _propName, _component, _location) => {
        if (props.canSave && typeof props.onSave !== 'function') {
            return new Error("Error validating props for SxTableEditControls.  When property canSave is true, onSave must be a function.");
        }
    },
    onSaveSuccess: (props, _propName, _component, _location) => {
        if (props.canSave && props.onSave && typeof props.onSave !== 'function') {
            return new Error("Error validating props for SxTableEditControls.  When property canSave is true, onSave must be a function if defined.");
        }
    },
    setIsDirtyPanel: PropTypes.func,
    tryToLaunchPcModal: PropTypes.func,
};

SxTableEditControls.defaultProps = {
    msg: msg,
};

SxTableEditControls.displayName = "SxTableEditControls";

export default SxTableEditControls;