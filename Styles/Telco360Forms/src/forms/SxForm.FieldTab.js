import React, { useState, useEffect, useCallback } from 'react';

import SxFormContent from './SxForm.Content';
import SxFormHelpers from './SxForm.Helpers';
import { SxTabBar } from '@telco360/components';
import { propTypes, defaultProps } from './SxForm.FieldTab.props';

const _SxFormFieldTab = ({ fieldDef, ...props }) => {
    const [tabsWithErrors, setTabsWithErrors] = useState([]);

    var hasError = useCallback((errorField, currentFieldDef) => {
        if (typeof currentFieldDef.fields.find(field => field.name === errorField || field.name + "-ext" === errorField) !== "undefined") {
            return true;
        }
        //Valider si les sous-tabs / sous-sections sont valides
        for (let i in currentFieldDef.fields){
            if (Array.isArray(currentFieldDef.fields[i].fields)){
                if (hasError(errorField, currentFieldDef.fields[i]) === true){
                    return true;
                }
            }
            if (Array.isArray(currentFieldDef.fields[i].tabs)){
                for (let t in currentFieldDef.fields[i].tabs) {
                    if (hasError(errorField, currentFieldDef.fields[i].tabs[t]) === true ){
                        return true;
                    }
                }
            }
        }
        return false;
    }, [])

    useEffect(() => {
        var tabErrors = [];
        fieldDef.tabs.forEach(tab => {
            for (let errorField in props.errors) {
                if (typeof props.errors[errorField] === 'undefined') continue;
                if (hasError(errorField, tab) === true) tabErrors[tab.id] = true;
            }
            return false;
        })
        setTabsWithErrors(tabErrors);
    }, [fieldDef, props.errors, hasError]);

    return <SxTabBar
        header={props.header}
        key={fieldDef.id}
        tabProps={
            fieldDef.tabs.map((input, position) => {
                return {
                    tabKey: position,
                    styleClass: "",
                    name: input.tabName,
                    alert: tabsWithErrors[input.id] === true,
                    tab: Array.isArray(input) || typeof input.tab === 'undefined' ?
                        (idx) => <SxFormContent {...props} id={idx} fieldDef={SxFormHelpers.getTabContent(input.fields, props.data, props.externalData)} /> : //Tab géré par SxForm
                        input.tab        //Tab géré à l'extérieur de SxForm
                };
            })
        }
    />
}

_SxFormFieldTab.propTypes = propTypes;

_SxFormFieldTab.defaultProps = defaultProps;
_SxFormFieldTab.displayName = "SxFormFieldTab";
/**
 * Un component présentant un tab lorsqu'un des field d'un formulaire est défini ainsi.
 * 
 * @type {React.Component<propTypes>}
 */
const SxFormFieldTab = _SxFormFieldTab;
export default SxFormFieldTab;