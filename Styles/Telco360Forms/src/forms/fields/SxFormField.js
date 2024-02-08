import React, { useState, useEffect, useCallback } from 'react';
import { propTypes, defaultProps, msg } from './SxFormField.props';
import { FormGroup, Label, Alert, Input } from 'reactstrap';
import SxFieldTypes from './SxFormField.types';
import { 
    SxAddressWithMap,
    SxAmountInput,
    SxBooleanLabel,
    SxCheckbox,
    SxDatePicker,
    SxDateTimePicker,
    SxExtendedSelect,
    SxFormattedInput,
    SxImage,
    SxIntegerInput,
    SxLabeledSelect,
    SxNumInput,
    SxNumInputRange,
    SxPhoneNumberCallable,
    SxPostalCode,
    SxSecretField,
    SxSelect,
    SxTextareaAutoHeight,
    SxTextList,
    SxTriStateCheckBox,
    withSxMetadataInspector
 } from '@telco360/components';
import { useUpdate } from '@telco360/commonjs';


const _SxFormField = ({ field,
    data,
    formData,
    externalData,
    onUpdateData,
    onChange,
    delay,
    onDelayedUpdate,
    extendedTypes,
    metadata,
    msg,
    onValErrorEnd,
    onValErrorStart,
    isDirty,
    dirtyClassName,
    errorMsg,
    warningMsg }) => {

    const fieldId = `${field.id}-field`;
    const labelId = `${field.id}-Lbl`;

    const disabled = field.enabled === false || metadata?.canWrite === false;

    const [_data, setData] = useState(data); //Utilisé pour les champs Input de reactstrap
    const [forceNoDelay, setForceNoDelay] = useState(false);

    const hasDelay = (forceNoDelay, field, delay) =>
        !forceNoDelay && (field.delay > 0 || delay > 0) && !field.noDelay;

    const delayedActions = useCallback((value) => {
        onUpdateData(field, value, data, formData);
    }, [field, data, formData, onUpdateData]);

    const _onChange = (value, fieldDef, forceNoDelay = false, ignoreDirty = false) => {
        setData(value);
        setForceNoDelay(forceNoDelay);
        onChange(value, fieldDef ?? field, ignoreDirty);
    };

    const _onUpdateData = (field, value, data, formData, forceNoDelay = false) => {
        if (!hasDelay(forceNoDelay, field, delay)) {
            onUpdateData(field, value, data, formData);
        }
    };

    useEffect(() => {
        setData(data);
    }, [data]);

    useUpdate(() => {
        if (hasDelay(forceNoDelay, field, delay)) {
            onDelayedUpdate(field.name);
            const timeOutId = setTimeout(() => delayedActions(_data), field.delay ?? delay);
            return () => clearTimeout(timeOutId);
        }
    }, [_data, field.delay, delay, field.noDelay, forceNoDelay]);


    let renderField = () => {
        if (typeof field.render === 'undefined') {
            //Définition des props devant être présent sous la même forme sur tout les types de champs sans exceptions.
            const commonFieldProps = {
                id: fieldId,
                name: field.name,
                /* eslint-disable no-useless-computed-key -- Ici nous devons utiliser des computed keys puisque nous les sotckons dans un objet et que leurs noms contiennent un trait d'union. */
                ["aria-label"]: typeof field.label === 'undefined' ? field.name : undefined, //Nous utilisons aria-label lorsque aucun label n'est définit pour un champ. Dans le cas contraire le for du label ou le aria-labelledBy sera utilisé automatiquement.
                ["aria-labelledby"]: typeof field.label !== 'undefined' ? labelId : undefined,
                ["aria-required"]: field.isMandatory === true,
                /* eslint-enable no-useless-computed-key */
            };

            //Traitement des types étendues.
            const tmp = extendedTypes[field.type];
            if (typeof tmp !== 'undefined') return tmp.render(commonFieldProps, field, data, formData, _onChange, _onUpdateData);

            if (metadata?.canRead === false){ //Si le metadata indique que le champ ne peut être lu, il doit être retirer au complet du render.
                return <></>
            };

            switch (field.type) {
                case SxFieldTypes.HiddenText:
                    return <></>;
                case SxFieldTypes.Text:
                    return <Input
                        {...commonFieldProps}
                        type="text"
                        disabled={disabled}
                        value={_data ?? ''}
                        onChange={(e) => { _onChange(e.target.value, field); }}
                        onBlur={(e) => { _onUpdateData(field, e.target.value, data, formData) }}
                        {...field.overrideFieldProps}
                    />;
                case SxFieldTypes.TextList:
                    return <SxTextList
                        {...commonFieldProps}
                        values={data}
                        disabled={disabled}
                        onChange={e => _onChange(e.target.value, field, true)}
                        onUpdate={values => _onUpdateData(field, values, data, formData, true)}
                        onValErrorStart={onValErrorStart}
                        onValErrorEnd={onValErrorEnd}
                        {...field.overrideFieldProps}
                    />;
                case SxFieldTypes.Number:
                    return <SxNumInput
                        {...commonFieldProps}
                        value={_data ?? null}
                        min={field.minValue}
                        max={field.maxValue}
                        disabled={disabled}
                        onChange={(e) => { _onChange(e.target.valueAsNumber, field); }}
                        onBlur={(e) => {
                            _onUpdateData(field, e.target.valueAsNumber, data, formData);
                        }}
                        {...field.overrideFieldProps}
                        ignoreGroup={true}
                    />
                case SxFieldTypes.Checkbox:
                    return <div role="form-checkbox" className="fieldCheckbox d-flex align-items-center">
                        <SxCheckbox
                            {...commonFieldProps}
                            dataFieldName={field.name}
                            value={_data}
                            onChange={(e) => { _onChange(e.target.checked, field, true); _onUpdateData(field, e.target.checked, data, formData, true); }}
                            readonly={disabled}
                            {...field.overrideFieldProps}
                        />
                    </div>;
                case SxFieldTypes.List:
                case SxFieldTypes.Select:
                    return <SxSelect
                        {...commonFieldProps}
                        value={_data}
                        options={field.options}
                        onChange={(val, _label) => { _onChange(val, field, true); onUpdateData(field, val, _data, formData); }}
                        disabled={disabled}
                        clearable={field.isMandatory !== true}
                        {...field.overrideFieldProps}
                    />;
                case SxFieldTypes.ExtendedSelect:
                    return <SxExtendedSelect
                        {...commonFieldProps}
                        data={_data}
                        options={field.options}
                        onChangeText={(val) => { _onChange(val, field, true); _onUpdateData(field, val, data, formData); }}
                        disabled={disabled}
                        overrideSelectFieldProps={{ ...field.overrideSelectFieldProps }} // On désactive ici pour éviter que le champ tombe dirty à l'ouverture
                        {...field.overrideFieldProps}
                    />;
                case SxFieldTypes.Date:
                    return <div role="form-date">
                        <SxDatePicker
                            {...commonFieldProps}
                            disabled={disabled}
                            onChange={(newDay) => {
                                const newDayString = newDay?.toISOString();
                                _onChange(newDayString, field, true);
                                _onUpdateData(field, newDayString, data, formData, true);
                            }}
                            value={(data && data !== '') ? data : undefined}
                            {...field.overrideFieldProps}
                        />
                    </div>;
                case SxFieldTypes.DateTime:
                    return <SxDateTimePicker
                            {...commonFieldProps}
                            disabled={disabled}
                            onUpdate={(newDate) => _onUpdateData(field, newDate?.toISOString(),  data, formData, true)}
                            validation={(newDate) => field.validation(newDate, formData, externalData)}
                            value={data}
                    />
                case SxFieldTypes.Label:
                    return <>
                        {field.isMandatory && msg.indicators.characterMandatory}
                        <Label
                            id={field.name + "Lbl"}
                            {...field.overrideLabelProps}>
                            {_data || field.label}
                        </Label>
                    </>;
                case SxFieldTypes.Image:
                    return (
                        <SxImage
                            {...commonFieldProps}
                            field={field}
                            disabled={disabled}
                            src={_data}
                            onSave={(e, imgData) => { _onChange(imgData, field, true); _onUpdateData(field, imgData, data, formData, true); }}
                            maximumSizeBytes={field.imageMaximumSize}
                            {...field.overrideFieldProps}
                        />
                    );
                case SxFieldTypes.Integer:
                    return <SxIntegerInput
                            {...commonFieldProps}
                            enabled={!disabled}
                            clearable={!field.isMandatory}
                            max={field.max}
                            min={field.min}
                            value={_data}
                            onChange={(val) => { _onChange(val, field); }}
                            onUpdate={(val) => { _onUpdateData(field, val, data, formData); }}
                        />;
                case SxFieldTypes.LabeledSelect:
                    return (
                        <SxLabeledSelect
                            {...commonFieldProps}
                            data={_data}
                            options={field.options}
                            onChange={(e) => {
                                _onChange(e, field, true);
                                _onUpdateData(field, e, data, formData, true);
                            }}
                            disabled={disabled}
                            labelPropertyName={field.labelPropertyName}
                            overrideLabelFieldProps={field.overrideLabelFieldProps}
                            overrideSelectFieldProps={{ ...field.overrideSelectFieldProps }} 
                        />
                    );
                case SxFieldTypes.NumInputUnder:
                    return <SxNumInput
                        {...commonFieldProps}
                        theKey={`over-${field.id}`}
                        name={field.name}
                        label={msg.button.under}
                        disabled={disabled}
                        value={_data ?? null}
                        min={field.minValue}
                        max={field.maxValue}
                        onChange={(e) => {
                            _onChange(e?.target?.valueAsNumber, field);
                        }}
                        onBlur={(e) => {
                            _onUpdateData(field, e.target.valueAsNumber, data, formData);
                        }}
                        {...field.overrideFieldProps}
                    />;
                case SxFieldTypes.NumInputOver:
                    return (
                        <SxNumInput
                            {...commonFieldProps}
                            theKey={`under-${field.id}`}
                            name={field.name}
                            label={msg.button.over}
                            disabled={disabled}
                            value={_data ?? null}
                            min={field.minValue}
                            max={field.maxValue}
                            onChange={(e) => {
                                _onChange(e?.target?.valueAsNumber, field);
                            }}
                            onBlur={(e) => {
                                _onUpdateData(field, e.target.valueAsNumber, data, formData);
                            }}
                            {...field.overrideFieldProps}
                        />
                    );
                case SxFieldTypes.NumInputRange:
                    return <SxNumInputRange
                        {...commonFieldProps}
                        minKey={`min-${field.id}`}
                        maxKey={`max-${field.id}`}
                        name={field.name}
                        disabled={disabled}
                        minValue={_data.minValue}
                        maxValue={_data.maxValue}
                        onChange={(_e, newValue) => _onChange(newValue, field)}
                        onBlur={(_e, newValue) => _onUpdateData(field, newValue, data, formData)}
                        minAllowed={field.minAllowed}
                        maxAllowed={field.maxAllowed}

                        {...field.overrideFieldProps}
                    />;
                case SxFieldTypes.BooleanLabel:
                    return <div className="fieldCheckbox d-flex align-items-center">
                        <SxBooleanLabel
                            {...commonFieldProps}
                            value={_data}
                            {...field.overrideFieldProps}
                        />
                    </div>;
                case SxFieldTypes.SecretText:
                    return (
                        <SxSecretField
                            {...commonFieldProps}
                            disabled={disabled}
                            onClickIcon={field.fetchValue}
                            className="p-0"
                            onChange={(e) => {
                                _onChange(e.target.value, field, true);
                                _onUpdateData(field, e.target.value, data, formData, true);
                            }}
                            {...field.overrideFieldProps}
                        />
                    );
                case SxFieldTypes.TriStateCheckBox:
                    return (
                        <SxTriStateCheckBox
                            {...commonFieldProps}
                            disabled={disabled}
                            checked={_data}
                            onChange={(e) => { _onChange(e.target.checked, field, true); _onUpdateData(field, e.target.checked, data, formData, true); }}
                            {...field.overrideFieldProps}
                        />
                    );
                case SxFieldTypes.TextareaAutoHeight:
                    return (
                        <SxTextareaAutoHeight
                            {...commonFieldProps}
                            value={_data}
                            disabled={disabled}
                            onChange={(e) => _onChange(e.target.value, field)}
                            onBlur={(e) => _onUpdateData(field, e.target.value, data, formData)}
                            resizeable={field.resizeable === true}
                            {...field.overrideFieldProps}
                        />
                    );
                case SxFieldTypes.FormattedInput:
                    return <SxFormattedInput
                        {...commonFieldProps}
                        defaultValue={_data ?? ''}
                        disabled={disabled}
                        onChange={(e) => _onChange(e.target.value, field)}
                        onUpdate={(e) => _onUpdateData(field, e.target.value, data, formData)}
                        format={field.format}
                        onValErrorEnd={onValErrorEnd}
                        onValErrorStart={onValErrorStart}
                        {...field.overrideFieldProps}
                    />
                case SxFieldTypes.PostalCode:
                    return <SxPostalCode
                        {...commonFieldProps}
                        countryId={field.countryId}
                        defaultValue={_data ?? ''}
                        disabled={disabled}
                        onChange={(e) => _onChange(e.target.value, field)}
                        onUpdate={(e) => _onUpdateData(field, e.target.value, data, formData)}
                        onValErrorEnd={onValErrorEnd}
                        onValErrorStart={onValErrorStart}
                        {...field.overrideFieldProps}
                    />
                case SxFieldTypes.Address:
                    return <SxAddressWithMap
                        {...commonFieldProps}
                        value={_data}
                        disabled={disabled}
                        fullscreen={field.fullscreen}
                        modalOverrideProps={field.modalOverrideProps}
                        onChange={(e) => _onChange(e.target.value, field)}
                        onUpdate={(e) => onUpdateData(field, e.target.value, data, formData)}
                        openMaps={field.openMaps}
                        textAreaOverrideProps={field.textAreaOverrideProps}
                        {...field.overrideFieldProps}
                    />
                case SxFieldTypes.AmountInput:
                    return <SxAmountInput
                        {...commonFieldProps}
                        value={_data ?? null}
                        min={field.minValue}
                        max={field.maxValue}
                        addontype={field.addontype}
                        userLocal={field.userLocal}
                        userCurrency={field.userCurrency}
                        disabled={disabled}
                        onChange={(e) => { _onChange(e.target.valueAsNumber, field); }}
                        onBlur={(e) => {
                            _onUpdateData(field, e.target.valueAsNumber, data, formData);
                        }}
                        {...field.overrideFieldProps}
                    />
                case SxFieldTypes.PhoneNumberWithCallBtn:
                    return <SxPhoneNumberCallable
                        {...commonFieldProps}
                        classNameCallBtn={field.classNameCallBtn}
                        disabled={disabled}
                        disabledCallBtn={field.disabledCallBtn}
                        onBlur={(e) => _onUpdateData(field, e.target.value, data, formData)}
                        onChange={(e) => _onChange(e.target.value, field)}
                        overridePropsCallBtn={field.overridePropsCallBtn}
                        overridePropsInput={field.overridePropsInput}
                        value={_data ?? ''}
                        {...field.overrideFieldProps}
                    />;
                default:
                    console.error(`Unsupported field type passed to SxForm. type : '${field.type}' field : '${field.name}' value : '${data}'`);
                    return <></>;
            }
        }
        else {
            //Permet les cas où le SxForm doit contenir un component custom d'un type non géré.
            return field.render(field, formData, { ...externalData, metadata: metadata }, _onChange, _onUpdateData, onValErrorStart, onValErrorEnd);
        }
    };

    const lblComp =
        typeof field.label === 'undefined' ?
            <></> :
            <>
                <span className={`${field.labelOver ? 'col' : `col-${field.lblNbCols}`} px-1 ${!field.labelOver && field.type !== SxFieldTypes.Checkbox && field.type !== SxFieldTypes.TriStateCheckBox ? ' pt-1' : ''}`}>
                    {field.isMandatory && msg.indicators.characterMandatory}
                    <Label
                        id={labelId}
                        for={fieldId}
                        className={`d-inline align-middle ${field.lblClassName ?? ''} ${isDirty ? ` ${dirtyClassName ?? ''}` : ''} ${field.labelOver ? '' : 'mr-2'}`}
                        {...field.overrideLabelProps}>
                        {field.label}
                    </Label>
                </span>
                {field.labelOver && <div className="w-100"></div>} {/*Effectuer un saut de ligne sur labelOver.*/}
            </>;

    const genMessages = () => <>
        {field.fieldMessage && <Alert color="info" className={"FieldMsgs mb-0"}>{field.fieldMessage}</Alert>}
        {errorMsg && <Alert color="danger" className={"FieldMsgs mb-0"}>{errorMsg}</Alert>}
        {warningMsg && <Alert color="warning" className={"FieldMsgs mb-0"}>{warningMsg}</Alert>}
    </>;

    const fieldComp =
        <div className={`${typeof field.label === 'undefined' || field.labelOver ? 'col' : `col-${12 - field.lblNbCols}`} align-middle px-1`} >
            {renderField()}
            {genMessages()}
        </div>;

    const builtComp = <div className={`row w-100 mx-0 mx-lg-1`}>
            {field.type !== SxFieldTypes.Label &&
                field.label &&
                lblComp
            }
            {fieldComp}
        </div>;

    return <FormGroup
        key={field.id}
        className={`${field.className || ''}${field.type === SxFieldTypes.HiddenText || metadata?.canRead === false ? 'd-none' : ''}`}//L'emplacement vide d'un champ texte caché doit disparaître sans toutefois retirer le champ du DOM
    >
        <div className="row m-lg-1">
            {field.labelOver ?
                <div className="col px-0">{builtComp}</div> :
                builtComp
            }
        </div>
    </FormGroup>;
};

_SxFormField.propTypes = propTypes;

_SxFormField.defaultProps = defaultProps;

_SxFormField.displayName = "SxFormField";
export { propTypes };
export { msg };
export { SxFieldTypes };
const tmp = SxFieldTypes.fieldDefEntryShapes
export { tmp as fieldDefEntryShapes }; //Nous re-exportons ici la définition pour simplifier les imports des utilisateurs.

/**
 * Présentation d'un champ et de son étiquette dans un formulaire 
 *  
 * @type {React.Component<propTypes>} 
 */
const SxFormField = withSxMetadataInspector(_SxFormField);
export default SxFormField;