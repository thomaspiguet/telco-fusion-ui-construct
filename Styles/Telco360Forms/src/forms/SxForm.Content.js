import React, { useCallback } from 'react';
import { Row } from 'reactstrap';

import SxFormField from './fields/SxFormField';
import SxFormFieldTab from './SxForm.FieldTab';
import SxFormHelpers from './SxForm.Helpers';
import SxFormSection from './SxForm.Section';
import { SxTabBar } from '@telco360/components';
import { propTypes } from './SxForm.Content.props';

const SxFormContentBase = (props) => {
    let {
        data,
        delay,
        onDelayedUpdate,
        dirtyFields,
        errors,
        errorMsgs,
        extendedTypes,
        externalData,
        fieldDef,
        formId,
        header,
        id,
        lblClassName,
        lblNbCols,
        onChange,
        onValErrorEnd,
        onValErrorStart,
        updateData,
        warnings,
        warningMsgs
    } = props;

    const handleValErrorStart = useCallback((msg, ext, fieldDef) => { onValErrorStart(fieldDef.name + (ext ? "-ext" : ""), msg) }, [onValErrorStart]);
    const handleValErrorEnd = useCallback((ext, fieldDef) => { onValErrorEnd(fieldDef.name + (ext ? "-ext" : "")) }, [onValErrorEnd]);

    if (typeof id === 'undefined' && SxFormHelpers.fieldDefHasTabs(fieldDef)) {
        return <SxTabBar
            header={header}
            key={fieldDef.id}
            tabProps={
                fieldDef.map((input, position) => {
                    return {
                        tabKey: position,
                        styleClass: "",
                        name: input.tabName,
                        alert: props.tabsWithIssues.find(t => t === input.id),
                        tab: Array.isArray(input) || typeof input.tab === 'undefined'
                            ? (idx) => {
                                return <SxFormContentBase {...props} id={idx} fieldDef={SxFormHelpers.getTabContent(input.fields, data, externalData)} />
                            }       //Tab géré par SxForm
                            : input.tab        //Tab géré à l'extérieur de SxForm
                    };
                })
            }
        />
    }

    return <React.Fragment key={`SxFormContent-${id}`}>
        {SxFormHelpers.getTabContent(fieldDef, data, externalData).map(oneFieldDef => {
            let aFieldDef = {
                ...oneFieldDef,
                lblClassName: `${lblClassName} ${oneFieldDef.lblClassName ?? ""}`,
                lblNbCols: oneFieldDef.lblNbCols ?? lblNbCols,
            };
            let fieldData = data[aFieldDef.name];
            let warningsToApply = { ...warnings, ...warningMsgs };
            let errorsToApply = { ...errors, ...errorMsgs };

            const handleValErrStart = (msg, ext) => handleValErrorStart(msg, ext, aFieldDef);
            const handleValErrEnd = (ext) => handleValErrorEnd(ext, aFieldDef);

            return <React.Fragment key={`field-${aFieldDef.id}`}>
                {
                    (typeof aFieldDef.sectionName === 'undefined' && typeof aFieldDef.fieldTabName === 'undefined' &&
                        (typeof aFieldDef.type !== 'undefined' || typeof aFieldDef.render !== 'undefined')) &&
                    <SxFormField
                        id={aFieldDef.id}
                        containerId={formId}
                        key={aFieldDef.id}
                        field={aFieldDef}
                        data={fieldData}
                        formData={data}
                        onChange={onChange}
                        onUpdateData={updateData}
                        delay={delay}
                        onDelayedUpdate={onDelayedUpdate}
                        isDirty={dirtyFields.includes(aFieldDef.name)}
                        errorMsg={errorsToApply[aFieldDef.name] || errorsToApply[aFieldDef.name + "-ext"]}
                        warningMsg={warningsToApply[aFieldDef.name]}

                        onValErrorStart={handleValErrStart}
                        onValErrorEnd={handleValErrEnd}

                        externalData={externalData}
                        extendedTypes={extendedTypes}
                    />
                }
                {
                    typeof aFieldDef.sectionName !== 'undefined' &&
                    <SxFormSection {...props} fieldDef={aFieldDef} />
                }
                {
                    typeof aFieldDef.sectionName === 'undefined' &&
                    aFieldDef.fields &&
                    typeof aFieldDef.fieldTabName === 'undefined' &&
                    <Row
                        key={`${aFieldDef.id}-Row`}
                        className={`col m-0 p-0 ${aFieldDef.className}`}
                    >
                        <SxFormContentBase {...props} id={aFieldDef.id} fieldDef={aFieldDef.fields.filter(d => !d.isHidden)} />
                    </Row>
                }
                {
                    typeof aFieldDef.sectionName === 'undefined' &&
                    Array.isArray(aFieldDef.tabs) &&
                    <SxFormFieldTab {...props} fieldDef={aFieldDef} />
                }
            </React.Fragment>
        })}
    </React.Fragment>
};

SxFormContentBase.propTypes = propTypes;
SxFormContentBase.displayName = "SxFormContent";

/**
 * Un component permetant la présentation des éléments central d'un formulaire.
 * 
 * @type {React.Component<propTypes>}
 */
const SxFormContent = SxFormContentBase
export default SxFormContent;