import sxFormHelpers from './SxForm.Helpers';

import '@testing-library/jest-dom/extend-expect';



describe("SxForm.Helpers", () => {
    describe("transformFieldDef()", () => {
        it("l'override d'un field definition est fonctionnel", async () => {
            var fieldDef = {
                id: 1,
                name: "field1",
                isHidden: (_fd, _val, data, _extData) => { if (data.field2 === "hideField1") return true; else return false; }
            };
            var data = { field1: "", field2: "hideField1" };
            var result = sxFormHelpers.transformFieldDef(fieldDef, data, {});
            expect(result.isHidden).toBe(true);

            var data2 = { field1: "", field2: "hideField1NOT" };
            var result2 = sxFormHelpers.transformFieldDef(fieldDef, data2, {});
            expect(result2.isHidden).toBe(false);
        });

        it("l'override d'un field definition est fonctionnel pour options", async () => {
            var fieldDef = {
                id: 1,
                name: "field1",
                options: (_fd, _val, _data, extData) => extData.optionsField1,
            };
            var data = { field1: "", field2: "hideField1NOT" };
            var extData = { optionsField1: ["one", "two", "three"] };
            var result2 = sxFormHelpers.transformFieldDef(fieldDef, data, extData);
            expect(result2.options[0]).toBe("one");
            expect(result2.options[1]).toBe("two");
            expect(result2.options[2]).toBe("three");
        });

        it("l'override d'un field definition ne brise pas les propriétés ne devant pas être écrasées définit globalement", async () => {
            var test = "no action done";
            var fieldDef = {
                id: 1,
                name: "field1",
                action: (_newValue, _formValues, _externalData) => { test = "Action called"}
            };
            var data = { field1: "" };
            var result = sxFormHelpers.transformFieldDef(fieldDef, data, {});
            expect(test).toBe("no action done"); //L'action n'a pas été appelé au moment de la transformation
            result.action();
            expect(test).toBe("Action called"); //Une fois appelé, l'action abien été effectué
        });

        it("l'override d'un field definition ne brise pas les propriétés ne devant pas être écrasées définit pour un chamnp précis", async () => {
            var test = "no newAction done";
            var fieldDef = {
                id: 1,
                name: "field1",
                newAction: (_newValue, _formValues, _externalData) => { test = "newAction called"},
                excludeFromTransform: ["newAction"]
            };
            var data = { field1: "" };
            var result = sxFormHelpers.transformFieldDef(fieldDef, data, {});
            expect(test).toBe("no newAction done"); //L'action n'a pas été appelé au moment de la transformation
            result.newAction();
            expect(test).toBe("newAction called"); //Une fois appelé, l'action a bien été effectué
        });

        it("l'override d'un field definition est fonctionnel pour les subFields d'une ligne", async () => {
            var fieldDef = {
                id: 1,
                name: "field1",
                fields: [
                    {
                        name: "field1.1",
                        isHidden: (_fd, _val, data, _extData) => data.field2 === "hideField1.1"
                    }
                ],
            };
            var data = { field1: "", field2: "hideField1.1" };
            var result = sxFormHelpers.transformFieldDef(fieldDef, data, {});
            expect(result.fields[0].isHidden).toBe(true);

            var data2 = { field1: "", field2: "hideField1.1NOT" };
            var result2 = sxFormHelpers.transformFieldDef(fieldDef, data2, {});
            expect(result2.fields[0].isHidden).toBe(false);
        });

        it("l'override d'un field definition est fonctionnel pour les subFields d'un tab", async () => {
            var fieldDef = {
                id: 1,
                tabs: [{
                    fields: [
                        {
                            id: 1.1,
                            name: "field1.1",
                            isHidden: (_fd, _val, data, _extData) => { if (data.field2 === "hideField1.1") return true; else return false; }
                        }
                    ],
                }]
            };
            var data = { field1: "", field2: "hideField1.1" };
            var result = sxFormHelpers.transformFieldDef(fieldDef, data, {});
            expect(result.tabs[0].fields[0].isHidden).toBe(true);

            var data2 = { field1: "", field2: "hideField1.1NOT" };
            var result2 = sxFormHelpers.transformFieldDef(fieldDef, data2, {});
            expect(result2.tabs[0].fields[0].isHidden).toBe(false);
        });

        it("les propriété d'un field peuvent toujours être définit avec une valeur directement", async () => {
            var fieldDef = {
                id: 1,
                name: "field1",
                isHidden: true
            };
            var data = { field1: "", field2: "hideField1" };
            var result = sxFormHelpers.transformFieldDef(fieldDef, data, {});
            expect(result.isHidden).toBe(true);

            var fieldDef2 = {
                id: 1,
                name: "field1",
                isHidden: false
            };
            var result2 = sxFormHelpers.transformFieldDef(fieldDef2, data, {});
            expect(result2.isHidden).toBe(false);
        });

        it("aucune erreur si fields est undefined", async () => {
            var fieldDef = {
                id: 1,
                fields: undefined,
                isHidden: true
            };
            var data = { field1: "" };
            var result = sxFormHelpers.transformFieldDef(fieldDef, data, {});
            expect(result.isHidden).toBe(true);
        });

        it("aucune erreur si tabs est undefined", async () => {
            var fieldDef = {
                id: 1,
                tabs: undefined,
                isHidden: true
            };
            var data = { field1: "" };
            var result = sxFormHelpers.transformFieldDef(fieldDef, data, {});
            expect(result.isHidden).toBe(true);
        });

        it("isMandatory ajoute une validation correctement lorsqu'il n'y a pas d'autres validations sur le champ", async () => {
            var fieldDef = {
                name: "field1",
                isMandatory: true
            };
            var data = { field1: "", field2: "hideField1.1" };
            var tFd = sxFormHelpers.transformFieldDef(fieldDef, data, {});
            var result = await tFd.validation("", data, {});
            expect(result.valid).toBe(false);
        });

        it("isMandatory sur un subField dans une ligne ajoute une validation correctement lorsqu'il n'y a pas d'autres validations sur le champ", async () => {
            var fieldDef = {
                name: "field1",
                fields: [{ name: "field11", isMandatory: true }],
            };
            var data = { field1: "", field11: "hideField1.1" };
            var tFd = sxFormHelpers.transformFieldDef(fieldDef, data, {});
            var result = await tFd.fields[0].validation("", data, {});
            expect(result.valid).toBe(false);
        });

        it("isMandatory ajoute une validation correctement lorsqu'il y a d'autres validations sur le champ", async () => {
            var fieldDef = {
                name: "field1",
                isMandatory: true,
                validation: (value, _data, _extData) => value === 'Error' ? { valid: false, message: "Oupsy" } : { valid: true },
            };
            var data = { field1: "", field2: "hideField1.1" };
            var tFd = sxFormHelpers.transformFieldDef(fieldDef, data, {});
            var result = await tFd.validation("", data, {});
            expect(result.valid).toBe(false);
            var result2 = await tFd.validation("Error", data, {});
            expect(result2.valid).toBe(false);
            var result3 = await tFd.validation("Not an Error", data, {});
            expect(result3.valid).toBe(true);
        });
    });
});
