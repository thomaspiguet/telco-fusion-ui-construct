import React from 'react';
import { CardFooter } from 'reactstrap';

import SxFormMainControls from './SxFormMainControls';
import { propTypes } from './SxForm.Footer.props';

const _SxFormFooter = ({
    allowDuplicate,
    cancelLabel,
    customButtons = [],
    forceEnable,
    formIsDirty,
    handleCancel,
    handleDuplicate,
    handleSubmit,
    hideMainControls,
    isSubmitting,
    submitLabel,
}) => {
    return hideMainControls ? <></> :
        <CardFooter className="sxForm-sticky-footer">
            <SxFormMainControls
                cancelLabel={cancelLabel}
                allowDuplicate={allowDuplicate}
                handleDuplicate={handleDuplicate}
                formIsDirty={formIsDirty}
                handleCancel={handleCancel}
                handleSubmit={handleSubmit}
                submitLabel={submitLabel}
                forceEnable={forceEnable}
                customButtons={customButtons.length > 0 ? customButtons : undefined}
                isSubmitting={isSubmitting}
            />
        </CardFooter>
}

_SxFormFooter.propTypes = propTypes;
_SxFormFooter.displayName = "SxFormFooter";
/**
 * Un component présentant le bas d'un formulaire.
 * 
 * @type {React.Component<propTypes>}
 */
const SxFormFooter = _SxFormFooter;
export default SxFormFooter;