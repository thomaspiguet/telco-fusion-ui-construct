import React from 'react';
import PropTypes from 'prop-types';
import { SxCloseButton } from '@telco360/components';

const iconsClassNames = "btn pt-0 pb-0 pl-1 pr-1";

///Barre d'icone de controles secondaire d'un SxForm.
const SxFormSecondaryControls = ({ className, isInModal, formUrl, controls, doCancel }) => <>
    {
        (isInModal ||
            typeof formUrl !== 'undefined' ||
            typeof controls !== 'undefined') &&
        <span className={className}>
            {typeof controls !== 'undefined' &&
                <>
                    {(controls ?? []).map((hc, idx) =>
                        <span
                            className={`${iconsClassNames} ${hc.icon}`}
                            key={idx}
                            onClick={hc.action}
                            role={hc.role}
                        />
                    )}
                </>
            }
            {isInModal &&
                <>
                    {
                        typeof formUrl !== 'undefined' &&
                        <span role='externalLinkIcon' className={`${iconsClassNames} fa fa-external-link`} onClick={() => window.open(formUrl, '_blank')} />
                    }
                    {/*Lorsque les boutons de headers sont activés, le bouton de cancel sera toujours présent.*/}
                    <SxCloseButton onClick={doCancel}/>
                </>
            }
        </span>
    }
</>;


SxFormSecondaryControls.propTypes = {
    className: PropTypes.string,
    isInModal: PropTypes.bool,
    formUrl: PropTypes.string,
    controls: PropTypes.arrayOf(PropTypes.shape({
        icon: PropTypes.string,
        action: PropTypes.func,
    })),
    doCancel: PropTypes.func,
};

SxFormSecondaryControls.defaultProps = {

};

export default SxFormSecondaryControls;