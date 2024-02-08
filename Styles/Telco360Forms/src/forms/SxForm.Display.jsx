import React from "react";
import { Card, CardBody } from 'reactstrap';
import SxFormContent from "./SxForm.Content";
import { withConfigs, withSxMetadataInspectorContainer } from "@telco360/components";
import SxFormFooter from "./SxForm.Footer";
import SxFormHeader from "./SxForm.Header";
import { propTypes, defaultProps } from "./SxForm.Display.props";
import withSxFieldDefinitions from "../hoc/withSxFieldDefinitions";

const _SxFormDisplay = ({ 
    allowDuplicate,
    customButtons,
    data,
    dirtyFields,
    doCancel,
    errors,
    errorMsgs,
    extendedTypes,
    externalData,
    fieldDefinitions,
    formIsDirty,
    formUrl,
    handleCancel,
    handleDuplicate,
    hasErrors,
    header,
    hideMainControls,
    hideSecondaryControls,
    id,
    inspection,
    isInModal,
    isScrollable,
    isSubmitting,
    lblClassName,
    lblNbCols,
    msg,
    name,
    onChange,
    onDelayedUpdate,
    onSubmit,
    onValErrorEnd,
    onValErrorStart,
    overrideCardFooterProps,
    secondaryControls,
    tabsWithIssues,
    title,
    updateData,
    updateDelay,
    warnings,
    warningMsgs 
    }) => {

    return <Card className="sxForm border-0" aria-label={title !== undefined ? title : (name !== undefined ? name : "")}>
        <SxFormHeader
            doCancel={doCancel}
            formUrl={formUrl}
            header={header}
            hideSecondaryControls={hideSecondaryControls}
            isInModal={isInModal}
            secondaryControls={secondaryControls}
            title={title}
        />
        <CardBody className={(isScrollable ? "scroll" : "") + " pt-1"}>
            <SxFormContent 
                    data={data}
                    delay={updateDelay}
                    onDelayedUpdate={onDelayedUpdate}
                    dirtyFields={dirtyFields}
                    errors={errors}
                    errorMsgs={errorMsgs}
                    extendedTypes={extendedTypes}
                    externalData={externalData}
                    fieldDef={fieldDefinitions}
                    formId={id}
                    header={header}
                    lblClassName={lblClassName}
                    lblNbCols={lblNbCols}
                    onChange={onChange}
                    onValErrorEnd={onValErrorEnd}
                    onValErrorStart={onValErrorStart}
                    tabsWithIssues={tabsWithIssues}
                    updateData={updateData}
                    warnings={warnings}
                    warningMsgs={warningMsgs}
                    inspection={inspection}
            />
        </CardBody>
        <SxFormFooter
            allowDuplicate={allowDuplicate}
            cancelLabel={msg.button.cancel}
            customButtons={customButtons}
            forceEnable={true}
            formIsDirty={formIsDirty}
            handleCancel={handleCancel}
            handleDuplicate={handleDuplicate}
            handleSubmit={onSubmit}
            hasErrors={hasErrors}
            hideMainControls={hideMainControls}
            isSubmitting={isSubmitting}
            overrideCardFooterProps={overrideCardFooterProps}
            submitLabel={msg.button.submit}
        />

    </Card>
}


_SxFormDisplay.propTypes = propTypes;

_SxFormDisplay.defaultProps = defaultProps;

_SxFormDisplay.displayName = 'SxFormDisplay';

/**
 * Un component permetant la présentation des éléments formulaire.
 * 
 * @type {React.Component<propTypes>}
 */
const SxFormDisplay = withConfigs(withSxMetadataInspectorContainer(withSxFieldDefinitions(_SxFormDisplay)));    // Valeur par défaut de SxFormDisplay
/**
 * Un component permetant la présentation des éléments formulaire.
 * Aucune gestion n'est faites dans ce formulaire et donc, au besoin, il est de la responsabilité du parent à gérer les fonctions  
 * 
 * @type {React.Component<propTypes>}
 */
export const SxFormDisplayNoFieldsDefinition = withConfigs(withSxMetadataInspectorContainer(_SxFormDisplay));    // Utilisé uniquement par SxForm qui utilise déjà withSxFieldDefinitions
/**
 * Un component permetant la présentation des éléments formulaire.
 * Aucune gestion n'est faites dans ce formulaire et donc, au besoin, il est de la responsabilité du parent à gérer les fonctions  
 * 
 * @type {React.Component<propTypes>}
 */
export const SxFormDisplayNoFielsBase = withConfigs(_SxFormDisplay);                                            // Pourrait être utilisé par SxForm dans certaine circonstance
/**
 * Un component permetant uniquement la présentation des éléments formulaire.
 * Aucune gestion n'est faites dans ce formulaire et donc, au besoin, il est de la responsabilité du parent à gérer les fonctions  
 *  
 * @type {React.Component<propTypes>}
 */
export const SxFormDisplayBase = withConfigs(withSxFieldDefinitions(_SxFormDisplay));                           // Utilisé lorsque nous ne voulons pas d'inspecteur
export default SxFormDisplay;