import React from 'react';
import { CardHeader } from 'reactstrap';

import SxFormSecondaryControls from './SxFormSecondaryControls';
import { propTypes } from './SxForm.Header.props';

const _SxFormHeader = ({
    doCancel,
    formUrl,
    header,
    hideSecondaryControls,
    isInModal,
    secondaryControls,
    title,
}) => {
    return <>
        {!hideSecondaryControls && (title || secondaryControls || isInModal()) &&
            <CardHeader className="sxForm-sticky-header pt-1 pl-1 pb-1">
                {
                    title && <span className="font-weight-bold">{title}</span>
                }
                <SxFormSecondaryControls
                    className="float-right"
                    isInModal={isInModal()}
                    formUrl={formUrl()}
                    controls={secondaryControls}
                    doCancel={doCancel}
                />
            </CardHeader>
        }
        {header && 
            <div className="pt-1 pl-1 pb-1 sxForm-sticky-header">
                {header()}
            </div>
        }
    </>
};

_SxFormHeader.propTypes = propTypes;
/**
 * Un component présentant l'entête d'un formulaire.
 * 
 * @type {React.Component<propTypes>}
 */
const SxFormHeader = _SxFormHeader;
export default SxFormHeader;