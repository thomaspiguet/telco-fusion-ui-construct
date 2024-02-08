import { sxFieldTypesHelpersFromString, sxFieldTypesHelpersToString } from './SxFormField.types.helpers';


/// Suite de tests.
describe("SxFormField.types.helpers", () => {
    describe("sxFieldTypesHelpersFromString", () => {
        describe(".string()", () => {
            it("Valid", () => {
                //Arrange
                const expectedString = "String vers le type String.";

                //Act
                const result = sxFieldTypesHelpersFromString.string(expectedString);

                //Assert
                expect(typeof result).toBe('string');
                expect(result).toBe(expectedString);
            });
        });

        describe(".stringList()", () => {
            it("Invalid undefined", () => {
                //Arrange
                //Act
                const result = sxFieldTypesHelpersFromString.stringList(undefined);

                //Assert
                expect(typeof result === 'undefined').toBe(true);
                expect(result === undefined).toBe(true);
            });

            it("Invalid null", () => {
                //Arrange
                //Act
                const result = sxFieldTypesHelpersFromString.stringList(null);

                //Assert
                expect(typeof result === 'object').toBe(true);
                expect(result === null).toBe(true);
            });

            it("Valid", () => {
                //Arrange
                const expectedString1 = "String vers le type stringList 1.";
                const expectedString2 = "String vers le type stringList 2.";
                const expectedString3 = "String vers le type stringList 3.";
                const inputString = `${expectedString1},${expectedString2},${expectedString3}`;
                const expectedStringList = [
                    expectedString1,
                    expectedString2,
                    expectedString3,
                ];

                const result = sxFieldTypesHelpersFromString.stringList(inputString);

                //Assert
                expect(Array.isArray(result)).toBe(true);
                expect(result).toStrictEqual(expectedStringList);
            });
        });
    });

    describe("sxFieldTypesHelpersToString", () => {
        describe(".bool()", () => {
            it("Invalid undefined", () => {
                //Arrange
                //Act
                const result = sxFieldTypesHelpersToString.bool(undefined);

                //Assert
                expect(typeof result === 'undefined').toBe(true);
                expect(result === undefined).toBe(true);
            });

            it("Invalid null", () => {
                //Arrange
                //Act
                const result = sxFieldTypesHelpersToString.bool(null);

                //Assert
                expect(typeof result === 'object').toBe(true);
                expect(result === null).toBe(true);
            });

            it("Valid boolean true", () => {
                //Arrange
                const expectedString = "true";

                //Act
                const result = sxFieldTypesHelpersToString.bool(true);

                //Assert
                expect(typeof result).toBe("string");
                expect(result).toStrictEqual(expectedString);
            });

            it("Valid boolean false", () => {
                //Arrange
                const expectedString = "false";

                //Act
                const result = sxFieldTypesHelpersToString.bool(false);

                //Assert
                expect(typeof result).toBe("string");
                expect(result).toStrictEqual(expectedString);
            });
        });

        describe(".date()", () => {
            it("Invalid undefined", () => {
                //Arrange
                //Act
                const result = sxFieldTypesHelpersToString.date(undefined);

                //Assert
                expect(typeof result === 'undefined').toBe(true);
                expect(result === undefined).toBe(true);
            });

            it("Invalid null", () => {
                //Arrange
                //Act
                const result = sxFieldTypesHelpersToString.date(null);

                //Assert
                expect(typeof result === 'object').toBe(true);
                expect(result === null).toBe(true);
            });

            it("Valid", () => {
                //Arrange
                const expectedDateString = "2011-10-09T14:13:12.001Z";

                //Act
                const result = sxFieldTypesHelpersToString.date(new Date(expectedDateString));

                //Assert
                expect(typeof result).toBe('string');
                expect(result).toBe(expectedDateString);
            });
        });

        describe(".number()", () => {
            it("Invalid undefined", () => {
                //Arrange
                //Act
                const result = sxFieldTypesHelpersToString.number(undefined);

                //Assert
                expect(typeof result === 'undefined').toBe(true);
                expect(result === undefined).toBe(true);
            });

            it("Invalid null", () => {
                //Arrange
                //Act
                const result = sxFieldTypesHelpersToString.number(null);

                //Assert
                expect(typeof result === 'object').toBe(true);
                expect(result === null).toBe(true);
            });

            it("Valid", () => {
                //Arrange
                const expectedNumberString = "9999";

                //Act
                const result = sxFieldTypesHelpersToString.number(parseInt(expectedNumberString));

                //Assert
                expect(typeof result).toBe('string');
                expect(result).toBe(expectedNumberString);
            });
        });

        describe(".object()", () => {
            it("Invalid undefined", () => {
                // Arrange
                //Act
                const result = sxFieldTypesHelpersToString.object(undefined);

                //Assert
                expect(typeof result === 'undefined').toBe(true);
                expect(result === undefined).toBe(true);
            })

            it("Invalid null", () => {
                // Arrange
                //Act
                const result = sxFieldTypesHelpersToString.object(null);

                //Assert
                expect(typeof result).toBe("string");
                expect(result).toStrictEqual("null");
            })

            it("Valid", () => {
                // Arrange
                const inputObject = { a: "a", b: "b" }

                //Act
                const result = sxFieldTypesHelpersToString.object(inputObject);

                //Assert
                expect(typeof result).toBe("string");
                expect(result).toStrictEqual(JSON.stringify(inputObject));
            });
        });

        describe(".string()", () => {
            it("Valid", () => {
                //Arrange
                const expectedString = "Du type String vers String.";

                //Act
                const result = sxFieldTypesHelpersToString.string(expectedString);

                //Assert
                expect(typeof result).toBe('string');
                expect(result).toBe(expectedString);
            });
        });

        describe(".stringList()", () => {
            it("Invalid undefined", () => {
                //Arrange
                //Act
                const result = sxFieldTypesHelpersToString.stringList(undefined);

                //Assert
                expect(typeof result === 'undefined').toBe(true);
                expect(result === undefined).toBe(true);
            });

            it("Invalid null", () => {
                //Arrange
                //Act
                const result = sxFieldTypesHelpersToString.stringList(null);

                //Assert
                expect(typeof result === 'object').toBe(true);
                expect(result === null).toBe(true);
            });

            it("Valid", () => {
                //Arrange
                const inputString1 = "List vers le string 1.";
                const inputString2 = "List vers le string 2.";
                const inputString3 = "List vers le string 3.";
                const inputList = [inputString1, inputString2, inputString3];
                const expectedString = `${inputString1},${inputString2},${inputString3}`;
                
                //Act
                const result = sxFieldTypesHelpersToString.stringList(inputList);

                //Assert
                expect(typeof result).toBe("string");
                expect(result).toStrictEqual(expectedString);
            });
        });
    });
});