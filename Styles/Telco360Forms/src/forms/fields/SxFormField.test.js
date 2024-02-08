import React from 'react';
import { screen, render, getByLabelText, fireEvent, waitFor } from '@testing-library/react';

import { SxFormField, SxFieldTypes } from '../../index';

import { utHelpers } from '@telco360/components';
import '@testing-library/jest-dom/extend-expect';
// Pour utiliser les SxDatePicker, il faut initialiser une seule fois à un haut niveau tel que recommandé
import 'moment/locale/fr-ca';


describe("<SxFormField />", () => {
    describe("Champ de type texte", () => {
        const fieldName = "typeText";
        const fieldLabel = "Champ texte";
        const fieldDef = { name: fieldName, id: 0, enabled: true, label: fieldLabel, type: SxFieldTypes.Text, };
        const formData = { [fieldName]: "Original Value", typeText2: "Original Value 2" };
        const externalData = { test: "extDataTest" };

        it("Afficher le champ", async () => {
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                errorMsg={undefined}
                warningMsg={undefined}

                onValErrorStart={() => { }}
                onValErrorEnd={() => { }}

                externalData={externalData}
            />);

            const textField = await screen.findByLabelText(fieldLabel);

            expect(textField.value).toBe("Original Value");
        });
    });

    describe("Champ de type nombre", () => {
        const fieldName = "typeNumber";
        const fieldLabel = "Champ nombre";
        const fieldDef = { name: fieldName, label: fieldLabel, id: 1, type: SxFieldTypes.Number, enabled: true, };
        const formData = { [fieldName]: 5, typeText2: "Original Value 2" };
        const externalData = { test: "extDataTest" };

        it("Afficher le champ", async () => {
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                errorMsg={undefined}
                warningMsg={undefined}

                onValErrorStart={() => { }}
                onValErrorEnd={() => { }}

                externalData={externalData}
            />);

            const numField = await screen.findByLabelText(fieldLabel);

            expect(numField.value).toBe("5");
        });

        it("La valeur modifiée est de type 'number'", async () => {
            //Arrange
            let typeofValue = "undefined";
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={(_field, value, _data, _formData) => {
                    typeofValue = typeof value;
                }}
                isDirty={false}
                errorMsg={undefined}
                warningMsg={undefined}

                onValErrorStart={() => { }}
                onValErrorEnd={() => { }}

                externalData={externalData}
            />);

            //Act
            const numField = await screen.findByLabelText(fieldLabel);
            fireEvent.change(numField, { target: { value: 6 } });
            fireEvent.blur(numField);

            await waitFor(() => expect(typeofValue).toBe("number"));
        });
    });

    describe("Champ de type SxBooleanLabel", () => {
        const fieldName = "typeBooleanLabel";
        const fieldLabel = "Champ étiquette booléene";
        const fieldDef = { name: fieldName, label: fieldLabel, id: 1, type: SxFieldTypes.BooleanLabel, };
        const formData = { [fieldName]: true, typeText2: "Original Value 2" };
        const externalData = { test: "extDataTest" };

        it("Afficher le champ SxBooleanLabel", async () => {
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                errorMsg={undefined}
                warningMsg={undefined}

                onValErrorStart={() => { }}
                onValErrorEnd={() => { }}

                externalData={externalData}
            />);

            const booleanLabelField = await screen.findByLabelText(fieldLabel);
            expect(booleanLabelField).toHaveClass("fa-check");
        });
    });

    describe("Champ de type case à cocher", () => {
        const fieldName = "typeCheckbox";
        const fieldLabel = "Champ case à cocher";
        const fieldDef = { name: fieldName, label: fieldLabel, id: 1, type: SxFieldTypes.Checkbox, enabled: true, };
        const formData = { [fieldName]: true, typeText2: "Original Value 2" };
        const externalData = { test: "extDataTest" };

        it("Afficher le champ", async () => {
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                errorMsg={undefined}
                warningMsg={undefined}

                onValErrorStart={() => { }}
                onValErrorEnd={() => { }}

                externalData={externalData}
            />);

            const checkboxField = await screen.findByLabelText(fieldLabel);

            expect(checkboxField.checked).toBe(true);
        });
    });

    describe("Champ de type liste", () => {
        const fieldName = "typeList";
        const fieldLabel = "Champ liste";
        const fieldDef = {
            name: fieldName, label: fieldLabel, id: 1, type: SxFieldTypes.Select, enabled: true,
            options: [{ value: 0, label: "ListValue-0" },
            { value: 1, label: "ListValue-1" },
            { value: 2, label: "ListValue-2" },
            { value: 3, label: "ListValue-3" }]
        };
        const formData = { [fieldName]: 1, typeText2: "Original Value 2" };
        const externalData = { test: "extDataTest" };

        it("Afficher le champ", async () => {
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                errorMsg={undefined}
                warningMsg={undefined}

                onValErrorStart={() => { }}
                onValErrorEnd={() => { }}

                externalData={externalData}
            />);

            let selectNode = await utHelpers.sxSelect.findSelect();
            utHelpers.sxSelect.checkSelectedValue(formData[fieldName].toString(), selectNode);
            utHelpers.sxSelect.getToggler();
            utHelpers.sxSelect.getClearableForSelect(selectNode);

            expect(selectNode.value).toBe(formData[fieldName].toString());
        });
    });

    describe("Champ de type liste étendue", () => {
        const fieldName = "typeExtendedList";
        const fieldLabel = "Champ liste étendu";
        const fieldDef = {
            name: fieldName, label: fieldLabel, id: 1, type: SxFieldTypes.ExtendedSelect, enabled: true,
            options: [{ value: "ExtVal1", label: "ExtVal1" }, { value: "ExtVal2", label: "ExtVal2" }, { value: "ExtVal3", label: "ExtVal3" }]
        };
        const formData = { [fieldName]: "ExtVal3", typeText2: "Original Value 2" };
        const externalData = { test: "extDataTest" };

        it("Afficher le champ", async () => {
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                errorMsg={undefined}
                warningMsg={undefined}

                onValErrorStart={() => { }}
                onValErrorEnd={() => { }}

                externalData={externalData}
            />);

            await screen.findByLabelText(fieldLabel); //Nous attendons que le champ complet soit trouvé.
        });
    });

    describe("Champ de type date", () => {
        const fieldName = "typeDate";
        const fieldLabel = "Champ date";
        const fieldDef = { name: fieldName, label: fieldLabel, id: 1, type: SxFieldTypes.Date, enabled: true, };
        const formData = { [fieldName]: "2020-11-09T00:00:00.000Z", typeText2: "Original Value 2" };
        const externalData = { test: "extDataTest" };

        it("Afficher le champ", async () => {
            //Arrange
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                errorMsg={undefined}
                warningMsg={undefined}

                onValErrorStart={() => { }}
                onValErrorEnd={() => { }}

                externalData={externalData}
            />);

            //Act
            const dateField = await screen.findByLabelText(fieldLabel);

            //Assert
            expect(dateField.value).toBe(new Date("2020-11-09T00:00:00.000Z").toLocaleDateString("fr-ca"));
        });
    });

    describe("Champ de type libelé", () => {
        const fieldName = "typeLabel";
        const fieldDef = { name: fieldName, id: 1, type: SxFieldTypes.Label, enabled: true, };
        const formData = { [fieldName]: "Ceci est un libelé", typeText2: "Original Value 2" };
        const externalData = { test: "extDataTest" };

        it("Afficher le champ", async () => {
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                errorMsg={undefined}
                warningMsg={undefined}

                onValErrorStart={() => { }}
                onValErrorEnd={() => { }}

                externalData={externalData}
            />);

            expect(await screen.findByText("Ceci est un libelé")).toBeInTheDocument(); //Le champs est trouvé.
        });
    });

    describe("Champ de type texte caché", () => {
        const fieldName = "typeHiddenText";
        const fieldDef = { name: fieldName, label: "Champ caché", id: 2, type: SxFieldTypes.HiddenText, enabled: true, };
        const formData = { [fieldName]: "ExtVal3", typeText2: "Original Value 2" };
        const externalData = { test: "extDataTest" };

        it("N'affiche pas le champ", async () => {
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                errorMsg={undefined}
                warningMsg={undefined}

                onValErrorStart={() => { }}
                onValErrorEnd={() => { }}

                externalData={externalData}
            />);
            await screen.findByText("Champ caché");
            expect(screen.queryByText("HiddenTextValue")).not.toBeInTheDocument();
        });
    });

    describe("Champ de type NumInputOver", () => {
        const fieldName = "typeNumInputOver";
        const fieldLabel = "Champ numérique NumInputOver";
        const fieldDef = { name: fieldName, label: fieldLabel, id: 2, type: SxFieldTypes.NumInputOver };
        const formData = { [fieldName]: 50, someOtherValue: "I won't change" };
        it("Afficher le champ", async () => {
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                errorMsg={undefined}
                warningMsg={undefined}

                onValErrorStart={() => { }}
                onValErrorEnd={() => { }}
            />);
            let producedField = await screen.findByLabelText(fieldLabel);
            expect(producedField.closest("input").value).toBe("50");
        });
    });

    describe("Champ de type NumInputUnder", () => {
        const fieldName = "typeNumInputUnder";
        const fieldLabel = "Champ numérique NumInputUnder";
        const fieldDef = { name: fieldName, label: fieldLabel, id: 2, type: SxFieldTypes.NumInputUnder };
        const formData = { [fieldName]: 50, someOtherValue: "I won't change" };
        it("Afficher le champ", async () => {
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                errorMsg={undefined}
                warningMsg={undefined}

                onValErrorStart={() => { }}
                onValErrorEnd={() => { }}
            />);
            let producedField = await screen.findByLabelText(fieldLabel);
            expect(producedField.closest("input").value).toBe("50");
        });
    });

    describe("Champ de type NumInputRange", () => {
        const fieldName = "typeNumInput`Range";
        const fieldLabel = "Champ numérique NumInputRange";
        const fieldDef = { name: fieldName, label: fieldLabel, id: 2, type: SxFieldTypes.NumInputRange, minAllowed: 50, maxAllowed: 80, };
        const formData = {
            [fieldName]: { minValue: 50, maxValue: 80 },
            someOtherValue: "I won't change"
        };
        it("Afficher le champ", async () => {
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                errorMsg={undefined}
                warningMsg={undefined}

                onValErrorStart={() => { }}
                onValErrorEnd={() => { }}
            />);
            let producedField = await screen.findByLabelText(fieldLabel);

            let fromField = getByLabelText(producedField, "Entre");
            let toField = getByLabelText(producedField, "et");
            expect(fromField.value).toBe("50");
            expect(toField.value).toBe("80");
        });
    });

    describe("Champ de type image", () => {
        const fieldName = "typeImage";
        const fieldLabel = "Champ image";
        const fieldDef = { name: fieldName, label: fieldLabel, id: 2, type: SxFieldTypes.Image, enabled: true, };
        const formData = { [fieldName]: "ExtVal3", typeText2: "Original Value 2" };
        const externalData = { test: "extDataTest" };

        it("Afficher le champ", async () => {
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                errorMsg={undefined}
                warningMsg={undefined}

                onValErrorStart={() => { }}
                onValErrorEnd={() => { }}

                externalData={externalData}
            />);

            await screen.findByRole("button", { name: "Modifier" });
            expect(screen.getByRole("img")).toBeInTheDocument();
        });
    });

    describe("Affichage de champ de type custom", () => {
        const CustomComp = (props) => {
            return <div>Ceci est un component custom avec la valeur {props.value}</div>;
        };

        let fieldReceived, formDataReceived, externalDataReceived, onChangeReceived, onUpdateReceived, onValErrorStartReceived, onValErrorReceived;

        const fieldName = "typeCustom";
        const fieldLabel = "Champ Custom";
        const fieldDef = {
            name: fieldName, label: fieldLabel, id: 2,
            render: (field, formData, externalData, onChange, onUpdate, onValErrorStart, onValErrorEnd) => {
                fieldReceived = field;
                formDataReceived = formData;
                externalDataReceived = externalData;
                onChangeReceived = onChange;
                onUpdateReceived = onUpdate;
                onValErrorStartReceived = onValErrorStart;
                onValErrorReceived = onValErrorEnd;
                return <CustomComp value={formData[field.name]} />;
            },
        };
        const formData = { [fieldName]: "customValue", typeText2: "Original Value 2" };
        const externalData = { test: "extDataTest" };


        it("Afficher le champ", async () => {
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                errorMsg={undefined}
                warningMsg={undefined}

                onValErrorStart={() => { }}
                onValErrorEnd={() => { }}

                externalData={externalData}
            />);
            await screen.findByText(`Ceci est un component custom avec la valeur ${formData[fieldName]}`); //Nous confirmons que le component est affiché tel qu'attendu.
            //Nous validons que les props reçu lors du render sont bien comme nous les attendons.
            expect(fieldReceived.name).toBe(fieldName);
            expect(formDataReceived["typeText2"]).toBe("Original Value 2");
            expect(externalDataReceived.test).toBe("extDataTest");
            expect(typeof onChangeReceived).toBe("function");
            expect(typeof onUpdateReceived).toBe("function");
            expect(typeof onValErrorStartReceived).toBe("function");
            expect(typeof onValErrorReceived).toBe("function");
        });

    });

    describe("Affichage de champ de type SecretText", () => {
        const fieldName = "typeSecretText";
        const fieldLabel = "Champ secret";
        const fetchValueFunc = () => {
            return new Promise(res => {
                return res("123456");
            });
        }
        const fieldDef = { name: fieldName, label: fieldLabel, id: 1, type: SxFieldTypes.SecretText, fetchValue: fetchValueFunc, };
        const formData = { [fieldName]: "888888", typeText2: "Original Value 2", };
        const externalData = { test: "extDataTest" };

        it("Afficher le champ SecretText", async () => {
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                errorMsg={undefined}
                warningMsg={undefined}

                onValErrorStart={() => { }}
                onValErrorEnd={() => { }}

                externalData={externalData}
            />);

            const secretField = await screen.findByLabelText(fieldLabel); //Le champs est trouvé.
            expect(secretField.closest("input").value).toBe("");
            expect(secretField.closest("input").type).toBe("password");
            const secretButton = screen.getByRole("button");
            fireEvent.click(secretButton);
            await waitFor(() => secretField.closest("input").value === "123456");
            expect(secretField.closest("input").value).toBe("123456");
            expect(secretField.closest("input").type).toBe("text");
        });
    });

    describe("Affichage de champ de type 'PhoneNumberWithCallBtn'", () => {
        const fieldLabel = "Champ numéro téléphone";
        const fieldName = "typePhoneNumberWithCallBtn";
        const fieldDef = {
            id: 1,
            label: fieldLabel,
            name: fieldName,
            type: SxFieldTypes.PhoneNumberWithCallBtn,
        };
        const formData = {
            [fieldName]: "819-555-0123",
        };

        it("Afficher le champ 'PhoneNumberWithCallBtn'", async () => {
            //Arrange
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                errorMsg={undefined}
                warningMsg={undefined}
                onValErrorStart={() => { }}
                onValErrorEnd={() => { }}
            />);

            //Act
            const phoneNumberWithCallBtnField = await screen.findByLabelText(fieldLabel);

            //Assert
            expect(phoneNumberWithCallBtnField.value).toBe("(819) 555-0123");
            expect(phoneNumberWithCallBtnField.type).toBe("text");
        });
    });

    describe("Comportements général", () => {
        const fieldName = "typeText";
        const fieldLabel = "Champ texte";
        const id = "dcd9d47a-8bd9-4700-84d8-e75897706213";
        const fieldDef = { name: fieldName, id: id, enabled: true, label: fieldLabel, type: SxFieldTypes.Text, };
        const formData = { [fieldName]: "Original Value", typeText2: "Original Value 2" };
        const externalData = { test: "extDataTest" };

        it("Le champ est en lecture seule (droit granulaire)", async () =>{
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                metadata={{fieldId: id, canWrite: false}}
            />);

            const field = await screen.findByLabelText(fieldLabel);
            expect(field).not.toBeEnabled();
        });

        it("Le champ n'est pas visible (droit granulaire)", async () =>{
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                metadata={{fieldId: id, canRead: false}}
            />);

            const field = screen.queryByLabelText(fieldLabel);
            expect(field).not.toBeInTheDocument();
        });

        it("Afficher un message d'erreur sous un champ", async () => {
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                warningMsg={undefined}

                onValErrorStart={() => { }}
                onValErrorEnd={() => { }}

                externalData={externalData}

                errorMsg={"Ceci est un message d'erreur sous le champ."}
            />);

            await screen.findByText("Ceci est un message d'erreur sous le champ.");
        });

        it("Afficher un message d'avertissement sous un champ", async () => {
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                errorMsg={undefined}

                onValErrorStart={() => { }}
                onValErrorEnd={() => { }}

                externalData={externalData}

                warningMsg={"Ceci est un message d'avertissement sous le champ."}
            />);

            await screen.findByText("Ceci est un message d'avertissement sous le champ.");
        });

        it("Afficher un annotation sous un champ", async () => {
            render(<SxFormField
                field={{ ...fieldDef, fieldMessage: "Test Annotation" }}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                warningMsg={undefined}

                onValErrorStart={() => { }}
                onValErrorEnd={() => { }}

                externalData={externalData}

                errorMsg={"Ceci est un message d'erreur sous le champ."}
            />);

            await screen.findByText("Test Annotation");
        });
    });

    describe("Champ de type textarea auto height", () => {
        const fieldName = "typeTextarea";
        const fieldLabel = "Champ textarea auto height";
        const fieldDef = { name: fieldName, id: 0, enabled: true, label: fieldLabel, type: SxFieldTypes.TextareaAutoHeight, };
        const formData = { [fieldName]: "Original Value", typeText2: "Original Value 2" };
        const externalData = { test: "extDataTest" };

        it("Afficher le champ", async () => {
            render(<SxFormField
                field={fieldDef}
                data={formData[fieldName]}
                formData={formData}
                onChange={() => { }}
                onUpdateData={() => { }}
                isDirty={false}
                errorMsg={undefined}
                warningMsg={undefined}

                onValErrorStart={() => { }}
                onValErrorEnd={() => { }}

                externalData={externalData}
            />);

            const textField = await screen.findByLabelText(fieldLabel);

            expect(textField.value).toBe("Original Value");
        });
    });
});
