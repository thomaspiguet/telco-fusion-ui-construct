import { Helpers as commonHelpers } from '@telco360/commonjs';

const excludedPropFromTransform = [
    "id",
    "name",
    "action",
    "actionOnFail",
    "validation",
    "render",
    "fetchValue",
    "onChange",
    "onUpdate",
    "onBlur",
    "tab",
    "header",
    "onMapNotFound",
    "openMaps",
    "overrideFieldProps",    //Inclure les overrideFieldProps dans ces transformations serait ingérable.
    "overrideSelectFieldProps",
];


const SxFormHelpers = {
    //Permet de vérifier si un champ deviendra hidden avec des valeurs n'étant pas encore appliqué sur le data.
    checkIsHidden: (fieldDef, data, externalData) =>
        typeof fieldDef.isHidden === 'function' ?
            fieldDef.isHidden(fieldDef, data[fieldDef.name], data, externalData) :
            fieldDef.isHidden,

    //Calcule la valeur d'une propriété d'une définition de champ.
    getFdProp: (fieldDef, data, externalData, prop) =>
        typeof fieldDef[prop] === 'function' ?
            fieldDef[prop](fieldDef, data[fieldDef.name], data, externalData) :
            fieldDef[prop],

    //Effectu les transformations sur toutes les définition de champs passé.
    transformFieldDefs: (fieldDefs, data, externalData, msg = { error: { notNull: "La valeur ne peut pas être nulle." } }) =>
        fieldDefs.map(fd => SxFormHelpers.transformFieldDef(fd, data, externalData, msg)),

    //Effectu les transformations nécesaire à un fieldDef avant son utilisation.
    transformFieldDef: (fieldDef, data, externalData, msg = { error: { notNull: "La valeur ne peut pas être nulle." } }) => {
        if (fieldDef.__transformed) {
            console.warn(`fieldDef id:'${fieldDef.id}' name:'${fieldDef.name}' was already transformed. Second time will be ignored`);
            return fieldDef; //Nous voulons éviter de transformer 2 fois la même propriété.
        }

        var tmp = Object.keys(fieldDef)
            .filter(pName => !excludedPropFromTransform.includes(pName) &&     //Certains champs doivent toujours être ignorés.
                (typeof fieldDef.excludeFromTransform === 'undefined' || !fieldDef.excludeFromTransform.includes(pName)))   //Il est possible de définir certaines propriétés à ne pas transformer pour un champ spécifique.
            .map(pName => {
                if ((pName === "fields" || pName === "tabs") && Array.isArray(fieldDef[pName])) {
                    return { name: pName, value: fieldDef[pName].map(fd => SxFormHelpers.transformFieldDef(fd, data, externalData)) };
                }
                else {
                    return { name: pName, value: SxFormHelpers.getFdProp(fieldDef, data, externalData, pName) };
                }
            })
            .reduce((acc, entry) => ({
                ...acc,
                [entry.name]: entry.value
            }), {});

        const calcResult = {
            ...fieldDef,
            ...tmp,
        };

        return {
            ...calcResult,
            //Inject la validation de "mandatory" sur les champs requis.
            validation: async (newValue, formValues, externalData, isSaving) => {
                if (calcResult.isMandatory) {
                    if (newValue === null || newValue === '' || typeof newValue === 'undefined' || (typeof newValue === 'number' && isNaN(newValue))) {
                        return { valid: false, message: msg.error.notNull };
                    }
                }
                if (typeof fieldDef.validation === 'function') {
                    return await fieldDef.validation(newValue, formValues, externalData, isSaving);
                }
                else {
                    return true;
                }
            },
            __transformed: true, //Utiliser à l'interne pour éviter de traiter 2 fois la même propriété
        };
    },


    fieldDefHasTabs: (fieldDefinitions) =>
        fieldDefinitions.some(x => typeof (x.tabName) !== 'undefined'),

    getTabContent: (fields, data, externalData) => {
        let fieldsClone = commonHelpers.deepClone([fields])[0];
        return fieldsClone
            .filter(d => !SxFormHelpers.checkIsHidden(d, data, externalData))               //Nous retirons les champs flaggé comme ne devant pas être affiché en édition.
            .sort((a, b) => { return a.ordering - b.ordering });
    }
};

export default SxFormHelpers;