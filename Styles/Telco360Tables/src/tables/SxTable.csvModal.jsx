import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';


import { SxSelect, SxCheckbox, SxModalYesNo, withConfigs } from '@telco360/components';

const divBlock = (label, field) => 
    <div className="d-flex w-100">
        <span className="col-6 pt-1 text-left">
            <label 
                className="px-2">{label}
            </label>
        </span>
        <div 
            className="col-6 mx-0 text-left">{field}
        </div>
    </div>;

const CsvModalBody = ({ data, onUpdate, msg }) => 
    <>
        <div className="row my-1">
            <label className="text-center w-100">{msg.csvModal.title}</label>
        </div>
        <div className="row my-1">
            {divBlock(msg.csvModal.separator, 
                <SxSelect
                     options={[{ value: ";", label: "Point-virgule" }, { value: ",", label: "Virgule" }, { value: " ", label: "Espace" }, { value: "\t", label: "Tabulation" }]}
                     onChange={(val, _label) => onUpdate({ name: "separator" }, val)}
                     value={data.separator}
                />)}
        </div>
        <div className="row my-1">
            {divBlock(msg.csvModal.rawData, 
                <SxCheckbox
                    dataFieldName={"rawData"}
                    value={data.rawData}
                    onChange={(e) => onUpdate({ name: "rawData" }, e.target.checked)}
                />)}
        </div>
        <div className="row my-1">
            {divBlock(msg.csvModal.incColTitle, 
                <SxCheckbox
                    dataFieldName={"incColTitle"}
                    value={data.incColTitle}
                    onChange={(e) => onUpdate({ name: "incColTitle" }, e.target.checked)}
                />)}

        </div>
        <div className="row my-1">
            {divBlock(msg.csvModal.onlyVisible, 
                <SxCheckbox
                    dataFieldName={"onlyVisible"}
                    value={data.onlyVisible}
                    onChange={(e) => onUpdate({ name: "onlyVisible" }, e.target.checked)}
                />)}

        </div>
    </>

const withCsvModal = (WrappedComponent) => {
    const SxTableCsvModal = ({msg, ...props}) => {
        const [opened, setOpened] = useState(false);
        const [modalProps, setModalProps] = useState();
        const [data, setData] = useState({
            separator: ";",
            rawData: false,
            incColTitle: true,
            onlyVisible: true
        });

        const showCsvConfirmModal = useCallback(({ onClickYes, onClickNo }) => {
            if (opened) {
                console.error("Only one SxTableCsvModal can be shown at a time.");
            }
            else {
                setModalProps({
                    onClickYes: async (data) => {
                        setOpened(false);
                        await onClickYes(data);
                    },
                    onClickNo: async () => {
                        setOpened(false);
                        await onClickNo?.();
                    }
                });
                setOpened(true);
            }
        }, [opened]);

        const onClickYes = useCallback(() => modalProps.onClickYes(data), [modalProps, data]);
        const onClickClose = () => setOpened(false);

        const onUpdate = useCallback((fieldDef, newValue, _newFormData) => {
            setData({ ...data, [fieldDef.name]: newValue });
        }, [data]);

        return <>
            {
                opened &&
                <SxModalYesNo
                    isOpen={opened}
                    onClickYes={onClickYes}
                    onClickNo={modalProps.onClickNo}
                    onClickClose={onClickClose}
                    message={<CsvModalBody
                        data={data}
                        onUpdate={onUpdate}
                        msg={msg}
                    />}
                />
            }
            <WrappedComponent
                {...props}
                msg={msg}
                showCsvConfirmModal={showCsvConfirmModal}
            />
        </>;
    };

    SxTableCsvModal.displayName = `SxTableCsvModal(${(WrappedComponent?.displayName || WrappedComponent?.name || 'Component')})`;

    SxTableCsvModal.propTypes = {

    };

    SxTableCsvModal.defaultProps = {

    };

    return withConfigs(SxTableCsvModal);
};

withCsvModal.displayName = "SxTableCsvModal";

export default withCsvModal;