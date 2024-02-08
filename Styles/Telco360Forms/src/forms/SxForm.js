import React, { Component } from 'react';

import { 
    helpers,
    withSxEditablePanel,
    withConfigs,
    withSxMetadataInspectorContainer
} from '@telco360/components';

import { SxFieldTypes } from './fields/SxFormField';
import sxFormHelpers from './SxForm.Helpers';
import withSxFieldDefinitions from '../hoc/withSxFieldDefinitions';
import { SxFormDisplayNoFieldsDefinition } from './SxForm.Display';
import { propTypes, defaultProps, msg } from './SxForm.props';


export const SxFormContext = React.createContext({ isInModal: false });

class _SxForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: {},                      //Cet objet est utilisé pour garder dans le state les champs en erreur.
            warnings: {},                    //Cet objet est utilisé pour garder dans le state les warnings champs.
            dirtyFields: [],                 //Cet array est utilisé pour garder dans le state les champs dirty.
            valInProgress: undefined,        //Contient la promise de la validation en cours s'il y en a une.
            actionInProgress: undefined,     //Contient la promise de l'action en cours s'il y en a une.
            delayedFields: [],               //Contient les noms des champs en attente de leur update.
        }
    }

    componentDidMount() {
        this.props.submitDelegator?.(this.onSubmit);
        this.props.duplicateDelegator?.(this.handleDuplicate);
        this.props.cancelDelegator?.(this.doCancel);
        this.props.validateDelegator?.(this.isFormValid);
    }

    componentDidUpdate(prevProps) {
        if (this.props.externalErrors !== prevProps.externalErrors) {
            var extErrs = typeof this.props.externalErrors !== 'undefined' && this.props.externalErrors.length > 0 ?
                this.props.externalErrors.reduce((acc, entry) => ({ ...acc, [entry.fieldName]: { message: entry.msg, tabIds: [entry.tabId] } }), {}) :
                {};
            var pastExtErrs = typeof prevProps.externalErrors !== 'undefined' && prevProps.externalErrors.length > 0 ?
                prevProps.externalErrors
                    .filter(err => typeof extErrs[err.fieldName] === 'undefined')
                    .reduce((acc, entry) => ({ ...acc, [entry.fieldName]: undefined }), {}) :
                {};

            this.setState((state) => ({
                errors: {
                    ...state.errors,
                    ...extErrs,
                    ...pastExtErrs
                }
            }));
        }
    }

    doCancel = () => {
        if (typeof this.props.tryToLaunchPcModal === 'function') {
            this.props.tryToLaunchPcModal(this.props.onCancel);
        } else {
            this.props.onCancel();
        }
    };

    handleDuplicate = () => {
        let { dirtyFields } = this.state;
        this.getFlatFieldDefs()
            .filter(f => !f.isHidden)
            .forEach(x => {
                if (!dirtyFields.includes(x.name)) {
                    dirtyFields.push(x.name);
                }
            });
        if (typeof (this.props.setIsDirtyPanel) === 'function') {
            this.props.setIsDirtyPanel(true);
        }
        this.props.handleDuplicate();
    };

    onValErrorStart = (fieldName, msg = "", isError = true) => {
        var tabId = this.getTabIds(fieldName);
        let newErrors = {};
        let newWarnings = {};

        if (isError) {
            newErrors = { ...this.state.errors, [fieldName]: { message: msg, tabIds: [...(this.state.errors[fieldName]?.tabIds ?? []), ...tabId] } };
            newWarnings = { ...this.state.warnings, [fieldName]: undefined };
        } else {
            newErrors = { ...this.state.errors, [fieldName]: undefined };
            newWarnings = { ...this.state.warnings, [fieldName]: msg }
        }

        this.setState(() => {
            return {
                errors: newErrors,
                warnings: newWarnings
            };
        });

        //Ajuster l'état du SxForm (Erreur ou Warning)
        if (this.getErrorCount(newErrors) > 0) {
            this.props.onValErrorStart?.(this.props.msg.error.invalidField, true);
        } else if (this.getErrorCount(newWarnings) > 0) {
            this.props.onValErrorStart?.(this.props.msg.error.warningField, false);
        }
    };

    onValErrorEnd = (fieldName) => {
        this.setState((state) => {
            let newErrors = { ...state.errors, [fieldName]: undefined };
            let newWarnings = { ...state.warnings, [fieldName]: undefined };
            if (this.getErrorCount(newErrors) === 0 && this.getErrorCount(newWarnings) === 0) {
                this.props.onValErrorEnd?.();
            }
            return {
                errors: newErrors,
                warnings: newWarnings,
            }
        });
    };

    getErrorCount = (errors) => {
        var res = 0;
        Object.keys(errors).forEach(e => {
            if (typeof errors[e] !== "undefined")
                res++;
        })
        return res
    };

    onChange = (e, fieldDef, ignoreDirty = false) => {
        if (!ignoreDirty) {
            let { dirtyFields } = this.state;

            if (!dirtyFields.includes(fieldDef.name)) {
                //Lors du premier champs dirty, il faut informer le pending changes que le form est maintenant dirty.
                if (dirtyFields.length === 0) {
                    if (typeof (this.props.setIsDirtyPanel) === 'function') {
                        this.props.setIsDirtyPanel(true);
                    }
                }
                dirtyFields.push(fieldDef.name);
                this.setState({ dirtyFields });
            }
        }
        fieldDef.onChange?.(e, fieldDef, this.props.data[fieldDef.name], this.props.data, this.props.externalData);
    };

    treatValResult = (fieldDef, newValue, valResult, executedVals = []) => {
        return new Promise(async (resolve, _reject) => {
            //Permet de gérer les validations async
            if (valResult instanceof Promise) {
                valResult = await valResult;
            }

            //Une validation retournant undefined sera considéré comme un succès mais avec un warning dans la console.
            if (typeof valResult === 'undefined') {
                console.warn("Validation for the field " + fieldDef.name + " returned undefined. True return was assumed instead, please verify validation.");
                valResult = true;
            }

            // Nous traitons les erreurs
            if (valResult !== true && !(valResult || {}).valid) {
                //Erreur
                this.onValErrorStart?.(fieldDef.name, valResult.message, true);
            } else if ((valResult === true || (valResult || {}).valid) && typeof valResult.message === "string" && valResult.message !== "") {
                //Warning
                this.onValErrorStart?.(fieldDef.name, valResult.message, false);
            }
            else {
                //Success
                this.onValErrorEnd?.(fieldDef.name);
            }

            executedVals.push(fieldDef.name);

            var toReturn = valResult === true || valResult.valid;

            if (valResult.otherFields) {
                await helpers.Foreach.asyncForEach(
                    valResult.otherFields
                        .filter(ov => !executedVals.includes(ov)),              //Pour éviter un loop infini de validations.
                    async ov => {
                        let tmp = this.getFlatFieldDefs();
                        let targetFieldDef = tmp.filter(fd => fd.name === ov)[0];
                        if (typeof targetFieldDef === 'undefined') {
                            console.error(`SxForm: Cannot run validation on field '${ov}' because the field was not found in the definitions.`);
                            return;
                        }
                        let res = await targetFieldDef.validation(this.props.data[targetFieldDef.name], { ...this.props.data, [fieldDef.name]: newValue }, this.props.externalData, false);
                        toReturn = (await this.treatValResult(targetFieldDef, this.props.data[targetFieldDef.name], res, executedVals)) && toReturn;
                    }
                );
            }
            resolve(toReturn);
        });
    };

    updateData = async (fieldDef, newValue, oldValue, currFormData, clearedFields = [], usedFieldnamesInAction = []) => {
        return new Promise(async (resolve, _reject) => {
            let valResult = { valid: true };

            const startAction = (valSuccess) => {
                return new Promise(async (resolve, _reject) => {
                    //Exécution des actions
                    if (typeof fieldDef.action === 'function') {
                        this.setState({
                            actionInProgress: valSuccess ?
                                fieldDef.action(newValue, this.props.data, this.props.externalData) :
                                fieldDef.actionOnFail(newValue, this.props.data, this.props.externalData)
                        }, async () => {
                            try {
                                const actResult = await this.state.actionInProgress;
                                if (typeof actResult !== 'undefined') {
                                    await helpers.Foreach.asyncForEach(Object.keys(actResult),
                                        async k => {
                                            const def = this.getFlatFieldDefs().find(d => d.name === k);
                                            if (typeof def !== 'undefined') {
                                                // Vérifier si le champ avait déjà fait l'objet d'une action
                                                if (usedFieldnamesInAction.find(x => x === k) !== undefined) {
                                                    console.error(`Action function : Infinite loop attempt on field '${k}'`);
                                                    return;
                                                }
                                                usedFieldnamesInAction.push(fieldDef.name);

                                                this.onChange(actResult[k], def);
                                                await this.updateData(def, actResult[k], this.props.data[k], currFormData, [], usedFieldnamesInAction);
                                            }
                                            else {
                                                console.error(`action for field '${fieldDef.name}' tried to change value of field '${k}' but it doesn't exist.`);
                                            }
                                        });
                                }
                                resolve();
                            }
                            finally {
                                this.setState({ actionInProgress: undefined }, () => { resolve(); }); //S'il y a une erreur on indique à sxFormq ue l'actione st terminé
                            }
                        });
                    }
                    else {
                        resolve();
                    }
                });
            };

            const startVal = () => {
                return new Promise(async (resolve, _reject) => {
                    if (typeof fieldDef.validation === 'function') {
                        this.setState({ valInProgress: fieldDef.validation(newValue, this.props.data, this.props.externalData, false) }, async () => {
                            try {
                                valResult = await this.state.valInProgress;
                            }
                            finally {
                                var valSuccess = await this.treatValResult(fieldDef, newValue, valResult);
                                this.setState({ valInProgress: undefined }, async () => {
                                    await startAction(valSuccess);
                                    resolve();
                                });
                            }
                        });
                    }
                    else {
                        await startAction(true); //S'il n'y a aucune validation sur le champ nous considérons que c'est un succès pour rouler les actions.
                        resolve();
                    }
                });
            };

            if (newValue !== oldValue) {
                //Nous effectuons un clear des valeurs des champs définit comme hidden.
                if (this.props.clearOnHiddenFields) {
                    await helpers.Foreach.asyncForEach(this.getFlatFieldDefs()
                        .filter(f =>
                            typeof currFormData[f.name] !== 'undefined' &&
                            f.name !== fieldDef.name &&
                            !clearedFields.includes(f.name) &&
                            sxFormHelpers.checkIsHidden(f, { ...currFormData, [fieldDef.name]: newValue }, this.props.externalData)), //Vérification des champs qui deviendront hidden une fois l'update effectué pour vider leur valeur.
                        async f => {
                            await this.updateData(f, undefined, currFormData[f.name], currFormData, [...clearedFields, fieldDef.name]);
                        });
                }
                this.props.updateData(fieldDef, newValue, currFormData);

                await startVal();
            }

            if (this.state.delayedFields.includes(fieldDef.name)) {
                this.setState(state => ({ delayedFields: state.delayedFields.filter(df => df !== fieldDef.name) }),
                    () => {
                        resolve();
                    });
            }
            else {
                resolve();
            }
        });
    };

    waitForDelays = async () => {
        var that = this;
        if (that.state.delayedFields.length > 0) {
            await new Promise((resolve => setTimeout(async () => {
                if (that.state.delayedFields.length > 0) {
                    await that.waitForDelays();
                    resolve();
                }
                else {
                    resolve();
                }
            }, 100)));
        }
    };

    onSubmit = async () => {
        var that = this;
        let promise = new Promise(function (resolve, _reject) {
            that.setState(() => {
                return { isSubmitting: true };
            }, async () => {
                await that.waitForDelays();

                //S'il y a déjà une validation en cours d'exécution, nous empêchons la soumission avant qu'elle ne soit terminé.
                if (typeof that.state.valInProgress !== 'undefined') {
                    await that.state.valInProgress;
                }

                if (typeof that.state.actionInProgress !== 'undefined') {
                    await that.state.actionInProgress;
                }

                let hasErrors = await that.validateAll();

                if (!hasErrors) {
                    let saveRes = false;
                    try {
                        saveRes = await that.props.onSubmit();
                    }
                    catch (ex) {
                        that.setState({ isSubmitting: false });
                        throw ex;
                    }

                    if (typeof saveRes === 'undefined') {
                        console.warn("onSubmit passed to SxForm returned undefined. Success was assumed but the onSubmit should be fixed.");
                        saveRes = true;
                    }

                    if (saveRes === true) {
                        let { dirtyFields } = that.state;

                        //S'il y a des dirtyFields, nous vidons la liste après la sauvegarde.
                        if (dirtyFields.length > 0) {
                            if (typeof (that.props.setIsDirtyPanel) === 'function') {
                                that.props.setIsDirtyPanel(false);
                            }

                            dirtyFields = [];
                        }
                        //Nous appelons le onSubmitSuccess peu importe qu'il y ai des dirtyFields ou non pour les cas où il y a eu une modification non géré par SxForm mais géré par le component parent.
                        that.setState({
                            dirtyFields,
                            isSubmitting: false
                        }, () => {
                            if (typeof that.props.onSubmitSuccess === 'function') {
                                that.props.onSubmitSuccess();
                            }
                        });
                        return resolve(true);
                    } else {
                        that.setState({ isSubmitting: false });
                        return resolve(false);
                    }
                } else {
                    that.setState({ isSubmitting: false });
                    return resolve(false);
                }
            });
        });
        return promise;
    };

    isFormValid = async () => {
        var result = await this.validateAll();
        return (typeof result === 'undefined' || result === false);
    };

    validateAll = async () => {
        var hasErrors;
        await helpers.Foreach.asyncForEach(this.getFlatFieldDefs()
            .filter(f => !f.isHidden),                //Si un champs est caché, nous ignorons ses validations
            async (fieldDef) => {
                if (typeof fieldDef.validation === 'function') {
                    let valResult = await fieldDef.validation(this.props.data[fieldDef.name], this.props.data, this.props.externalData, true);
                    var result = await this.treatValResult(fieldDef, this.props.data[fieldDef.name], valResult);
                    hasErrors = !result || hasErrors;
                }
            });
        return hasErrors;
    };

    //Retourne la liste des champs peut importe où ils ce trouvent dans la définition.
    getFlatFieldDefs = (defs) => {
        if (typeof defs === 'undefined') {
            defs = this.props.fieldDefinitions;
        }

        if (!defs.some(d => typeof d.fields !== 'undefined' || typeof d.tabs !== 'undefined')) return defs;

        let toReturn = defs.filter(d => typeof d.fields !== 'undefined').map(d => d.fields)
            .reduce((acc, val) => acc.concat(val), []);

        //Trouver les champs dans les tabs
        let tabsToReturn = [];
        defs.filter(d => typeof d.tabs !== 'undefined').forEach(d => { tabsToReturn = [...tabsToReturn, ...d.tabs.map(t => t.fields).reduce((acc, val) => acc.concat(val), [])] });

        return [...defs.filter(d => typeof d.fields === 'undefined'), //Nous ajoutons les champs définits directement à ce niveau.
        ...toReturn,    //Nous ajoutons les champs définits sous le niveau fields actuel.
        ...this.getFlatFieldDefs(toReturn.filter(d => typeof d.fields !== 'undefined' || typeof d.tabs !== 'undefined')), //Nous vérifions pour d'autres niveaux de fields.
        ...tabsToReturn,
        ...this.getFlatFieldDefs(tabsToReturn.filter(d => typeof d.fields !== 'undefined' || typeof d.tabs !== 'undefined')),
        ];
    };

    ///Retourne la liste des ids des tabs où un un fieldName est présent.
    getTabIds = (fieldName, fieldDefs, tabId) => {
        if (typeof fieldDefs === "undefined") {
            fieldDefs = this.props.fieldDefinitions;
        }
        let result = [];

        var _fieldName = fieldName.replace("-ext", "");  //Nous voulons regrouper les erreurs géré par onValErrorStart ainsi que les erreurs géré par SxForm.

        for (var currFieldDef of fieldDefs) {
            if (typeof currFieldDef.tabName !== 'undefined' && typeof currFieldDef.fields !== "undefined") {
                result = [...result, ...this.getTabIds(_fieldName, currFieldDef.fields, tabId ?? currFieldDef.id)];
            } else if (currFieldDef.name === _fieldName) {
                result = [...result, tabId];
            }
        };
        return result;
    };

    hasErrors = () =>
        Object.keys(this.state.errors).some(k => typeof this.state.errors[k] !== 'undefined') ||
        this.props.hasExternalErrors ||
        (typeof this.props.externalErrors !== 'undefined' && this.props.externalErrors.length > 0);

    isInModal = () =>
        this.props.isInModal ?? this.context.isInModal ?? false;

    formUrl = () =>
        this.props.formUrl ?? this.context.formUrl ?? undefined;

        handleDelayedUpdate = (fieldName) => { this.setState(state => ({ delayedFields: [...state.delayedFields, fieldName] })) };


    render() {
        return <SxFormDisplayNoFieldsDefinition
            doCancel={this.doCancel}
            formUrl={this.formUrl}
            header={this.props.header}
            hideSecondaryControls={this.props.hideSecondaryControls}
            isInModal={this.isInModal}
            isScrollable={this.props.isScrollable}
            secondaryControls={this.props.secondaryControls}
            title={this.props.title}
            data={this.props.data}
            updateDelay={this.props.updateDelay}
            onDelayedUpdate={this.handleDelayedUpdate}
            dirtyFields={this.state.dirtyFields}
            errors={Object.keys(this.state.errors).reduce((acc, key) => ({ ...acc, [key]: this.state.errors[key]?.message }), {})}
            errorMsgs={this.props.errorMsgs}
            extendedTypes={this.props.extendedTypes}
            externalData={this.props.externalData}
            fieldDefinitions={this.props.fieldDefinitions}
            id={this.props.id}
            lblClassName={this.props.lblClassName}
            lblNbCols={this.props.lblNbCols}
            onChange={this.onChange}
            onValErrorEnd={this.onValErrorEnd}
            onValErrorStart={this.onValErrorStart}
            tabsWithIssues={Object.keys(this.state.errors).map(err => this.state.errors[err]?.tabIds).flat(1)}
            updateData={this.updateData}
            warnings={this.state.warnings}
            warningMsgs={this.props.warningMsgs}
            inspection={this.props.inspection}
            allowDuplicate={this.props.allowDuplicate}
            cancelLabel={this.props.msg.button.cancel}
            customButtons={this.props.customButtons}
            forceEnable={true}
            formIsDirty={(this.state.dirtyFields.length > 0 || this.props.formIsDirty) &&   //Nous bloquons la sauvegarde si aucun champ n'est dirty
                !this.hasErrors()}                                                          //Nous bloquons la sauvegarde si un champ est en erreur
            handleCancel={this.doCancel}
            handleDuplicate={this.handleDuplicate}
            onSubmit={this.onSubmit}
            hasErrors={this.hasErrors}
            hideMainControls={this.props.hideMainControls}
            isSubmitting={this.state.isSubmitting ||
                typeof this.state.valInProgress !== 'undefined' ||
                typeof this.state.actionInProgress !== 'undefined'}
            overrideCardFooterProps={this.props.overrideCardFooterProps}
            submitLabel={this.props.msg.button.submit}
        />
    }
};

_SxForm.contextType = SxFormContext;


_SxForm.propTypes = propTypes;

_SxForm.defaultProps = defaultProps;

_SxForm.displayName = "SxForm";

export { msg };
/**
 * Un component permetant la gestion des éléments d'un formulaire sans le pending change.
 * 
 * @type {React.Component<propTypes>}
 */
export const SxFormNoPending = withConfigs(withSxMetadataInspectorContainer(withSxFieldDefinitions(_SxForm)));
/**
 * Un component permetant la gestion des éléments d'un formulaire sans l'inspection du métadata et sans pending change.
 * 
 * @type {React.Component<propTypes>}
 */
export const SxFormBase = withConfigs(withSxFieldDefinitions(_SxForm));
export { SxFieldTypes };
/**
 * Un component permetant la gestion des éléments d'un formulaire.
 * 
 * @type {React.Component<propTypes>}
 */
const SxForm = withSxEditablePanel(withConfigs(withSxMetadataInspectorContainer(withSxFieldDefinitions(_SxForm))));
export default SxForm;