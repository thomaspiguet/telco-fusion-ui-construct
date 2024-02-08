import React, { useState } from 'react';
import { screen, render, waitFor, fireEvent, findByRole } from '@testing-library/react';

import { SxFormNoPending, SxFieldTypes } from '../index';

import { msg } from './SxForm';
import { utHelpers } from '@telco360/components';

import '@testing-library/jest-dom/extend-expect';

const baseProps = {
    onSubmit: () => { },
    onCancel: () => { },
    onSubmitSuccess: () => { },
    updateData: () => { },
    onResetImage: () => { },
    onSaveImage: () => { },
    cancelDelegator: () => { },
    success: true,
};

const formData = {
    typeText: "Ceci est le texte",
    typeNumber: 24562,
    typeChekbox: true,
    typeList: "ListValue-3",
    typeDate: "2020-03-24T12:05:00.000",
    typeLabel: "Label Default Label",
    typeExtendedSelect: "ExtVal3",
    typeHiddenText: "HiddenTextValue",
    typeImage: null,
};

//Wrap a mettre autour de SxFormNoPending afin d'avoir une persitance des données modifiées. (Implémente un updateData de base.)
const SxFormDataWrap = (props) => {
    const [data, setData] = useState(props.data);
    return <SxFormNoPending {...props} data={data} updateData={(fd, v) => { setData({ ...data, [fd.name]: v }) }} />
};

describe("<SxFormNoPending />", () => {
    describe("Fonctionnalité de base du SxForm", () => {
        it("onCancel est appelé", async () => {
            let onCancelCalled = 0;
            render(<SxFormNoPending
                fieldDefinitions={[{ name: "typeText", id: 1, enabled: true, label: "Champ texte", type: SxFieldTypes.Text, }]}
                data={formData}
                {...baseProps}
                onCancel={() => { onCancelCalled++; }}
            />);
            //Nous faisons un changement bidon
            const textField = await screen.findByLabelText("Champ texte");
            fireEvent.change(textField, { target: { value: "New Value" } });
            //Nous effectuons un click sur le bouton Annuler
            const cancelBtn = screen.getByText(msg.button.cancel);
            fireEvent.click(cancelBtn);

            await waitFor(() => onCancelCalled !== 0); //Nous attendons que la valeur de la variable ai été changé.
            expect(onCancelCalled).toBe(1);  //Nous validons que la valeur est correct car waitFor ne lancera pas d'exception si la valeur reste à false.
        });

        it("onSubmit est appelé", async () => {
            let onSubmitCalled = 0;
            render(<SxFormNoPending
                fieldDefinitions={[{ name: "typeText", id: 1, enabled: true, label: "Champ texte", type: SxFieldTypes.Text, }]}
                data={formData}
                {...baseProps}
                onSubmit={() => { onSubmitCalled++; return true; }}
            />);
            //Nous faisons un changement bidon
            const textField = await screen.findByLabelText("Champ texte");
            fireEvent.change(textField, { target: { value: "New Value" } }); //Comme les champs sont mis dirty onChange, aucun besoin d'appeler onBlur.
            //Nous effectuons un click sur le bouton Sauvegarder
            const saveBtn = screen.getByText(msg.button.submit);

            fireEvent.click(saveBtn);

            await waitFor(() => onSubmitCalled !== 0); //Nous attendons que la valeur de la variable ai été changé.
            expect(onSubmitCalled).toBe(1);  //Nous validons que la valeur est correct car waitFor ne lancera pas d'exception si la valeur reste à false.
        });

        it("onSubmit est appelé via le delegator", async () => {
            let submitDelegate = () => { };
            let onSubmitCalled = 0;
            render(<SxFormNoPending
                fieldDefinitions={[{ name: "typeText", id: 1, enabled: true, label: "Champ texte", type: SxFieldTypes.Text, }]}
                data={formData}
                {...baseProps}
                onSubmit={() => { onSubmitCalled++; return true; }}
                submitDelegator={(delegate) => submitDelegate = delegate}
            />);
            //Nous faisons un changement bidon
            const textField = await screen.findByLabelText("Champ texte");
            fireEvent.change(textField, { target: { value: "New Value" } }); //Comme les champs sont mis dirty onChange, aucun besoin d'appeler onBlur.
            //Nous effectuons un submit via le delegator
            submitDelegate();

            await waitFor(() => onSubmitCalled !== 0); //Nous attendons que la valeur de la variable ai été changé.
            expect(onSubmitCalled).toBe(1);  //Nous validons que la valeur est correct car waitFor ne lancera pas d'exception si la valeur reste à false.
        });

        it("onSubmitSuccess est appelé lorsque la sauvegarde est effectué", async () => {
            let onSubmitSuccessCalled = 0;
            render(<SxFormNoPending
                fieldDefinitions={[{ name: "typeText", id: 1, enabled: true, label: "Champ texte", type: SxFieldTypes.Text, }]}
                data={formData}
                {...baseProps}
                onSubmit={() => { return true; }}
                onSubmitSuccess={() => { onSubmitSuccessCalled++; }}
            />);
            //Nous faisons un changement bidon
            const textField = await screen.findByLabelText("Champ texte");
            fireEvent.change(textField, { target: { value: "New Value" } });
            //Nous effectuons un click sur le bouton Sauvegarder
            const saveBtn = screen.getByText(msg.button.submit);

            fireEvent.click(saveBtn);

            await waitFor(() => onSubmitSuccessCalled !== 0); //Nous attendons que la valeur de la variable ai été changé.
            expect(onSubmitSuccessCalled).toBe(1);  //Nous validons que la valeur est correct car waitFor ne lancera pas d'exception si la valeur reste à false.
        });

        it("onSubmitSuccess n'est pas appelé lorsque la sauvegarde échoue", async () => {
            let onSubmitSuccessCalled = 0;
            render(<SxFormNoPending
                fieldDefinitions={[{ name: "typeText", id: 1, enabled: true, label: "Champ texte", type: SxFieldTypes.Text, }]}
                data={formData}
                {...baseProps}
                onSubmit={() => { return false; }}
                onSubmitSuccess={() => { onSubmitSuccessCalled++; }}
            />);
            //Nous faisons un changement bidon
            const textField = await screen.findByLabelText("Champ texte");
            fireEvent.change(textField, { target: { value: "New Value" } });
            //Nous effectuons un click sur le bouton Sauvegarder
            const saveBtn = screen.getByText(msg.button.submit);

            fireEvent.click(saveBtn);

            await waitFor(() => onSubmitSuccessCalled !== 0); //Nous attendons pour laisser le temps à la variable de changer même si elle ne devrait pas l'être.
            expect(onSubmitSuccessCalled).toBe(0);  //Nous validons que la valeur est correct car waitFor ne lancera pas d'exception si la valeur reste à false.
        });

        it("updateData est appelé", async () => {
            let updateDataCalled = 0;
            let fieldDf = {};
            let newVal = "";
            let newFormDt = [];
            render(<SxFormNoPending
                fieldDefinitions={[{ name: "typeText", id: 0, enabled: true, label: "Champ texte", type: SxFieldTypes.Text, },
                { name: "typeText2", id: 1, enabled: true, label: "Original Val 2", type: SxFieldTypes.Text, }]}
                data={{ typeText: "Champ texte", typeText2: "Original Val 2" }}
                {...baseProps}
                updateData={(fieldDef, newValue, newFormData) => { updateDataCalled++; fieldDf = fieldDef; newVal = newValue; newFormDt = newFormData; }}
            />);
            //Nous faisons un changement bidon
            const textField = await screen.findByLabelText("Champ texte");
            fireEvent.change(textField, { target: { value: "New Value" } });
            fireEvent.blur(textField); //Comme updateData est appelé onBlur nous l'appelons ici.
            //Nous effectuons un click sur le bouton Sauvegarder
            const saveBtn = screen.getByText(msg.button.submit);

            fireEvent.click(saveBtn);

            await waitFor(() => updateDataCalled !== 0); //Nous attendons que la valeur de la variable ai été changé.
            expect(updateDataCalled).toBe(1);  //Nous validons que la valeur est correct car waitFor ne lancera pas d'exception si la valeur reste à false.
            expect(fieldDf.name).toBe("typeText"); //La définition reçus est la bonne
            expect(newVal).toBe("New Value"); //La valeur reçue st la bonne
            expect(newFormDt["typeText2"]).toBe("Original Val 2"); //Les autres champs du formulaire ont toujours leurs bonne valeurs de disponible.
        });

        it("cancelDelegator permet d'appelé le onCancel de l'extérieur du SxForm.", async () => {
            let onCancelCalled = 0;
            let cancelDelegate;
            render(<SxFormNoPending
                fieldDefinitions={[{ name: "typeText", id: 1, enabled: true, label: "Champ texte", type: SxFieldTypes.Text, }]}
                data={formData}
                {...baseProps}
                onCancel={() => { onCancelCalled++; }}
                cancelDelegator={(d) => { cancelDelegate = d; }}
            />);
            //Nous attendons que le SxForm soit terminer d'être rendered.
            await screen.findByLabelText("Champ texte");

            cancelDelegate();

            await waitFor(() => onCancelCalled !== 0); //Nous attendons que la valeur de la variable ai été changé.
            expect(onCancelCalled).toBe(1);  //Nous validons que la valeur est correct car waitFor ne lancera pas d'exception si la valeur reste à false.
        });

        it("hasExternalErrors permet de bloquer la sauvegarde de l'extérieur du SxForm", async () => {
            let onSubmitCalled = 0;
            render(<SxFormNoPending
                fieldDefinitions={[{ name: "typeText", id: 1, enabled: true, label: "Champ texte", type: SxFieldTypes.Text, }]}
                data={formData}
                {...baseProps}
                onSubmit={() => { onSubmitCalled++; return true; }}
                hasExternalErrors={true}
            />);
            //Nous faisons un changement bidon
            const textField = await screen.findByLabelText("Champ texte");
            fireEvent.change(textField, { target: { value: "New Value" } }); //Comme les champs sont mis dirty onChange, aucun besoin d'appeler onBlur.
            //Nous effectuons un click sur le bouton Sauvegarder
            const saveBtn = screen.getByText(msg.button.submit);

            fireEvent.click(saveBtn);

            await waitFor(() => onSubmitCalled !== 0); //Nous attendons que la valeur de la variable ai été changé.
            expect(onSubmitCalled).toBe(0);  //Nous nous assurons que le click n'a pas provoqué de sauvegarde car le bouton était bien désactivé.
        });

        it("Les secondary controls sont fonctionnels", async () => {
            let actionCalled = 0;
            render(<SxFormNoPending
                fieldDefinitions={[{ name: "typeText", id: 1, enabled: true, label: "Champ texte", type: SxFieldTypes.Text, }]}
                data={formData}
                {...baseProps}
                secondaryControls={[    //Ajoute autant d'icones que requis pour des contrôles secondaire du form.
                    { role: "testIcon", icon: "fa fa-circle", action: () => actionCalled++ }
                ]}
            />);

            const icon = await screen.findByRole("testIcon");
            fireEvent.click(icon);

            await waitFor(() => expect(actionCalled).toBe(1));
        });

        it("Les secondary controls automatiques sont fonctionnels", async () => {
            render(<SxFormNoPending
                fieldDefinitions={[{ name: "typeText", id: 1, enabled: true, label: "Champ texte", type: SxFieldTypes.Text, }]}
                data={formData}
                {...baseProps}
                isInModal={true}
                formUrl="fake/url"
            />);

            await screen.findByRole("externalLinkIcon");
            screen.getByRole("closeIcon");
        });
    });

    describe("Fonctionement des validations", () => {
        beforeEach(() => {
            utHelpers.console.startRedirect();
        });

        afterEach(() => {
            utHelpers.console.stopRedirect();
            jest.clearAllMocks();
        });

        it("Les champs requis doivent être remplis pour la sauvegarde onBlur", async () => {
            render(<SxFormNoPending
                fieldDefinitions={[{ name: "typeText", id: 0, enabled: true, label: "Champ texte", type: SxFieldTypes.Text, },
                { name: "typeText2", id: 1, enabled: true, label: "Champ texte 2", type: SxFieldTypes.Text, isMandatory: true }]}
                data={{ typeText: "Champ texte" }}
                {...baseProps}
            />);
            //Nous faisons un changement bidon
            const textField = await screen.findByLabelText("Champ texte 2");
            fireEvent.change(textField, { target: { value: "" } });
            fireEvent.blur(textField);
            //Nous effectuons un click sur le bouton Sauvegarder
            const saveBtn = screen.getByText(msg.button.submit).closest("button");
            await waitFor(() => expect(saveBtn.disabled).toBeTruthy());
            expect(saveBtn.disabled).toBeTruthy();
            expect(screen.getByText(msg.error.notNull));
        });

        it("Les champs requis doivent être remplis pour la sauvegarde onSubmit", async () => {
            let onSubmitCalled = 0;
            render(<SxFormNoPending
                fieldDefinitions={[{ name: "typeText", id: 0, enabled: true, label: "Champ texte", type: SxFieldTypes.Text, },
                { name: "typeText2", id: 1, enabled: true, label: "Champ texte 2", type: SxFieldTypes.Text, isMandatory: true }]}
                data={{ typeText: "Champ texte", typeText2: "" }}
                {...baseProps}
                onSubmit={() => { onSubmitCalled++; return true; }}
            />);
            //Nous faisons un changement bidon
            const textField = await screen.findByLabelText("Champ texte");
            fireEvent.change(textField, { target: { value: "New Value" } });
            fireEvent.blur(textField);

            //Nous effectuons un click sur le bouton Sauvegarder
            const saveBtn = screen.getByText(msg.button.submit).closest("button");
            await waitFor(() => expect(saveBtn.disabled).toBeFalsy()); //Nous devons attendre que le bouton soit disponible avant de cliquer dessu.
            fireEvent.click(saveBtn);
            await waitFor(() => onSubmitCalled !== 0); //Nous attendons pour laisser la possibilité au onSubmit d'être appelé même si il ne doit pas l'être.
            expect(onSubmitCalled).toBe(0); //Le onSubmit ne doit pas avoir été appelé puisqu'un champ requis est manquant.
            expect(screen.getByText(msg.error.notNull));
        });

        it("Les alertes sur les champs requis apparaissent et disparaissent correctement", async () => {
            render(<SxFormNoPending
                fieldDefinitions={[{
                    name: "typeText", id: 0, enabled: true, label: "Champ texte", type: SxFieldTypes.Text, isMandatory: true,
                    validation: async (newValue, _data) => {
                        if (newValue === "test") {
                            return { valid: false, message: "lancer erreur" }
                        }
                        return true;
                    }
                },
                { name: "typeText2", id: 1, enabled: true, label: "Champ texte 2", type: SxFieldTypes.Text, isMandatory: true }]}
                data={{ typeText: "", typeText2: "initial value" }}
                {...baseProps}
                onSubmit={() => { return true; }}
            />);

            const textField1 = await screen.findByLabelText("Champ texte");
            fireEvent.change(textField1, { target: { value: "test" } });
            fireEvent.blur(textField1);
            expect(await screen.findByText('lancer erreur')).toBeVisible();

            fireEvent.change(textField1, { target: { value: "value" } });
            fireEvent.blur(textField1);
            await waitFor(() => expect(screen.queryByText('lancer erreur')).toBeNull());

            const textField2 = await screen.findByLabelText("Champ texte 2");
            fireEvent.change(textField2, { target: { value: "" } });
            fireEvent.blur(textField2);
            expect(await screen.findByText(msg.error.notNull)).toBeVisible();

            fireEvent.change(textField2, { target: { value: "value" } });
            fireEvent.blur(textField2);
            await waitFor(() => expect(screen.queryByText(msg.error.notNull)).toBeNull());
        });

        it("Show alert when the tab has error with mandatory field", async () => {
            render(<SxFormNoPending
                fieldDefinitions={[{
                    id: 1, tabName: "Onglet 1",
                    fields: [{ name: "typeText", id: 1, enabled: true, label: "Champ texte", type: SxFieldTypes.Text, },
                    { name: "typeText2", id: 2, enabled: true, label: "Champ texte 2", type: SxFieldTypes.Text, isMandatory: true }]
                }]}
                data={{ typeText: "Champ texte" }}
                {...baseProps}
            />);

            const textField = await screen.findByLabelText("Champ texte 2");
            fireEvent.change(textField, { target: { value: "" } });
            fireEvent.blur(textField);

            expect(await screen.findByText(msg.error.notNull));
            const alertTab = await screen.findByText("Onglet 1");
            expect(await findByRole(alertTab, "alert")).toBeVisible();
        });

        it("Les validation des champs sont appelé onBlur et onSubmit", async () => {
            let onSubmitCalled = 0;
            let valCalled = 0;
            let newVal = "";
            let formDt = {};
            let extDtVal = "";
            render(<SxFormNoPending
                fieldDefinitions={[{
                    name: "typeText", id: 0, enabled: true, label: "Champ texte", type: SxFieldTypes.Text, validation: (newValue, formData, externalData) => {
                        valCalled++;
                        newVal = newValue;
                        formDt = formData;
                        extDtVal = externalData.test;
                        return true;
                    }
                },
                { name: "typeText2", id: 1, enabled: true, label: "Champ texte 2", type: SxFieldTypes.Text, }]}
                data={{ typeText: "Original Val", typeText2: "Original Val 2" }}
                {...baseProps}
                onSubmit={() => { onSubmitCalled++; return true; }}
                externalData={{ test: "extDataTest" }}
            />);
            //Nous faisons un changement bidon
            const textField = await screen.findByLabelText("Champ texte");
            fireEvent.change(textField, { target: { value: "New Value" } });
            fireEvent.blur(textField);

            await waitFor(() => valCalled === 1); //Nous attendons que la validation onBlur ai été exécuté.
            expect(valCalled).toBe(1); //La validation doit avoir été appelé onBlur
            expect(newVal).toBe("New Value");
            expect(formDt["typeText2"]).toBe("Original Val 2");
            expect(extDtVal).toBe("extDataTest");

            //Nous effectuons un click sur le bouton Sauvegarder
            const saveBtn = screen.getByText(msg.button.submit);
            fireEvent.click(saveBtn);

            await waitFor(() => onSubmitCalled !== 0 && valCalled === 2); //Nous attendons que la valeur de la variable ai été changé.
            expect(onSubmitCalled).toBe(1);
            expect(valCalled).toBe(2); //La validation doit avoir été appelé onBlur et onSubmit
            expect(newVal).toBe("Original Val"); //Comme il s'agit d'un test et que la valeur passé en props n'est pas changé, lors du second dans la validation (onSubmit) il est normal que la valeur soit revenu à celle d'origine.
            expect(formDt["typeText2"]).toBe("Original Val 2");
            expect(extDtVal).toBe("extDataTest");
        });

        it("Les validations en erreur affiche le message et bloque la sauvegarde", async () => {
            render(<SxFormNoPending
                fieldDefinitions={[{
                    name: "typeText", id: 1, enabled: true, label: "Champ texte", type: SxFieldTypes.Text, validation: (newValue, formData, externalData) => {
                        return { valid: false, message: "Error in typeText" };
                    }
                }]}
                data={{ typeText: "Champ texte" }}
                {...baseProps}
            />);
            //Nous faisons un changement bidon
            const textField = await screen.findByLabelText("Champ texte");
            fireEvent.change(textField, { target: { value: "New Value" } });
            fireEvent.blur(textField);
            //Nous effectuons un click sur le bouton Sauvegarder
            const saveBtn = screen.getByText(msg.button.submit).closest("button");
            await waitFor(() => expect(saveBtn).toBeDisabled());
            expect(saveBtn).toBeDisabled();
            expect(screen.getByText("Error in typeText")).toBeInTheDocument();
        });

        it("Show alert when the tab has error with field validation", async () => {
            render(<SxFormNoPending
                fieldDefinitions={[{
                    id: 0, tabName: "Onglet 1",
                    fields: [{
                        name: "typeText", id: 1, enabled: true, label: "Champ texte", type: SxFieldTypes.Text, validation: (newValue, formData, externalData) => {
                            return { valid: false, message: "Error in typeText" };
                        }
                    }]
                }]}
                data={{ typeText: "Champ texte" }}
                {...baseProps}
            />);

            const textField = await screen.findByLabelText("Champ texte");
            fireEvent.change(textField, { target: { value: "New Value" } });
            fireEvent.blur(textField);

            //Nous effectuons un click sur le bouton Sauvegarder
            const saveBtn = screen.getByText(msg.button.submit).closest("button");
            await waitFor(() => expect(saveBtn).toBeDisabled());
            expect(saveBtn).toBeDisabled();
            expect(screen.getByText("Error in typeText")).toBeInTheDocument();
            const alertTab = await screen.findByText("Onglet 1");
            expect(await findByRole(alertTab, "alert")).toBeVisible();
        });

        it("Les validations en avertissement affiche le message et ne bloque pas la sauvegarde", async () => {
            render(<SxFormNoPending
                fieldDefinitions={[{
                    name: "typeText", id: 1, enabled: true, label: "Champ texte", type: SxFieldTypes.Text,
                    validation: (newValue, formData, externalData) => {
                        return { valid: true, message: "Warning in typeText" };
                    }
                }]}
                data={{ typeText: "Champ texte" }}
                {...baseProps}
            />);
            //Nous faisons un changement bidon
            const textField = await screen.findByLabelText("Champ texte");
            fireEvent.change(textField, { target: { value: "New Value" } });
            fireEvent.blur(textField);
            //Nous effectuons un click sur le bouton Sauvegarder
            const saveBtn = screen.getByText(msg.button.submit).closest("button");
            await waitFor(() => expect(saveBtn).not.toBeDisabled());
            expect(saveBtn).not.toBeDisabled();
            expect(screen.getByText("Warning in typeText")).toBeInTheDocument();
        });

        it("Les validations en cours provoque une désactivation du bouton de sauvegarde.", async () => {
            render(<SxFormNoPending
                fieldDefinitions={[{
                    name: "typeText", id: 0, enabled: true, label: "Champ texte", type: SxFieldTypes.Text, validation: async (newValue, formData, externalData) => {
                        function timeout(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
                        await timeout(400); //Nous provoquons un délai dans la validation pour laisser le temps de valider que le bouton est bien désactivé.
                        return true;
                    }
                }, { name: "typeText2", id: 1, enabled: true, label: "Champ texte 2", type: SxFieldTypes.Text, }]}
                data={{ typeText: "Champ texte" }}
                {...baseProps}
            />);
            //Nous faisons un changement bidon pour rendre le bouton de sauvegarde enabled.
            const textField2 = await screen.findByLabelText("Champ texte 2");
            fireEvent.change(textField2, { target: { value: "New Value 2" } });
            fireEvent.blur(textField2);

            const saveBtn = screen.getByText(msg.button.submit).closest("button");
            await waitFor(() => expect(saveBtn).not.toBeDisabled());
            expect(saveBtn).not.toBeDisabled(); //Nous validons que le bouton de sauvegarde est désactiver le temps de la validation.

            //Nous faisons un changement sur le champ avec la validation
            const textField = screen.getByLabelText("Champ texte");
            fireEvent.change(textField, { target: { value: "New Value" } });
            fireEvent.blur(textField);

            await waitFor(() => expect(saveBtn).toBeDisabled());
            expect(saveBtn).toBeDisabled(); //Nous validons que le bouton de sauvegarde est désactiver le temps de la validation.

            await waitFor(() => expect(saveBtn).not.toBeDisabled()); //Le bouton sera re-enabled une fois la validation terminé.
            expect(saveBtn).not.toBeDisabled();
        });

        it("Le chainage des validations est fonctionnel", async () => {
            let val1Called = false;
            let val2Called = false;
            render(<SxFormNoPending
                fieldDefinitions={[{
                    name: "typeText", id: 0, enabled: true, label: "Champ texte", type: SxFieldTypes.Text, validation: (newValue, formData, externalData) => {
                        val1Called = true;
                        return { valid: true, otherFields: ['typeText2'] };
                    }
                }, { name: "typeText2", id: 1, enabled: true, label: "Champ texte 2", type: SxFieldTypes.Text, validation: (newValue, formData, externalData) => { val2Called = true; return true; } }]}
                data={{ typeText: "Champ texte" }}
                {...baseProps}
            />);
            //Nous faisons un changement sur le champ avec la validation de base
            const textField = await screen.findByLabelText("Champ texte");
            fireEvent.change(textField, { target: { value: "New Value" } });
            fireEvent.blur(textField);

            await waitFor(() => val1Called && val2Called); //Nous validons que la première validation a été appelé.
            expect(val1Called).toBe(true);
            expect(val2Called).toBe(true);
        });

        it("Le chainage des validations en cours provoque une désactivation puis une activation du bouton de sauvegarde", async () => {
            render(<SxFormNoPending
                fieldDefinitions={[
                    {
                        name: "typeText", id: 0, enabled: true, label: "Champ texte", type: SxFieldTypes.Text, validation: (newValue, formData, externalData) => {
                            return { valid: true, otherFields: ['typeText2', 'typeText3'] };
                        }
                    },
                    {
                        name: "typeText2", id: 1, enabled: true, label: "Champ texte 2", type: SxFieldTypes.Text, validation: (newValue, formData, externalData) => {
                            return true;
                        }
                    },
                    {
                        name: "typeText3", id: 2, enabled: true, label: "Champ texte 3", type: SxFieldTypes.Text, validation: async (newValue, formData, externalData) => {
                            function timeout(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
                            await timeout(500); //Nous provoquons un délai dans la validation pour laisser le temps de valider que le bouton est bien désactivé.
                            return true;
                        }
                    },
                ]}
                data={{ typeText: "Champ texte" }}
                {...baseProps}
            />);

            //Nous faisons un changement sur le champ avec la validation de base
            const textField = await screen.findByLabelText("Champ texte");
            fireEvent.change(textField, { target: { value: "New Value" } });
            fireEvent.blur(textField);

            // Vérification que le bouton de sauvegarde est désactivé
            const saveBtn = screen.getByText(msg.button.submit).closest("button");
            await waitFor(() => expect(saveBtn).toBeDisabled());
            expect(saveBtn).toBeDisabled();

            // Vérification que le bouton de sauvegarde est réactivé
            await waitFor(() => expect(saveBtn).not.toBeDisabled());
            expect(saveBtn).not.toBeDisabled();
        });

        it("L'action est exécutée uniquement lorsque la validation passe mais le actionOnFail est appelé", async () => {
            var actionCalled = false;
            var actionOnFailCalled = false;

            render(<SxFormDataWrap
                fieldDefinitions={[
                    {
                        name: "typeText", id: 0, enabled: true, label: "Champ texte", type: SxFieldTypes.Text,
                        validation: (newValue, _formData, _externalData) => {
                            if (newValue === 'error') {
                                return { valid: false, message: "ERREUR!" };
                            }
                        },
                        action: (_newValue, _formData, _externalData) => {
                            actionCalled = true;
                        },
                        actionOnFail: (_newValue, _formData, _externalData) => {
                            actionOnFailCalled = true;
                        },
                    },
                ]}
                data={{ typeText: "Champ texte" }}
                {...baseProps}
            />);

            const textField = await screen.findByLabelText("Champ texte");
            fireEvent.change(textField, { target: { value: "error" } });
            fireEvent.blur(textField);

            await waitFor(() => { expect(actionOnFailCalled).toBe(true) });
            await waitFor(() => { expect(actionCalled).toBe(false) });
            expect(await screen.findByText("ERREUR!"));
        });

        it("La valeur du champ cible d'une action est changé même si la validation du champ cible ne passe pas.", async () => {
            render(<SxFormDataWrap
                fieldDefinitions={[
                    {
                        name: "typeText", id: 0, enabled: true, label: "Champ texte", type: SxFieldTypes.Text,
                        action: (newValue, _formData, _externalData) => {
                            return { typeText2: newValue };
                        }
                    },
                    {
                        name: "typeText2", id: 1, enabled: true, label: "Champ texte 2", type: SxFieldTypes.Text,
                        validation: (newValue, _formData, _externalData) => {
                            if (newValue === 'error') {
                                return { valid: false, message: "ERREUR!" };
                            }
                            return true;
                        },
                    },
                ]}
                data={{ typeText: "Champ texte" }}
                {...baseProps}
            />);

            const textField = await screen.findByLabelText("Champ texte");
            fireEvent.change(textField, { target: { value: "error" } });
            fireEvent.blur(textField);

            expect(await screen.findByText("ERREUR!"));
            const textField2 = await screen.findByLabelText("Champ texte 2");
            expect(textField2.value).toBe("error");
        });

        it("Tentative de boucle d'actions infinie", async () => {
            let msgError = "Action function : Infinite loop attempt on field 'typeText'";

            render(<SxFormDataWrap
                fieldDefinitions={[
                    {
                        name: "typeText", id: 0, enabled: true, label: "Champ texte", type: SxFieldTypes.Text, validation: (newValue, formData, externalData) => {
                            return true;
                        },
                        action: (newValue, _formValues, _externalData) => {
                            return { typeText2: newValue };
                        }
                    },
                    {
                        name: "typeText2", id: 1, enabled: true, label: "Champ texte 2", type: SxFieldTypes.Text, validation: (newValue, formData, externalData) => {
                            return true;
                        },
                        action: (newValue, _formValues, _externalData) => {
                            return { typeText: newValue };
                        }
                    },
                ]}
                data={{ typeText: "Champ texte" }}
                {...baseProps}
            />);

            //Nous faisons un changement sur le champ avec la validation de base
            const textField = await screen.findByLabelText("Champ texte");
            fireEvent.change(textField, { target: { value: "New Value" } });
            fireEvent.blur(textField);

            // Vérification de l'erreur en console
            await waitFor(() => utHelpers.console.getErrors().includes(msgError));
            expect(utHelpers.console.getErrors().includes(msgError)).toBe(true);
        });
    });

    describe("Fonctionnement correct des propriétés calculées d'un field definition", () => {
        it("un isHidden calculé fait apparaitre et disparaitre un champ aux bons moments", async () => {
            render(<SxFormDataWrap
                fieldDefinitions={[
                    {
                        name: "typeText",
                        id: 0,
                        enabled: true,
                        label: "Champ texte",
                        type: SxFieldTypes.Text,
                        isHidden: (_fd, _val, data, _extData) => data.typeText2 === "hideField1"
                    },
                    {
                        name: "typeText2",
                        id: 1,
                        enabled: true,
                        label: "Champ texte 2",
                        type: SxFieldTypes.Text,
                    },
                ]}
                data={{ typeText: "Champ texte", typeText2: "DontHideField1" }}
                {...baseProps}
            />);

            const textField2 = await screen.findByLabelText("Champ texte 2");
            fireEvent.change(textField2, { target: { value: "hideField1" } });
            fireEvent.blur(textField2);

            const textField1 = screen.queryByLabelText('Champ texte');
            expect(textField1).not.toBeInTheDocument();
        });

        it("un type calculé transforme le champ aux bons moments", async () => {
            render(<SxFormDataWrap
                fieldDefinitions={[
                    {
                        name: "typeText",
                        id: 0,
                        enabled: true,
                        label: "Champ texte",
                        type: (_fd, _val, data, _extData) => data.typeText2 === "text" ? SxFieldTypes.Text : SxFieldTypes.Number
                    },
                    {
                        name: "typeText2",
                        id: 1,
                        enabled: true,
                        label: "Champ texte 2",
                        type: SxFieldTypes.Text,
                    },
                ]}
                data={{ typeText: "Champ texte", typeText2: "NotText" }}
                {...baseProps}
            />);

            await screen.findByLabelText("Champ texte");

            expect(screen.getByLabelText('Champ texte').getAttribute("type")).toBe("number");

            const textField2 = await screen.findByLabelText("Champ texte 2");
            fireEvent.change(textField2, { target: { value: "text" } });
            fireEvent.blur(textField2);

            expect(screen.getByLabelText('Champ texte').getAttribute("type")).toBe("text");
        });
    });

    describe("Test de l'appel à updateData du composant parent lors de onBlur d'un composant enfant de type INPUT", () => {

        const genericDataValue = 1;

        const fieldDefinitions = [{
            id: 1,
            name: "genericData",
            label: "Generic Data",
            type: SxFieldTypes.Number,
            minValue: 0,
            validation: (_newValue, _formValues, _externalData) => {
                return {
                    valid: true
                };
            }
        }];

        const ParentComponent = (props) => {

            let [data, setData] = useState({ genericData: genericDataValue });

            const updateData = jest.fn((fieldDef, newValue, _newFormData) => {
                setData({ ...data, [fieldDef.name]: newValue });
                props?.callback({ fieldName: fieldDef.name, newValue });
            });

            const restProps = {
                onSubmit: () => { },
                onCancel: () => { },
                onSubmitSuccess: () => { },
                updateData: updateData,
                onResetImage: () => { },
                onSaveImage: () => { },
                cancelDelegator: () => { },
                success: true,
            };

            const formData = {
                genericData: data.genericData
            };

            return (<SxFormNoPending
                fieldDefinitions={fieldDefinitions}
                data={formData}
                {...restProps}
            />);
        };

        it("Changer de valeur: ", async () => {
            const callback = jest.fn();

            render(<ParentComponent callback={callback} />);

            let inputField = await screen.findByLabelText("Generic Data");

            expect(inputField).toBeInTheDocument();
            expect(inputField.value).toBe(genericDataValue.toString());

            const newValue = genericDataValue + 1;
            fireEvent.change(inputField, { target: { value: newValue } });
            expect(inputField.value).toBe(newValue.toString());

            fireEvent.blur(inputField);
            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenNthCalledWith(1, { fieldName: "genericData", newValue: newValue });
        });
    });
});
