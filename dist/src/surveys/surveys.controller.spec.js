"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const surveys_controller_1 = require("./surveys.controller");
describe('SurveysController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [surveys_controller_1.SurveysController],
        }).compile();
        controller = module.get(surveys_controller_1.SurveysController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=surveys.controller.spec.js.map