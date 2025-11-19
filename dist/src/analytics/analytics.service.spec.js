"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const analytics_service_1 = require("./analytics.service");
describe('AnalyticsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [analytics_service_1.AnalyticsService],
        }).compile();
        service = module.get(analytics_service_1.AnalyticsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=analytics.service.spec.js.map