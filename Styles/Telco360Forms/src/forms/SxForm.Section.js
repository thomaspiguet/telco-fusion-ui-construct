import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';

import SxFormContent from './SxForm.Content';
import SxFormFieldTab from './SxForm.FieldTab';
import { SxIcon } from '@telco360/components';
import { propTypes } from './SxForm.Section.props';

const _SxFormSection = ({ fieldDef, ...props }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return <Card key={`section-${fieldDef.id}`} className={`col m-0 p-0 ${fieldDef.className} ${fieldDef.isFocusType ? "primary" : ""} ${fieldDef.noBorder ? "border-0" : ""}`}>
        {fieldDef.sectionName !== "" &&
            <CardHeader className="pt-1 pl-1 pb-1">
                <div
                    className="font-weight-bold"
                    onClick={() => { setIsExpanded(!isExpanded) }}
                >
                    {fieldDef.collapsible ? <SxIcon className={isExpanded ? "cis-caret-bottom btn-sm" : "cis-caret-right btn-sm"} /> : ""}
                    {fieldDef.sectionName}
                </div>
            </CardHeader>
        }
        <CardBody className={`${fieldDef.noBorder && fieldDef.sectionName === "" ? "p-0 m-0" : ""} ${isExpanded || !fieldDef.collapsible ? "" : "d-none"}`}>
            {
                Array.isArray(fieldDef.fields) && fieldDef.fields.length > 0 &&
                <SxFormContent {...props} id={fieldDef.id} fieldDef={fieldDef.fields} />
            }
            {
                Array.isArray(fieldDef.tabs) && fieldDef.tabs.length > 0 &&
                <SxFormFieldTab {...props} fieldDef={fieldDef}
                />
            }
        </CardBody>
    </Card>
}

_SxFormSection.propTypes = propTypes;
_SxFormSection.displayName = "SxFormSection";

/**
 * Un component présentant l'entête d'un formulaire.
 * 
 * @type {React.Component<propTypes>}
 */
const SxFormSection = _SxFormSection;
export default SxFormSection;