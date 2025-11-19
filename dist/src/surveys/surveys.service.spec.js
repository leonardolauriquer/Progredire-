"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const surveys_service_1 = require("./surveys.service");
describe('SurveysService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [surveys_service_1.SurveysService],
        }).compile();
        service = module.get(surveys_service_1.SurveysService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=surveys.service.spec.js.map