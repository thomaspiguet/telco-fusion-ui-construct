import React, { useMemo } from 'react';
import sxFormHelpers from '../forms/SxForm.Helpers';
import { SxLoading } from '@telco360/components';
import { propTypes } from './withSxFieldDefinitions.props';

const withSxFieldDefinitions = (WrappedComponent) => {
    const SxFieldDefinitions = ({ fieldDefinitions, data, externalData, msg, id, ...props}) => {
        const _externalData = useMemo(() =>
            ({ ...externalData, formId: id }), [externalData, id]);
        
        const fieldsDef = useMemo(() =>
            // Important : nopus voulons recalculer uniquement lorsque data ou _externalData change. Puisque FieldDefinitions sera changé par l'exécution de la fonction cela créerait une boucle infini 
            // eslint-disable-next-line react-hooks/exhaustive-deps
            sxFormHelpers.transformFieldDefs(fieldDefinitions, data, _externalData, msg), [data, _externalData]);
        return !fieldsDef ? 
            <SxLoading /> : 
            <WrappedComponent
                {...props}
                fieldDefinitions={fieldsDef}
                data={data}
                externalData={_externalData}
                msg={msg}
                id={id}
            />
    };

    SxFieldDefinitions.propTypes = propTypes;

    SxFieldDefinitions.displayName = `SxFieldDefinitions(${(WrappedComponent?.displayName || WrappedComponent?.name || 'Component')})`;
    return SxFieldDefinitions;
};

export default withSxFieldDefinitions;